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
  assert.equal(demo.match(/data-process-step/g)?.length, 5);
  assert.match(readFileSync(join(root, "deck.js"), "utf8"), /setupInteractiveDemo\(\)/);
  for (const asset of [
    "nasi-ayam.png", "es-teh.png", "ayam-goreng.png", "nasi-putih.png", "sambal-extra.png",
    "orders-empty.png", "activity-empty.png", "stock-safe.png", "setup-unseeded.png",
  ]) assert.match(deck, new RegExp(asset.replace(".", "\\.")));
});
