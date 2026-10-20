#!/usr/bin/env node
// Turns a delivered picture-postcard front master into the repo asset, the same way every time:
// trim the art's own drawn border (a recorded inset, never eyeballed), centre-crop to the
// 1536×1024 canvas ratio, resize to @2x (3072×2048) and write a JPEG to assets/fronts/.
// The master stays outside the repo. Uses macOS `sips`, so nothing to install.
//
//   pnpm front <master.png> <id> [--inset 1.21%] [--1x]
//
// --inset is the drawn border's width as a share of the master's width (0 when full-bleed).
// --1x writes the canvas at 1x (1536×1024) for a master delivered at the image model's own
// size (1535×1024), which is too small for @2x; rerun without it once there's an upscaled master.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const oneX = args.indexOf("--1x");
if (oneX >= 0) args.splice(oneX, 1);
const OUT = oneX >= 0 ? { width: 1536, height: 1024 } : { width: 3072, height: 2048 }; // PICTURE_CANVAS @1x or @2x
const QUALITY = 82;
const here = dirname(fileURLToPath(import.meta.url));

const flag = args.indexOf("--inset");
const insetArg = flag >= 0 ? args.splice(flag, 2)[1] : "0";
const [src, id] = args;
if (!src || !id || !/^[a-z0-9-]+$/.test(id)) {
  console.error("usage: pnpm front <master> <id: kebab-case> [--inset <percent>] [--1x]");
  process.exit(1);
}

const sips = (...a) => execFileSync("sips", a, { encoding: "utf8" });
const dims = (f) => {
  const out = sips("-g", "pixelWidth", "-g", "pixelHeight", f);
  return { width: +out.match(/pixelWidth: (\d+)/)[1], height: +out.match(/pixelHeight: (\d+)/)[1] };
};

const master = dims(src);
const inset = Math.round((parseFloat(insetArg) / 100) * master.width);
let width = master.width - 2 * inset;
let height = master.height - 2 * inset;
const ratio = OUT.width / OUT.height;
if (width / height > ratio) width = Math.floor(height * ratio);
else height = Math.floor(width / ratio);
// At 1x a native master loses its border to the trim and comes up a little short: allow up to 1.25×.
const slack = oneX >= 0 ? 1.25 : 1;
if (width * slack < OUT.width || height * slack < OUT.height) {
  console.error(`master too small: ${width}×${height} after trim, needs ${OUT.width}×${OUT.height}`);
  process.exit(1);
}
const x = Math.round((master.width - width) / 2);
const y = Math.round((master.height - height) / 2);

const tmp = mkdtempSync(join(tmpdir(), "jk-front-"));
const out = join(here, "../src/assets/fronts", `${id}.jpg`);
try {
  const crop = join(tmp, "crop.png");
  sips("-c", String(height), String(width), "--cropOffset", String(y), String(x), src, "--out", crop);
  sips("-z", String(OUT.height), String(OUT.width), "-s", "format", "jpeg", "-s", "formatOptions", String(QUALITY), crop, "--out", out);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
const kb = Math.round(statSync(out).size / 1024);
console.log(`${id}: ${master.width}×${master.height} − ${inset}px border → ${width}×${height} at (${x}, ${y}) → ${OUT.width}×${OUT.height} JPEG, ${kb} KB`);
