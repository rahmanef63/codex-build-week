import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import { getLocale, landingCopy, locales } from "../app/(public)/landing-copy";

describe("public landing localization", () => {
  test("carries the reference-build positioning in each market's own language", () => {
    // The eyebrow is the positioning line. It must be written in the locale's own
    // language rather than left as the English source string.
    expect(landingCopy.id.eyebrow).toContain("GPTs sebagai agent");
    expect(landingCopy.en.eyebrow).toContain("GPTs as your agent");
    expect(landingCopy.fr.eyebrow).toContain("les GPTs comme agent");
    expect(landingCopy.ja.eyebrow).toContain("エージェントとして");
    expect(new Set(locales.map((locale) => landingCopy[locale].eyebrow)).size).toBe(locales.length);
    expect(getLocale("unknown")).toBe("en");
  });

  test("every locale carries the same keys so no locale renders an undefined slot", () => {
    const reference = Object.keys(landingCopy.id).sort();
    for (const locale of locales) {
      expect(Object.keys(landingCopy[locale]).sort(), `${locale} copy is missing keys`).toEqual(reference);
      // The hero panel pairs these lists with fixed-length icon/label arrays in
      // page.tsx; a locale with a different count renders an empty slot.
      expect(landingCopy[locale].clients).toHaveLength(3);
      expect(landingCopy[locale].dataLabels).toHaveLength(3);
      expect(landingCopy[locale].benefits).toHaveLength(3);
      expect(landingCopy[locale].facts).toHaveLength(3);
      // The worked-example strip (`metrics`) moved to /demo; the panel now ends
      // with a single localized pointer, which must not render as an empty line.
      expect(landingCopy[locale].examplePointer.trim().length, `${locale} pointer is empty`).toBeGreaterThan(0);
    }
  });

  test("keeps the short-height responsive contract", () => {
    const page = readFileSync("app/(public)/page.tsx", "utf8");
    expect(page).toMatch(/max-height:700px/);
    // The hero visual is now a code-drawn architecture panel instead of a fixed
    // 16/9 image, so the short-viewport guard is the panel tightening its own
    // padding rather than an aspect ratio.
    expect(page).toMatch(/<figure[^>]*aria-labelledby="architecture-label"/);
    expect(page).toMatch(/max-height:700px\)\]:p-3/);
    expect(page).toMatch(/alternates:/);
    expect(page).toMatch(/languages:\s*\{\s*en:/);
  });

  test("uses English for the document-level default", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    const proxy = readFileSync("proxy.ts", "utf8");
    const dashboard = readFileSync("app/(workspace)/dashboard/page.tsx", "utf8");
    const dashboardApp = readFileSync("slices/real-dashboard/components/dashboard-app.tsx", "utf8");
    const modeNav = readFileSync("shared/components/mode-nav-bar.tsx", "utf8");
    expect(layout).toMatch(/<html lang="en"/);
    expect(layout).toMatch(/locale: "en_US"/);
    expect(proxy).toMatch(/localeFromCountry\(request\.headers\.get\("x-vercel-ip-country"\)/);
    expect(proxy).toMatch(/LOCALE_VARY = "Cookie, x-vercel-ip-country"/);
    expect(dashboard).toMatch(/isLocale\(requested\) \? requested : isLocale\(stored\) \? stored : localeFromCountry/);
    expect(dashboard).toMatch(/resolved === "id" \? "id" : "en"/);
    expect(dashboardApp).toContain('text("Demo project preview guest", "Tamu pratinjau proyek demo")');
    expect(modeNav).toContain('href="/dashboard?lang=en"');
    expect(modeNav).toContain('href="/dashboard?lang=id"');
  });
});
