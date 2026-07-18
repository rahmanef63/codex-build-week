import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node's strip-types runner requires the source extension.
import { buildCreativePrompt, getOnboardingScript, isOpenAIMediaEnabled, parseCreativeRequest } from "../lib/openai-features.ts";
// @ts-expect-error Node's strip-types runner requires the source extension.
import { read } from "../../../shared/testing/read-file.ts";

test("OpenAI feature inputs stay bounded and fixed", () => {
  assert.deepEqual(parseCreativeRequest({ brief: "  warung sehat  ", kind: "logo" }), {
    brief: "warung sehat",
    kind: "logo",
  });
  assert.equal(parseCreativeRequest({ brief: "x".repeat(501), kind: "poster" }), null);
  assert.equal(parseCreativeRequest({ brief: "warung", kind: "video" }), null);
  assert.match(buildCreativePrompt("poster", "warung sehat"), /Do not imitate an existing brand/);
  assert.match(getOnboardingScript(0) ?? "", /suara AI/);
  assert.equal(getOnboardingScript(3), null);
});

test("paid OpenAI media stays local-only and guarded", () => {
  assert.equal(isOpenAIMediaEnabled({ NODE_ENV: "production" }), false);
  assert.equal(isOpenAIMediaEnabled({}), false);
  assert.equal(isOpenAIMediaEnabled({ NODE_ENV: "development" }), true);

  const imageRoute = read("app", "api", "creative-image", "route.ts");
  assert.match(imageRoute, /if \(!isOpenAIMediaEnabled\(\)\)/);
  const imageGuardIndex = imageRoute.indexOf("if (!isOpenAIMediaEnabled())");
  const imageOpenAICallIndex = imageRoute.indexOf("requestOpenAI(");
  const imageBodyReadIndex = imageRoute.indexOf("request.json()");
  assert.ok(imageGuardIndex >= 0, "creative-image route must guard with isOpenAIMediaEnabled()");
  assert.ok(imageOpenAICallIndex >= 0, "creative-image route must call requestOpenAI()");
  assert.ok(imageBodyReadIndex >= 0, "creative-image route must read the request body");
  assert.ok(imageGuardIndex < imageOpenAICallIndex, "guard must run before any OpenAI call");
  assert.ok(imageGuardIndex < imageBodyReadIndex, "guard must run before the body is read");
  assert.match(imageRoute, /content-type/);
  assert.match(imageRoute, /content-length/);
  assert.match(imageRoute, /2_048/);

  const audioRoute = read("app", "api", "onboarding-audio", "route.ts");
  assert.match(audioRoute, /isOpenAIMediaEnabled\(\)/);
  assert.match(audioRoute, /s-maxage=604800/);

  const studio = read("slices", "creative-studio", "components", "creative-studio.tsx");
  assert.match(studio, /Jangan masukkan data pelanggan/);
  assert.match(studio, /disabled={!enabled \|\| pending}/);
});
