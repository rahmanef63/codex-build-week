import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("public release hardening", () => {
  test("pins the package manager and patched transitive dependencies", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
    expect(packageJson.packageManager).toBe("npm@10.9.8");
    expect(packageJson.overrides.next).toEqual({
      postcss: "8.5.25",
      sharp: "0.35.3",
    });
  });

  test("sets baseline browser security headers", () => {
    const config = readFileSync("next.config.ts", "utf8");
    for (const header of [
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ]) {
      expect(config).toContain(header);
    }
    expect(config).toMatch(/poweredByHeader:\s*false/);
  });

  test("keeps production dependency auditing in CI", () => {
    const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
    expect(workflow).toContain("npm audit --omit=dev --audit-level=high");
    expect(workflow).not.toMatch(/uses:\s+actions\/(?:checkout|setup-node)@v\d/);
  });
});
