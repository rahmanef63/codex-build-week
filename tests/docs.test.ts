import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { read } from "../shared/testing/read-file.ts";

const guides = ["no-coding.md", "vibe-coder.md", "developer.md", "agent-builder.md", "platform-operations.md"];

test("docs provide a distinct guide for every onboarding background", () => {
  const index = read("docs", "README.md");
  for (const guide of guides) {
    expect(existsSync(join(process.cwd(), "docs", guide)), `${guide} is missing`).toBe(true);
    expect(index).toContain(`(${guide})`);
  }
});

test("web and repository documentation default to polished English", () => {
  const content = [
    read("app", "(public)", "docs", "page.tsx"),
    read("app", "(public)", "docs", "docs-explorer.tsx"),
    read("docs", "README.md"),
    ...guides.map((guide) => read("docs", guide)),
  ].join("\n");

  expect(content).toContain("One backend. A learning path that fits you.");
  expect(content).toContain("What is your coding background?");
  expect(content).not.toMatch(/\b(?:Anda|Baca|Buka|Jalur|Mulai|Panduan|Pilih|Tanpa)\b/);
});

test("interactive docs expose a three-step wizard and clickable endpoint contracts", () => {
  const explorer = read("app", "(public)", "docs", "docs-explorer.tsx");
  expect(explorer).toMatch(/^"use client"/);
  expect(explorer).toMatch(/Onboarding wizard/);
  expect(explorer).toMatch(/Onboarding progress/);
  expect(explorer).toMatch(/wizardStep === 3/);
  expect(explorer).toMatch(/aria-pressed=\{active\}/);
  expect(explorer).toMatch(/confirmation|konfirmasi eksplisit/i);

  const backend = read("convex", "agent_routes.ts");
  for (const block of backend.split("http.route({").slice(1)) {
    const head = block.slice(0, block.indexOf("handler:"));
    const path = head.match(/\bpath:\s*"([^"]+)"/)?.[1];
    const prefix = head.match(/\bpathPrefix:\s*"([^"]+)"/)?.[1];
    const documentedPath = path ?? (prefix ? `${prefix.replace(/\/$/, "")}/{id}` : undefined);
    expect(documentedPath, `Unreadable route block: ${head}`).toBeTruthy();
    expect(explorer, `${documentedPath} is absent from the interactive diagram`).toContain(documentedPath);
  }
});

test("docs are discoverable from public navigation and sitemap", () => {
  expect(read("app", "(public)", "page.tsx")).toMatch(/href="\/docs"/);
  expect(read("app", "(public)", "setup", "page.tsx")).toMatch(/href="\/docs"/);
  expect(read("app", "sitemap.ts")).toMatch(/\$\{base\}\/docs/);
});
