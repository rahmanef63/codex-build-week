import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's strip-types runner requires the source extension.
import { read } from "./helpers.ts";

test("Demo owns synthetic business wiring while Real runs its own live connected app", () => {
  const root = read("app", "page.tsx");
  const demo = read("app", "demo", "page.tsx");
  const gptPackage = read("GPTs", "alfa.md");
  const globalError = read("app", "error.tsx");
  const globalSocialCard = read("app", "opengraph-image.tsx");
  const real = read("app", "real", "page.tsx");

  assert.match(root, /href="\/demo"/);
  assert.match(root, /href="\/real"/);
  assert.match(root, /Pilihan Mode Demo dan Mode Real/);
  assert.match(root, /Demo · Data sintetis/);
  assert.match(root, /Real · Terhubung langsung/);
  assert.doesNotMatch(root, /Bu Sari|ConvexClientProvider|Dashboard/);
  assert.doesNotMatch(globalError, /Bu Sari|Convex|Dashboard/);
  assert.doesNotMatch(globalSocialCard, /Bu Sari|Warung Nasi/);

  assert.match(demo, /Warung Nasi Bu Sari/);
  assert.match(demo, /ConvexClientProvider/);
  assert.match(demo, /<Dashboard \/>/);

  assert.match(real, /ConvexClientProvider/);
  assert.match(real, /RealApp/);
  assert.doesNotMatch(real, /Bu Sari/);

  assert.match(gptPackage, /## Name\s+```text\s+TemanUsaha AI\s+```/);
  const description = gptPackage.match(/## Description\s+```text\s+([\s\S]*?)```/);
  assert.ok(description, "GPTs/alfa.md must keep a ## Description text block");
  assert.match(description[1], /\S/);
  assert.match(description[1], /Mode Demo/);
  assert.match(description[1], /Mode Real/);
});
