import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import { getLocale, landingCopy } from "../app/(public)/landing-copy";

describe("public landing localization", () => {
  test("uses market-appropriate small-business terminology", () => {
    expect(landingCopy.id.eyebrow).toContain("UMKM");
    expect(landingCopy.en.eyebrow).toContain("MSME");
    expect(landingCopy.fr.eyebrow).toContain("TPE et PME");
    expect(landingCopy.ja.eyebrow).toContain("中小企業・小規模事業者");
    expect(getLocale("unknown")).toBe("id");
  });

  test("keeps the short-height responsive contract", () => {
    const page = readFileSync("app/(public)/page.tsx", "utf8");
    expect(page).toMatch(/max-height:700px/);
    expect(page).toMatch(/aspect-\[16\/9\]/);
    expect(page).toMatch(/alternates:/);
    expect(page).toMatch(/languages:\s*\{\s*id:/);
  });
});
