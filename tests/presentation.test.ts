import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { read } from "../shared/testing/read-file.ts";

const root = join(process.cwd(), "public", "presentation");
const gptUrl = "https://chatgpt.com/g/g-6a5b0a5ef31c819181f8a68b5536d33e-temanusaha-ai-warung-bu-sari";
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
    const html = read("public", "presentation", file);
    deck += html;
    expect(html).toMatch(new RegExp(`data-slide=["']${index}["']`));
    expect(html).toMatch(/href=["']deck\.css["']/);
    expect(html).toMatch(/src=["']deck-nav\.js["']/);
    expect(html).toMatch(/src=["']deck-order-demo\.js["']/);
    expect(html).toMatch(/src=["']deck-onboarding-demo\.js["']/);

    for (const [image] of html.matchAll(/<img\b[^>]*>/g)) expect(image).toMatch(/\balt=["'][^"']*["']/);
    for (const [button] of html.matchAll(/<button\b[^>]*>/g)) expect(button).toMatch(/\btype=["']button["']/);

    for (const [, target] of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
      if (/^(?:https?:|\/|#)/.test(target)) continue;
      expect(existsSync(join(root, target)), `${file}: missing ${target}`).toBe(true);
    }
  });

  const demo = read("public", "presentation", "03-demo.html");
  expect(demo).toMatch(/Rp55\.000/);
  expect(demo).toMatch(/data-chat-send/);
  expect(demo).toMatch(/data-confirm-order/);
  expect(demo).toMatch(/data-live-workspace/);
  expect(demo).toMatch(/data-order-process tabindex="-1"/);
  expect(demo.match(/data-process-step/g)?.length).toBe(5);
  // deck.js was split (200-line file limit) into deck-nav.js, deck-order-demo.js,
  // and deck-onboarding-demo.js; concatenate to keep the assertions below unchanged.
  const script =
    read("public", "presentation", "deck-nav.js") +
    read("public", "presentation", "deck-order-demo.js") +
    read("public", "presentation", "deck-onboarding-demo.js");
  expect(script).toMatch(/setupInteractiveDemo\(\)/);
  expect(script).toMatch(/const deploymentBaseUrl = "https:\/\/codex-build-week\.vercel\.app"/);
  expect(script).toMatch(/const deployedDemoUrl = new URL\("\/demo", deploymentBaseUrl\)\.href/);
  expect(script).toMatch(/const deployedRealUrl = new URL\("\/dashboard", deploymentBaseUrl\)\.href/);
  expect(script.includes(`const gptUrl = "${gptUrl}";`)).toBe(true);
  expect(script).toMatch(/querySelectorAll\("\[data-gpt-link\]"\).*link\.href = gptUrl/);
  expect(script).not.toMatch(/api\.qrserver\.com/);
  expect(deck).not.toMatch(/Lima Action|5 GPT Actions/i);
  expect(deck).toMatch(/get_dashboard_card_image/);
  expect(read("public", "presentation", "04-bukti.html").match(/class="action-id"/g)?.length).toBe(6);
  const qr = read("public", "presentation", "vercel-demo-qr.svg");
  expect(qr).toMatch(/<desc>https:\/\/codex-build-week\.vercel\.app\/demo<\/desc>/);
  expect(qr).toMatch(/width="407" height="407"/);
  expect(qr).toMatch(/<rect[^>]+width="407" height="407"/);
  expect(qr).toMatch(/<g id="elements" transform="translate\(44 44\)"/);
  const gptQr = read("public", "presentation", "chatgpt-gpt-qr.svg");
  expect(gptQr.includes(`<desc>${gptUrl}</desc>`)).toBe(true);
  expect(gptQr).toMatch(/width="675" height="675"/);
  expect(gptQr).toMatch(/<rect[^>]+width="675" height="675"/);
  expect(gptQr).toMatch(/d="M 60,60 l 15,0/);
  expect(gptQr).toMatch(/M 600,600 l 15,0/);
  const styles = read("public", "presentation", "deck.css");
  expect(styles).toMatch(/@media \(max-width: 720px\)/);
  expect(styles).toMatch(/@media \(max-width: 390px\)/);
  expect(styles).toMatch(/safe-area-inset-bottom/);
  expect(styles).toMatch(/scroll-snap-type: x mandatory/);

  const opening = read("public", "presentation", "index.html");
  expect(deck).not.toMatch(/(?:70|30)%/);
  expect(opening).toMatch(/data-qr-open/);
  expect(opening).toMatch(/<dialog[^>]+data-qr-dialog/);
  expect(opening).toMatch(/src="chatgpt-gpt-qr\.svg"/);
  expect(opening).toMatch(/data-gpt-open/);
  expect(opening).toMatch(/<dialog[^>]+data-gpt-dialog/);
  expect(script).toMatch(/qrDialog\.showModal\(\)/);
  expect(script).toMatch(/qrDialog\.close\(\)/);
  expect(script).toMatch(/gptDialog\.showModal\(\)/);
  expect(script).toMatch(/gptDialog\.close\(\)/);
  expect(read("public", "presentation", "08-penutup.html")).toMatch(/data-gpt-link/);
  const onboarding = read("public", "presentation", "07-build.html");
  expect(onboarding).toMatch(/data-real-link/);
  expect(onboarding).toMatch(/Mode Real[^<]+kini live/);
  expect(deck).not.toMatch(/belum terhubung/);
  expect(onboarding).not.toMatch(/Bu Sari/);
  expect(onboarding).toMatch(/data-interview-play/);
  expect(onboarding).toMatch(/data-interview-transcript/);
  expect(onboarding).toMatch(/data-interview-stage/);
  expect(onboarding).toMatch(/data-accept-draft/);
  expect(onboarding).toMatch(/Contoh sintetis[^<]+tanpa data nyata/);
  expect(script).toMatch(/setupOnboardingDemo\(\)/);
  expect(script).toMatch(/draft\.focus\(\{ preventScroll: true \}\)/);
  expect(script).toMatch(/success\.focus\(\{ preventScroll: true \}\)/);
  for (const asset of [
    "nasi-ayam.png", "es-teh.png", "ayam-goreng.png", "nasi-putih.png", "sambal-extra.png",
    "orders-empty.png", "activity-empty.png", "stock-safe.png", "setup-unseeded.png",
  ]) expect(deck).toMatch(new RegExp(asset.replace(".", "\\.")));
});

test("/presentation redirects to the static interactive deck", () => {
  const config = read("next.config.ts");
  expect(config).toMatch(/source: "\/presentation"/);
  expect(config).toMatch(/destination: "\/presentation\/index\.html"/);
  expect(existsSync(join(root, "index.html"))).toBe(true);
});
