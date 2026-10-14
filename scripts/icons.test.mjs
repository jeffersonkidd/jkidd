// node --test: the apps' browser icons are the emblem's, in the palette's colours,
// and the same in both apps. They're made by `pnpm emblem` (scripts/icons.mjs).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p, enc) => readFileSync(new URL(`../${p}`, import.meta.url), enc);
const APPS = ["apps/site", "apps/links"];
const FILES = ["favicon.svg", "favicon.ico", "apple-touch-icon.png"];
const emblem = JSON.parse(read("packages/core/vendor/emblem/emblem.json", "utf8"));
const css = read("packages/tokens/src/tokens.css", "utf8");
const token = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))[1];

test("both apps carry the same icons", () => {
  for (const f of FILES) assert.ok(read(`${APPS[0]}/public/${f}`).equals(read(`${APPS[1]}/public/${f}`)), f);
});

test("favicon.svg is the current emblem in the neutral palette (else run pnpm emblem)", () => {
  const svg = read(`${APPS[0]}/public/favicon.svg`, "utf8");
  const r1 = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(+(+n).toFixed(1)));
  assert.ok(svg.includes(`d="${r1(emblem.wing)}"`), "wing");
  assert.equal(svg.match(/<path /g).length, emblem.body.length + 3, "band, body, halo and wing");
  for (const t of ["jk-palette-neutral-0", "jk-palette-neutral-70", "jk-palette-neutral-100"]) assert.ok(svg.includes(token(t)), t);
});

test("each app's index.html links the icons", () => {
  for (const app of APPS) {
    const html = read(`${app}/index.html`, "utf8");
    for (const f of FILES) assert.ok(html.includes(`href="/${f}"`), `${app} → ${f}`);
  }
});
