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
  slides.forEach((file, index) => {
    const html = readFileSync(join(root, file), "utf8");
    assert.match(html, new RegExp(`data-slide=["']${index}["']`));
    assert.match(html, /href=["']deck\.css["']/);
    assert.match(html, /src=["']deck\.js["']/);

    for (const [, target] of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
      if (/^(?:https?:|\/|#)/.test(target)) continue;
      assert.ok(existsSync(join(root, target)), `${file}: missing ${target}`);
    }
  });

  assert.match(readFileSync(join(root, "03-demo.html"), "utf8"), /Rp55\.000/);
});
