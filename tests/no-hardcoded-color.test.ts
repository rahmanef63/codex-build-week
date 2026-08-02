import { existsSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, test } from "vitest";

// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { read } from "../shared/testing/read-file.ts";

// Owner rule (2026-07-31): the styled surfaces are token-driven. The tweakcn
// theme-preset switcher (slices/theme-presets/) recolours the app at runtime by
// injecting `:root {…}` / `.dark {…}` blocks of custom properties. A literal
// colour in a component or in a property value is not just a style-guide nit —
// it is a rule the preset can never out-argue, so the switcher silently stops
// working for that pixel. This guard exists so that regression is a red test
// instead of a bug report six weeks later.
//
// THE RULE: no literal colour in app/**, slices/**, shared/**, components/**.
// A colour is "literal" when it is not derived from a token, i.e. a hex literal
// (#0b0b0b) or a colour function whose arguments contain no `var(--…)`.
// `color-mix(in srgb, var(--accent) 30%, transparent)` is FINE — it is built out
// of tokens and follows a preset. `oklch(0.2 0 0)` is not.
//
// THE ALLOWLIST is exactly two categories and five files, and both categories
// are verified rather than trusted — see the tests below. Widening it is the
// one thing that makes this test decorative, so each entry states why no token
// can be used there.

const ALLOWLIST: ReadonlyArray<readonly [path: string, category: "token-definitions" | "satori"]> = [
  // (a) The single stylesheet that OWNS the palette. Literals are permitted
  //     here only inside `--custom-property:` declarations — the definitions
  //     the presets override. Any literal in a property value is still a
  //     failure; that is asserted separately below.
  ["app/globals.css", "token-definitions"],

  // (b) next/og renderers. Satori rasterises outside the DOM: there is no
  //     document, no cascade, and no CSS custom properties to read, so every
  //     value it receives must be a literal. These four are the only files the
  //     ImageResponse routes reach that carry colour.
  ["app/opengraph-image.tsx", "satori"],
  ["app/(public)/demo/opengraph-image.tsx", "satori"],
  ["app/apple-icon.tsx", "satori"],
  ["slices/demo-dashboard/api/colors.ts", "satori"],
];

const allowlistedPaths = new Set(ALLOWLIST.map(([path]) => path));
const satoriPaths = ALLOWLIST.filter(([, category]) => category === "satori").map(([path]) => path);

const SCAN_ROOTS = ["app", "slices", "shared", "components"];
const SCAN_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts", ".css"];

// `app/icon.svg` and public/** are deliberately out of scope: a favicon is
// fetched as a standalone document with no parent to inherit from, and the
// presentation deck is a self-contained static artefact. Neither is reached by
// the preset switcher.
function scannedFiles(): string[] {
  const files: string[] = [];
  for (const root of SCAN_ROOTS) {
    const absolute = join(process.cwd(), root);
    if (!existsSync(absolute)) continue;
    for (const entry of readdirSync(absolute, { encoding: "utf8", recursive: true })) {
      const path = `${root}/${entry.split(sep).join("/")}`;
      if (path.includes("/node_modules/")) continue;
      if (SCAN_EXTENSIONS.some((extension) => path.endsWith(extension))) files.push(path);
    }
  }
  return files.sort();
}

// Comments are prose, not styling: app/globals.css documents the `bg-[#0b0b0b]`
// it replaced, and app/apple-icon.tsx explains why its two literals exist. The
// `[^:\w]` guard keeps `https://` out of the line-comment rule.
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:\w])\/\/[^\n]*/g, "$1");

