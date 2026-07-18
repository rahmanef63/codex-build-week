import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8");

test("Demo owns synthetic business wiring while Root and Real stay disconnected", () => {
  const root = read("app", "page.tsx");
  const demo = read("app", "demo", "page.tsx");
  const demoError = read("app", "demo", "error.tsx");
  const gptPackage = read("GPTs", "alfa.md");
  const globalError = read("app", "error.tsx");
  const globalSocialCard = read("app", "opengraph-image.tsx");
  const real = read("app", "real", "page.tsx");

  assert.match(root, /href="\/demo"/);
  assert.match(root, /href="\/real"/);
  assert.match(root, /70 persen Demo dan 30 persen onboarding UMKM/);
  assert.match(root, /70% · Data sintetis/);
  assert.match(root, /30% · Belum terhubung/);
  assert.doesNotMatch(root, /Bu Sari|ConvexClientProvider|Dashboard/);
  assert.doesNotMatch(real, /Bu Sari|ConvexClientProvider|Dashboard/);
  assert.doesNotMatch(globalError, /Bu Sari|Convex|Dashboard/);
  assert.doesNotMatch(globalSocialCard, /Bu Sari|Warung Nasi/);

  assert.match(demo, /Warung Nasi Bu Sari/);
  assert.match(demo, /ConvexClientProvider/);
  assert.match(demo, /<Dashboard \/>/);
  assert.match(demoError, /Dashboard Demo|data cloud/);
  assert.match(real, /Bisnis Anda belum terhubung/);
  assert.match(real, /tidak ada[\s\S]*dibaca maupun diubah/i);
  assert.match(real, /\/assets\/states\/setup-unseeded\.png/);
  assert.match(gptPackage, /## Name\s+```text\s+TemanUsaha AI\s+```/);
  assert.match(
    gptPackage,
    /## Description\s+```text\s+Asisten operasional AI dengan Mode Demo dan Mode Real yang terpisah; akun bisnis nyata belum terhubung\.\s+```/,
  );
});
