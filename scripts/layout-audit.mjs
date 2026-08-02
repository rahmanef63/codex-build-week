// Responsive layout audit. Measures the rendered DOM instead of reading CSS:
// horizontal overflow, elements escaping the viewport, sub-44px tap targets,
// and genuine overlap between interactive elements that are not nested.
//
// Why this exists: three separate review passes read the CSS and declared the
// layout sound. This script's first run found 29 real problems, including tap
// targets down to 20px. Reading a stylesheet does not tell you what the browser
// actually painted.
//
// Playwright is deliberately NOT a dependency of this repo — it pulls a ~300MB
// browser and CI has no display. Run it ad hoc:
//
//   npm run build && npx next start -p 3162 &
//   mkdir -p /tmp/pw && cd /tmp/pw && npm i playwright && npx playwright install chromium
//   BASE=http://localhost:3162 node <repo>/scripts/layout-audit.mjs
//
// GOTCHA that will waste your afternoon: if `next build` runs while a server is
// already up, the running server keeps serving HTML that references CSS chunk
// hashes the build has replaced. Those requests 500, the page renders unstyled,
// and this script reports dozens of phantom findings (the tell is a `size-11`
// element measuring full width and ~18px tall). Always restart the server after
// a build before trusting a run.
//
// KNOWN GOOD, do not "fix": on /dashboard it reports a 44x45 overlap between
// `input.dash-input.pr-11` and the password toggle `button.absolute.right-0`.
// The input reserves exactly 44px of right padding for that button; they are
// siblings rather than nested, which is the only reason it trips the check.
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3161";
const WIDTHS = [320, 360, 768, 1024, 1440];
const ROUTES = [
  ["/", "id"], ["/?lang=fr", "fr"], ["/?lang=ja", "ja"],
  ["/setup", "-"], ["/dashboard", "-"], ["/demo", "-"],
];

const probe = () => {
  const out = { overflow: null, escapes: [], small: [], overlaps: [] };
  const vw = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > vw + 1) {
    out.overflow = { scrollWidth: document.documentElement.scrollWidth, clientWidth: vw };
  }
  const label = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" && el.className
      ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".")
      : "";
    return `${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 90);
  };
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  // Anything painting past the right edge is what makes the page scroll sideways.
  for (const el of document.querySelectorAll("body *")) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) {
      out.escapes.push({ el: label(el), left: Math.round(r.left), right: Math.round(r.right), vw });
    }
  }
  out.escapes = out.escapes.slice(0, 8);

  const INTERACTIVE = 'a[href],button,[role="button"],summary,input,select,textarea';
  const nodes = [...document.querySelectorAll(INTERACTIVE)].filter(visible);

  for (const el of nodes) {
    const r = el.getBoundingClientRect();
    // 44px is the WCAG 2.5.5 target; ignore inline links inside a paragraph,
    // which are exempt and would otherwise flood the report.
    const inline = getComputedStyle(el).display === "inline";
    if (!inline && (r.width < 44 || r.height < 44)) {
      out.small.push({ el: label(el), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  out.small = out.small.slice(0, 8);

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      if (a.contains(b) || b.contains(a)) continue; // nesting is not overlap
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (ox > 2 && oy > 2) {
        out.overlaps.push({ a: label(a), b: label(b), ox: Math.round(ox), oy: Math.round(oy) });
      }
    }
  }
  out.overlaps = out.overlaps.slice(0, 8);
  return out;
};

const browser = await chromium.launch();
let problems = 0;
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  for (const [route, loc] of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
    } catch { /* networkidle can time out on the Convex socket; measure anyway */ }
    await page.waitForTimeout(1200);
    const r = await page.evaluate(probe);
    const hits = [];
    if (r.overflow) hits.push(`OVERFLOW scrollWidth=${r.overflow.scrollWidth} > client=${r.overflow.clientWidth}`);
    for (const e of r.escapes) hits.push(`ESCAPES right=${e.right} vw=${e.vw}  ${e.el}`);
    for (const s of r.small) hits.push(`SMALL ${s.w}x${s.h}  ${s.el}`);
    for (const o of r.overlaps) hits.push(`OVERLAP ${o.ox}x${o.oy}px  ${o.a}  ><  ${o.b}`);
    if (hits.length) {
      problems += hits.length;
      console.log(`\n=== ${w}px  ${route} (${loc}) ===`);
      for (const h of hits) console.log("  " + h);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(problems ? `\nTOTAL findings: ${problems}` : "\nNo findings.");
