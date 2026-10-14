#!/usr/bin/env node
// Reads a picture-postcard series' ink library off its fronts, the same way every time:
// downsample each front with `sips` (nothing to install) and pool the pixels. Ink is the
// mean of the darkest 3%, cream the mean of the lightest 5% of the low-chroma pixels.
// Ribbons: saturated pixels are bucketed by Lab hue, and each bucket's ink is the mean of
// its purest quarter (a printed ink is the solid colour, not the average of everything
// near it). A bucket becomes a ribbon when it covers enough of the card and carries ink
// or cream text at 4.5:1 (check-contrast.mjs holds the same rule). Prints a JSON proposal
// for the series' entry in packages/tokens/sources/jkidd.tokens.json; nothing is written.
// Leave a drifted front (fronts.ts) out of its series' sample.
//
//   pnpm front-inks <front.jpg>… [--min 0.75] [--ribbons 5]

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args.splice(i, 2)[1]) : fallback;
};
const MIN_SHARE = opt("min", 0.75) / 100;
const MAX_RIBBONS = opt("ribbons", 5);
if (!args.length) {
  console.error("usage: pnpm front-inks <front.jpg>… [--min 0.75] [--ribbons 5]");
  process.exit(1);
}

/* ---- pixels: sips → 24-bit top-down BMP → [r, g, b] ------------------------ */

const W = 360;
const H = 240;
const dir = mkdtempSync(join(tmpdir(), "front-inks-"));
const pixels = [];
try {
  for (const src of args) {
    const out = join(dir, `${basename(src)}.bmp`);
    execFileSync("sips", ["-s", "format", "bmp", "-z", String(H), String(W), src, "--out", out], { stdio: "ignore" });
    const b = readFileSync(out);
    const offset = b.readUInt32LE(10);
    const width = b.readInt32LE(18);
    const height = Math.abs(b.readInt32LE(22));
    const bpp = b.readUInt16LE(28) / 8;
    const row = Math.ceil((width * bpp) / 4) * 4;
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const p = offset + y * row + x * bpp;
        pixels.push([b[p + 2], b[p + 1], b[p]]);
      }
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

/* ---- colour --------------------------------------------------------------- */

const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
function lab([r, g, b]) {
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const x = f((0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047);
  const y = f(0.2126 * R + 0.7152 * G + 0.0722 * B);
  const z = f((0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
const hex = (rgb) => "#" + rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
const mean = (rgbs) => [0, 1, 2].map((k) => rgbs.reduce((s, p) => s + p[k], 0) / rgbs.length);

/** A name for a ribbon. Buckets are Lab hue angles: red sits near 40°, orange 67°, yellow 102°, green 136°, cyan 196°, blue 306°. */
const HUES = [[25, "pink"], [50, "red"], [75, "orange"], [90, "gold"], [110, "yellow"], [150, "green"], [185, "teal"], [230, "cyan"], [270, "sky"], [300, "blue"], [320, "violet"], [345, "purple"], [361, "pink"]];
function nameOf(L, hue) {
  const name = HUES.find(([h]) => hue < h)[1];
  if ((name === "orange" || name === "red") && L < 45) return "brown";
  return L < 42 ? `dark-${name}` : name;
}

/* ---- roles ---------------------------------------------------------------- */

const px = pixels.map((rgb) => {
  const [L, A, B] = lab(rgb);
  return { rgb, L, chroma: Math.hypot(A, B), hue: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
});
const byL = [...px].sort((a, b) => a.L - b.L);
const ink = mean(byL.slice(0, Math.ceil(px.length * 0.03)).map((p) => p.rgb));
const pale = byL.filter((p) => p.chroma < 40);
const cream = mean(pale.slice(-Math.ceil(px.length * 0.05)).map((p) => p.rgb));

const buckets = new Map();
for (const p of px) {
  if (p.chroma < 20) continue;
  const name = nameOf(p.L, p.hue);
  (buckets.get(name) ?? buckets.set(name, []).get(name)).push(p);
}
const picked = [];
const skipped = [];
for (const [name, members] of [...buckets].sort((a, b) => b[1].length - a[1].length)) {
  const share = members.length / px.length;
  if (share < MIN_SHARE) continue;
  const purest = [...members].sort((a, b) => b.chroma - a.chroma).slice(0, Math.ceil(members.length / 4));
  const fill = mean(purest.map((p) => p.rgb));
  const onInk = contrast(fill, ink);
  const onCream = contrast(fill, cream);
  const on = onInk >= 4.5 && onInk >= onCream ? "ink" : onCream >= 4.5 ? "cream" : null;
  const row = { name, fill: hex(fill), on, onInk: +onInk.toFixed(2), onCream: +onCream.toFixed(2), share: +(share * 100).toFixed(1) };
  if (on && picked.length < MAX_RIBBONS) picked.push(row);
  else skipped.push(row);
}

console.log(
  JSON.stringify(
    {
      sampled: args.map((a) => basename(a)),
      colors: { ink: hex(ink), cream: hex(cream) },
      inkOnCream: +contrast(ink, cream).toFixed(2),
      ribbons: Object.fromEntries(picked.map(({ name, fill, on }) => [name, { fill, on }])),
      picked,
      skipped,
    },
    null,
    2,
  ),
);