const HEX = /#([0-9a-fA-F]+)\b/g;
const HEX_LENGTHS = new Set([3, 4, 6, 8]); // #rgb #rgba #rrggbb #rrggbbaa
const COLOR_FUNCTION = /\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix|color)\(/g;

function closingIndex(text: string, openIndex: number, open: string, close: string): number {
  let depth = 0;
  for (let index = openIndex; index < text.length; index += 1) {
    if (text[index] === open) depth += 1;
    else if (text[index] === close) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

/** Every colour value in `text` that is NOT derived from a token. */
function literalColors(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(HEX)) {
    if (HEX_LENGTHS.has(match[1].length)) found.push(match[0]);
  }
  for (const match of text.matchAll(COLOR_FUNCTION)) {
    const open = match.index + match[0].length - 1;
    const close = closingIndex(text, open, "(", ")");
    if (close < 0) continue;
    const call = text.slice(match.index, close + 1);
    // A call that reads a custom property follows the active preset. That is
    // the pattern we WANT (`color-mix(in srgb, var(--accent) 30%, transparent)`).
    if (!call.includes("var(--")) found.push(call.replace(/\s+/g, " "));
  }
  return found;
}

/** `--token: <value>;` declarations — the one place a literal belongs. */
const stripCustomProperties = (css: string) => css.replace(/--[\w-]+\s*:\s*[^;}]*/g, " ");

/** The text of every `style={{ … }}` JSX attribute, brace-matched. */
function inlineStyleBlocks(source: string): string[] {
  const blocks: string[] = [];
  for (const match of source.matchAll(/style=\{\{/g)) {
    const open = match.index + "style=".length;
    const close = closingIndex(source, open, "{", "}");
    if (close > 0) blocks.push(source.slice(open, close + 1));
  }
  return blocks;
}

/** Tailwind arbitrary values: the `…` in `bg-[…]`, `hover:text-[…]`, `ring-[…]`. */
function arbitraryUtilityValues(source: string): string[] {
  return [...source.matchAll(/-\[([^\]\s]+)\]/g)].map((match) => match[1]);
}

/**
 * Where a literal colour would actually paint something.
 *
 * CSS: everything except `--token:` definitions.
 * TS/TSX: hex anywhere (a hex has no non-colour meaning in these files), plus
 * colour functions inside `style={{…}}` and inside Tailwind arbitrary values.
 * Colour functions in plain module data are deliberately NOT swept — the theme
 * engine (slices/theme-presets/lib/tweakcn/) needs literal `oklch()` fallbacks
 * for presets that omit a token, and there is nothing more primitive for it to
 * fall back to. That is a known, documented gap: `const C = "oklch(0.2 0 0)"`
 * used from another module would slip through, while `"#333"` would not.
 */
function offendingColors(path: string, source: string): string[] {
  const text = stripComments(source);
  if (path.endsWith(".css")) return literalColors(stripCustomProperties(text));
  const found = literalColors(text).filter((value) => value.startsWith("#"));
  for (const region of [...inlineStyleBlocks(text), ...arbitraryUtilityValues(text)]) {
    found.push(...literalColors(region));
  }
  return [...new Set(found)];
}

describe("styled surfaces stay token-driven so the theme presets can recolour them", () => {
  test("the sweep actually reaches the styled surfaces", () => {
    const files = scannedFiles();
    // A walker that silently returns nothing is a test that always passes — and
    // a whole scan root going missing has to be louder than a shrinking total,
    // so every root is asserted on its own.
    for (const root of SCAN_ROOTS) {
      expect(
        files.filter((path) => path.startsWith(`${root}/`)).length,
        `no files scanned under ${root}/ — did the scan root move or the walker break?`,
      ).toBeGreaterThan(5);
    }
    for (const sentinel of [
      "app/globals.css", // the palette
      "app/(public)/page.tsx", // Zone B, public
      "slices/real-dashboard/components/dashboard-shell.tsx", // Zone B, workspace
      "slices/demo-dashboard/components/dashboard.tsx", // Zone A
      "shared/components/mode-nav-bar.tsx", // shared chrome
      "components/ui/button.tsx", // shadcn primitives
    ]) {
      expect(files, `${sentinel} is not being scanned`).toContain(sentinel);
    }
  });

  test("no hardcoded color outside the allowlist", () => {
    const leaks: string[] = [];
    for (const path of scannedFiles()) {
      if (allowlistedPaths.has(path)) continue;
      const found = offendingColors(path, read(...path.split("/")));
      if (found.length) leaks.push(`${path}: ${found.join(", ")}`);
    }
    expect(
      leaks,
      `hardcoded color(s) in the styled surfaces. Use a token (var(--x) in CSS, a ` +
        `Tailwind token utility such as bg-canvas/bg-card/text-foreground in JSX) so the ` +
        `theme-preset switcher can recolour it. Do NOT widen the allowlist in ` +
        `tests/no-hardcoded-color.test.ts to silence this:\n${leaks.join("\n")}`,
    ).toEqual([]);
  });

  test("app/globals.css keeps every literal inside a custom-property definition", () => {
    // This is the (a) half of the allowlist, verified rather than trusted. A
    // literal in a PROPERTY VALUE here is the worst case of all: `.dark body {
    // background: #0b0b0b }` outranks every custom property a preset can write,
    // so the preset loses on that element no matter what it declares.
    const source = stripComments(read("app", "globals.css"));
    expect(
      literalColors(stripCustomProperties(source)),
      "app/globals.css has a literal color in a property value. Move it to a " +
        "`--token:` definition and reference it with var(--token) — a rule that " +
        "holds a literal can never be overridden by a theme preset.",
    ).toEqual([]);
    // And the exemption is worth something only if the definitions exist.
    expect(literalColors(source).length, "app/globals.css defines no color tokens").toBeGreaterThan(20);
  });

  test("every Satori exemption is a file the next/og renderers actually reach", () => {
    // This is the (b) half, verified rather than trusted: "it renders through
    // Satori" has to be a fact about the module graph, not a claim in a comment.
    // Barrel files make the closure wider than the strict truth, so this proves
    // containment (nothing in slices/real-dashboard or app/(public)/page.tsx can
    // ever be claimed as Satori) rather than exactness.
    const sources = new Map(scannedFiles().map((path) => [path, read(...path.split("/"))]));
    sources.set("app/api/dashboard-card-image/route.tsx", read("app", "api", "dashboard-card-image", "route.tsx"));

    const resolve = (specifier: string, from: string): string | undefined => {
      const base = specifier.startsWith("@/")
        ? specifier.slice(2)
        : specifier.startsWith(".")
          ? join(from.split("/").slice(0, -1).join("/"), specifier).split(sep).join("/")
          : undefined;
      if (!base) return undefined;
      for (const candidate of [base, ...SCAN_EXTENSIONS.flatMap((e) => [`${base}${e}`, `${base}/index${e}`])]) {
        if (sources.has(candidate)) return candidate;
      }
      return undefined;
    };

    const seeds = [...sources].filter(([, source]) => source.includes('"next/og"')).map(([path]) => path);
    expect(seeds.length, "no file imports next/og — has the OG pipeline moved?").toBeGreaterThan(0);

    const reachable = new Set(seeds);
    const queue = [...seeds];
    while (queue.length) {
      const path = queue.shift()!;
      for (const match of (sources.get(path) ?? "").matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) {
        const target = resolve(match[1], path);
        if (target && !reachable.has(target)) {
          reachable.add(target);
          queue.push(target);
        }
      }
    }

    for (const path of satoriPaths) {
      expect(
        reachable.has(path),
        `${path} is allowlisted as a next/og (Satori) renderer but nothing that imports ` +
          `next/og reaches it. Either it is not a Satori file — in which case it must use ` +
          `tokens — or the OG module graph changed.`,
      ).toBe(true);
    }
  });

  test("the allowlist has no stale entries", () => {
    // A path that no longer exists grants an exemption to nothing and hides the
    // fact that the allowlist was never re-read.
    const files = new Set(scannedFiles());
    for (const [path] of ALLOWLIST) {
      expect(files.has(path), `allowlisted file ${path} no longer exists — drop the entry`).toBe(true);
      // Measured on the raw file, not through offendingColors(): globals.css is
      // exempt precisely because its literals sit in `--token:` definitions,
      // which offendingColors() strips before counting.
      expect(
        literalColors(stripComments(read(...path.split("/")))).length,
        `${path} no longer contains any hardcoded color — drop its allowlist entry`,
      ).toBeGreaterThan(0);
    }
  });
});
