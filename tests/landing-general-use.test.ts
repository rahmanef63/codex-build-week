import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { landingCopy, locales } from "../app/(public)/landing-copy";
// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { read } from "../shared/testing/read-file.ts";

// Owner rule (2026-07-31): there are exactly two zones.
//   Zone A — the worked example (warung, Bu Sari, Bu Rina, nasi ayam, es teh,
//            Rp55.000) lives ONLY in /demo, public/presentation/**, and the
//            Convex seed.
//   Zone B — the product surface (public landing + the signed-in dashboard) is a
//            general-purpose personal assistant: zero food, zero warung.
// This guard pins BOTH halves, so the leak can never be "fixed" by deleting the
// example instead of relocating it.

// Matched case-insensitively. The word-boundary forms are regexes on purpose:
// a bare `includes("nasi")` would also fire on unrelated words, and a bare
// `includes("ayam")` on "pembayaran"-shaped strings.
const exampleVocabulary: ReadonlyArray<readonly [string, RegExp]> = [
  ["warung", /\bwarung/i],
  ["nasi", /\bnasi\b/i],
  ["ayam", /\bayam\b/i],
  ["es teh", /\bes teh\b/i],
  ["Bu Rina", /\bBu Rina\b/i],
  ["Bu Sari", /\bBu Sari\b/i],
  ["Rp55", /Rp\s?55/i],
];

// Before the example moved to /demo, each landing locale carried its own
// translation of it. Those strings never existed in the Indonesian-only demo or
// deck, so this list is absence-only — there is no surface to relocate them to.
const translatedExampleVocabulary = [
  "chicken rice", "iced tea", "Rp55,000", // en
  "riz au poulet", "poulet", "glacé", "55 000 Rp", // fr
  "鶏飯", "アイスティー", "ワルン", "屋台", // ja
];

// The public product surface: the landing itself plus the shell and the static
// pages a visitor reaches from it. The social card matters as much as the page —
// it is the copy that gets pasted into a chat window.
const landingSources = {
  "app/(public)/landing-copy.ts": read("app", "(public)", "landing-copy.ts"),
  "app/(public)/page.tsx": read("app", "(public)", "page.tsx"),
  "app/layout.tsx": read("app", "layout.tsx"),
  "app/opengraph-image.tsx": read("app", "opengraph-image.tsx"),
  "app/(public)/setup/page.tsx": read("app", "(public)", "setup", "page.tsx"),
  "app/(public)/privacy/page.tsx": read("app", "(public)", "privacy", "page.tsx"),
  "app/(public)/terms/page.tsx": read("app", "(public)", "terms", "page.tsx"),
};

// The demo route plus the slice it mounts: this is the copy a visitor to /demo
// actually reads.
const demoSurface = [
  read("app", "(public)", "demo", "page.tsx"),
  read("app", "(public)", "demo", "opengraph-image.tsx"),
  read("slices", "demo-dashboard", "components", "dashboard.tsx"),
].join("\n");

const deck = readdirSync(join(process.cwd(), "public", "presentation"))
  .filter((file) => file.endsWith(".html"))
  .map((file) => read("public", "presentation", file))
  .join("\n");

describe("landing stays general-purpose while the worked example stays in /demo", () => {
  test("no locale of the landing copy carries the worked example", () => {
    for (const locale of locales) {
      const copy = JSON.stringify(landingCopy[locale]);
      for (const [label, pattern] of exampleVocabulary) {
        expect(pattern.test(copy), `landing copy (${locale}) leaks the worked example: ${label}`).toBe(false);
      }
      for (const term of translatedExampleVocabulary) {
        expect(copy.toLowerCase().includes(term.toLowerCase()), `landing copy (${locale}) leaks: ${term}`).toBe(false);
      }
    }
  });

  test("no public product-surface file carries the worked example, including hardcoded JSX and asset paths", () => {
    for (const [file, source] of Object.entries(landingSources)) {
      for (const [label, pattern] of exampleVocabulary) {
        expect(pattern.test(source), `${file} leaks the worked example: ${label}`).toBe(false);
      }
      for (const term of translatedExampleVocabulary) {
        expect(source.toLowerCase().includes(term.toLowerCase()), `${file} leaks: ${term}`).toBe(false);
      }
    }
  });

  test("the worked example still lives in the demo route and the presentation deck", () => {
    for (const [label, pattern] of exampleVocabulary) {
      expect(pattern.test(demoSurface), `the /demo surface lost the worked example: ${label}`).toBe(true);
      expect(pattern.test(deck), `the presentation deck lost the worked example: ${label}`).toBe(true);
    }
  });

  test("the landing still points at the example instead of pretending it does not exist", () => {
    expect(landingSources["app/(public)/page.tsx"]).toMatch(/href="\/demo"/);
    expect(landingSources["app/(public)/page.tsx"]).toMatch(/copy\.examplePointer/);
    for (const locale of locales) {
      expect(landingCopy[locale].examplePointer.trim().length, `${locale} has no pointer to /demo`).toBeGreaterThan(0);
    }
  });

  test("the signed-in dashboard is domain-neutral too — Zone B is landing plus dashboard", () => {
    const root = join(process.cwd(), "slices", "real-dashboard");
    const files = readdirSync(root, { encoding: "utf8", recursive: true })
      .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = read("slices", "real-dashboard", file);
      for (const [label, pattern] of exampleVocabulary) {
        expect(pattern.test(source), `slices/real-dashboard/${file} leaks the worked example: ${label}`).toBe(false);
      }
    }
  });

  // The dashboard slice is only half of the signed-in surface. The route group
  // that mounts it — page metadata (the <meta name="description"> a visitor and
  // every crawler sees), the error boundary, and the 404 — lives in
  // app/(workspace)/ and was previously swept by nothing: the full worked
  // example could be pasted into the dashboard's meta description with the whole
  // suite staying green. Zone B is the dashboard ROUTE as well as its slice.
  test("the workspace route group is domain-neutral — metadata, error boundary and 404 included", () => {
    const root = join(process.cwd(), "app", "(workspace)");
    const files = readdirSync(root, { encoding: "utf8", recursive: true })
      .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));
    expect(files.length, "app/(workspace)/ has no route files — did the group move?").toBeGreaterThan(0);
    for (const file of files) {
      const source = read("app", "(workspace)", file);
      for (const [label, pattern] of exampleVocabulary) {
        expect(pattern.test(source), `app/(workspace)/${file} leaks the worked example: ${label}`).toBe(false);
      }
      for (const term of translatedExampleVocabulary) {
        expect(source.toLowerCase().includes(term.toLowerCase()), `app/(workspace)/${file} leaks: ${term}`).toBe(false);
      }
    }
  });
});
