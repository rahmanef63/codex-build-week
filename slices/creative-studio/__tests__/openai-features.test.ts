import { expect, test } from "vitest";

// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { buildCreativePrompt, getOnboardingScript, isOpenAIMediaEnabled, parseCreativeRequest } from "../lib/openai-features.ts";
// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { read } from "../../../shared/testing/read-file.ts";

test("OpenAI feature inputs stay bounded and fixed", () => {
  expect(parseCreativeRequest({ brief: "  warung sehat  ", kind: "logo" })).toEqual({
    brief: "warung sehat",
    kind: "logo",
  });
  expect(parseCreativeRequest({ brief: "x".repeat(501), kind: "poster" })).toBeNull();
  expect(parseCreativeRequest({ brief: "warung", kind: "video" })).toBeNull();
  expect(buildCreativePrompt("poster", "warung sehat")).toMatch(/Do not imitate an existing brand/);
  expect(getOnboardingScript(0) ?? "").toMatch(/suara AI/);
  expect(getOnboardingScript(3)).toBeNull();
});

test("paid OpenAI media stays local-only and guarded", () => {
  expect(isOpenAIMediaEnabled({ NODE_ENV: "production" })).toBe(false);
  expect(isOpenAIMediaEnabled({})).toBe(false);
  expect(isOpenAIMediaEnabled({ NODE_ENV: "development" })).toBe(true);

  const imageRoute = read("app", "api", "creative-image", "route.ts");
  expect(imageRoute).toMatch(/if \(!isOpenAIMediaEnabled\(\)\)/);
  const imageGuardIndex = imageRoute.indexOf("if (!isOpenAIMediaEnabled())");
  const imageOpenAICallIndex = imageRoute.indexOf("requestOpenAI(");
  const imageBodyReadIndex = imageRoute.indexOf("request.json()");
  expect(imageGuardIndex, "creative-image route must guard with isOpenAIMediaEnabled()").toBeGreaterThanOrEqual(0);
  expect(imageOpenAICallIndex, "creative-image route must call requestOpenAI()").toBeGreaterThanOrEqual(0);
  expect(imageBodyReadIndex, "creative-image route must read the request body").toBeGreaterThanOrEqual(0);
  expect(imageGuardIndex, "guard must run before any OpenAI call").toBeLessThan(imageOpenAICallIndex);
  expect(imageGuardIndex, "guard must run before the body is read").toBeLessThan(imageBodyReadIndex);
  expect(imageRoute).toMatch(/content-type/);
  expect(imageRoute).toMatch(/content-length/);
  expect(imageRoute).toMatch(/2_048/);

  const audioRoute = read("app", "api", "onboarding-audio", "route.ts");
  expect(audioRoute).toMatch(/isOpenAIMediaEnabled\(\)/);
  expect(audioRoute).toMatch(/s-maxage=604800/);

  const studio = read("slices", "creative-studio", "components", "creative-studio.tsx");
  expect(studio).toMatch(/Jangan masukkan data pelanggan/);
  expect(studio).toMatch(/disabled={!enabled \|\| pending}/);
});
