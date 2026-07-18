import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// @ts-expect-error Node's strip-types runner requires the source extension.
import { buildCreativePrompt, getOnboardingScript, isOpenAIMediaEnabled, parseCreativeRequest } from "../lib/openai-features.ts";

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

  const imageRoute = readFileSync(
    join(process.cwd(), "app", "api", "creative-image", "route.ts"),
    "utf8",
  );
  assert.ok(imageRoute.indexOf("isOpenAIMediaEnabled()") < imageRoute.indexOf("request.json()"));
  assert.match(imageRoute, /content-type/);
  assert.match(imageRoute, /content-length/);
  assert.match(imageRoute, /2_048/);

  const audioRoute = readFileSync(
    join(process.cwd(), "app", "api", "onboarding-audio", "route.ts"),
    "utf8",
  );
  assert.match(audioRoute, /isOpenAIMediaEnabled\(\)/);
  assert.match(audioRoute, /s-maxage=604800/);

  const studio = readFileSync(join(process.cwd(), "components", "creative-studio.tsx"), "utf8");
  assert.match(studio, /Jangan masukkan data pelanggan/);
  assert.match(studio, /disabled={!enabled \|\| pending}/);
});
