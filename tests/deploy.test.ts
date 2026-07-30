import { expect, test } from "vitest";
// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { read } from "../shared/testing/read-file.ts";

test("clone-to-Vercel setup is explicit, idempotent, and preview-safe", () => {
  const build = read("scripts", "build.mjs");
  const setup = read("scripts", "setup-auth.mjs");
  const deploy = read("shared", "lib", "deploy.ts");
  const page = read("app", "(public)", "setup", "page.tsx");
  const env = read(".env.example");

  expect(deploy).toMatch(/repository-url/);
  expect(deploy).toMatch(/NEXT_PUBLIC_CONVEX_URL,CONVEX_DEPLOY_KEY/);
  expect(page).toMatch(/Deploy with Vercel/);
  expect(page).toMatch(/Secret hanya ditempel di Vercel/);

  expect(build).toMatch(/VERCEL_ENV === "preview"/);
  expect(build).toMatch(/setup-auth\.mjs/);
  expect(build).toMatch(/\["run", "seed:ensure"\]/);
  expect(setup).toMatch(/envGet\("JWT_PRIVATE_KEY"\)/);
  expect(setup).toMatch(/randomBytes\(32\)/);
  expect(setup).not.toMatch(/console\.(?:log|error)\([^)]*(?:privateKey|jwks|ACTION_API_KEY|DEMO_RESET_KEY)/);

  expect(env).toMatch(/CONVEX_DEPLOY_KEY=/);
  expect(env).toMatch(/deployment:deploy, env:view, and env:write/);
});
