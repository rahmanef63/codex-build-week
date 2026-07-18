import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = join(process.cwd(), "public", "presentation");
const slides = [
  "index.html",
  "01-masalah.html",
  "02-solusi.html",
  "03-demo.html",
  "04-bukti.html",
  "05-arsitektur.html",
  "06-kepercayaan.html",
  "07-build.html",
  "08-penutup.html",
];

test("deck presentation is complete and locally linked", () => {
  let deck = "";
  slides.forEach((file, index) => {
    const html = readFileSync(join(root, file), "utf8");
    deck += html;
    assert.match(html, new RegExp(`data-slide=["']${index}["']`));
    assert.match(html, /href=["']deck\.css["']/);
    assert.match(html, /src=["']deck\.js["']/);

    for (const [image] of html.matchAll(/<img\b[^>]*>/g)) assert.match(image, /\balt=["'][^"']*["']/);
    for (const [button] of html.matchAll(/<button\b[^>]*>/g)) assert.match(button, /\btype=["']button["']/);

    for (const [, target] of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
      if (/^(?:https?:|\/|#)/.test(target)) continue;
      assert.ok(existsSync(join(root, target)), `${file}: missing ${target}`);
    }
  });

  const demo = readFileSync(join(root, "03-demo.html"), "utf8");
  assert.match(demo, /Rp55\.000/);
  assert.match(demo, /data-chat-send/);
  assert.match(demo, /data-confirm-order/);
  assert.match(demo, /data-live-workspace/);
  assert.match(demo, /data-order-process tabindex="-1"/);
  assert.equal(demo.match(/data-process-step/g)?.length, 5);
  const script = readFileSync(join(root, "deck.js"), "utf8");
  assert.match(script, /setupInteractiveDemo\(\)/);
  assert.match(script, /const deploymentBaseUrl = "https:\/\/codex-build-week\.vercel\.app"/);
  assert.match(script, /const deployedDemoUrl = new URL\("\/demo", deploymentBaseUrl\)\.href/);
  assert.match(script, /const deployedRealUrl = new URL\("\/real", deploymentBaseUrl\)\.href/);
  assert.doesNotMatch(script, /api\.qrserver\.com/);
  assert.doesNotMatch(deck, /Lima Action|5 GPT Actions/i);
  assert.match(deck, /get_dashboard_card_image/);
  assert.equal(readFileSync(join(root, "04-bukti.html"), "utf8").match(/class="action-id"/g)?.length, 6);
  const qr = readFileSync(join(root, "vercel-demo-qr.svg"), "utf8");
  assert.match(qr, /<desc>https:\/\/codex-build-week\.vercel\.app\/demo<\/desc>/);
  assert.match(qr, /width="407" height="407"/);
  assert.match(qr, /<rect[^>]+width="407" height="407"/);
  assert.match(qr, /<g id="elements" transform="translate\(44 44\)"/);
  const styles = readFileSync(join(root, "deck.css"), "utf8");
  assert.match(styles, /@media \(max-width: 720px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.match(styles, /safe-area-inset-bottom/);
  assert.match(styles, /scroll-snap-type: x mandatory/);

  const opening = readFileSync(join(root, "index.html"), "utf8");
  assert.doesNotMatch(deck, /(?:70|30)%/);
  assert.match(opening, /data-qr-open/);
  assert.match(opening, /<dialog[^>]+data-qr-dialog/);
  assert.match(script, /qrDialog\.showModal\(\)/);
  assert.match(script, /qrDialog\.close\(\)/);
  const onboarding = readFileSync(join(root, "07-build.html"), "utf8");
  assert.match(onboarding, /data-real-link/);
  assert.match(onboarding, /Mode Real[^<]+belum terhubung/);
  assert.doesNotMatch(onboarding, /Bu Sari/);
  assert.match(onboarding, /data-interview-play/);
  assert.match(onboarding, /data-interview-transcript/);
  assert.match(onboarding, /data-interview-stage/);
  assert.match(onboarding, /data-accept-draft/);
  assert.match(onboarding, /Contoh sintetis[^<]+tanpa data nyata/);
  assert.match(script, /setupOnboardingDemo\(\)/);
  assert.match(script, /draft\.focus\(\{ preventScroll: true \}\)/);
  assert.match(script, /success\.focus\(\{ preventScroll: true \}\)/);
  for (const asset of [
    "nasi-ayam.png", "es-teh.png", "ayam-goreng.png", "nasi-putih.png", "sambal-extra.png",
    "orders-empty.png", "activity-empty.png", "stock-safe.png", "setup-unseeded.png",
  ]) assert.match(deck, new RegExp(asset.replace(".", "\\.")));
});

test("clean presentation route embeds the static interactive deck", () => {
  const route = readFileSync(join(process.cwd(), "app", "presentation", "page.tsx"), "utf8");
  assert.match(route, /src="\/presentation\/index\.html"/);
  assert.match(route, /title="Presentasi interaktif TemanUsaha AI"/);
});
