// pnpm emblem (after the core step): the apps' browser icons, from the emblem.
//
//   packages/core/vendor/emblem/emblem.json + packages/tokens/src/tokens.css
//     → apps/{site,links}/public/favicon.svg          any modern browser
//       apps/{site,links}/public/favicon.ico          32px, for everything else
//       apps/{site,links}/public/apple-touch-icon.png 180px on an opaque field
//
// The badge in its original tone: the same layers, in the same order, as the Emblem
// component, with colours read from the generated tokens so they stay the palette's.
// Generated: don't edit the files in public/, run this again.

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { Resvg } = createRequire(import.meta.url)("@resvg/resvg-js");
const APPS = ["apps/site", "apps/links"];

const e = JSON.parse(readFileSync(join(root, "packages/core/vendor/emblem/emblem.json"), "utf8"));
const css = readFileSync(join(root, "packages/tokens/src/tokens.css"), "utf8");
const token = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
  if (!m) throw new Error(`No --${name} in tokens.css; run pnpm tokens`);
  return m[1];
};
const ink = token("jk-palette-neutral-0");
const band = token("jk-palette-neutral-70");
const field = token("jk-palette-neutral-100");

/**
 * The badge as standalone SVG; with inset, on an opaque field square that much wider
 * each side. One decimal place is plenty for a browser icon (a 4000th of the box).
 */
function badgeSvg({ inset } = {}) {
  const r1 = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(+(+n).toFixed(1)));
  const box = inset ? `${-inset} ${-inset} ${400 + 2 * inset} ${400 + 2 * inset}` : e.viewBox;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill-rule="evenodd">`,
    inset ? `<rect x="${-inset}" y="${-inset}" width="${400 + 2 * inset}" height="${400 + 2 * inset}" fill="${field}"/>` : "",
    `<circle cx="${e.field.cx}" cy="${e.field.cy}" r="${e.field.r}" fill="${field}"/>`,
    `<path d="${r1(e.band.d)}" fill="${band}" stroke="${ink}" stroke-width="${e.band.stroke}" stroke-miterlimit="1"/>`,
    `<g fill="${ink}">`,
    ...e.body.map((d) => `<path d="${r1(d)}"/>`),
    `<path d="${r1(e.halo.d)}" stroke="${field}" stroke-width="${e.halo.stroke}" stroke-linejoin="round"/>`,
    `<path d="${r1(e.wing)}"/>`,
    `</g></svg>`,
  ].join("");
}

const png = (svg, size) => new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng();

/** An .ico holding one PNG (allowed since Vista; every browser reads it). */
function ico(pngData, size) {
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0); // reserved
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(1, 4); // one image
  // the one directory entry, from byte 6
  head.writeUInt8(size % 256, 6); // width (0 means 256)
  head.writeUInt8(size % 256, 7); // height
  head.writeUInt16LE(1, 10); // colour planes
  head.writeUInt16LE(32, 12); // bits per pixel
  head.writeUInt32LE(pngData.length, 14);
  head.writeUInt32LE(22, 18); // where the image starts
  return Buffer.concat([head, pngData]);
}

const svg = badgeSvg();
const files = {
  "favicon.svg": svg + "\n",
  "favicon.ico": ico(png(svg, 32), 32),
  // iOS fills transparency with black and rounds the corners itself, so the badge sits
  // on the field colour and is inset to keep the wing clear of the corner rounding.
  "apple-touch-icon.png": png(badgeSvg({ inset: 20 }), 180),
};
for (const app of APPS) {
  for (const [name, data] of Object.entries(files)) writeFileSync(join(root, app, "public", name), data);
}
console.log(`icons: ${Object.keys(files).join(", ")} → ${APPS.join(", ")}`);
