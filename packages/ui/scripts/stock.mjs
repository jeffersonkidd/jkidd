// pnpm stock: the card stock in every shape a card comes in, from one master.
//
//   vendor/stock/paper.source.jpg (3:2, landscape)
//     → src/imagery/stock/paper-3x2.jpg   the master, unchanged    stage postcards
//       src/imagery/stock/paper-2x3.jpg   the master turned 90°    link page sheet
//       src/imagery/stock/paper-16x9.jpg  from 3:2                 16:9 backs
//       src/imagery/stock/paper-1x1.jpg   from 3:2                 1:1 backs
//       src/imagery/stock/paper-4x5.jpg   from 2:3                 4:5 backs
//
// The other shapes are nine-sliced, not stretched: the corners keep their size, the
// edges stretch only along their length, and only the plain middle takes the change
// of shape, so the burnt edge is the same thickness all the way round.
// Rendering is resvg (as scripts/icons.mjs); JPEG encoding is macOS sips.
// Generated: don't edit src/imagery/stock/, replace the master and run this again.

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pkg = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { Resvg } = createRequire(import.meta.url)("@resvg/resvg-js");
const MASTER = join(pkg, "vendor/stock/paper.source.jpg");
const OUT = join(pkg, "src/imagery/stock");
/** The burnt edge and its shading, as a share of the short side; nine-slicing keeps this band as it is. */
const EDGE = 0.1;
const QUALITY = "82";

const tmp = mkdtempSync(join(tmpdir(), "jk-stock-"));
const size = (file) => {
  const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file], { encoding: "utf8" });
  return { w: +out.match(/pixelWidth: (\d+)/)[1], h: +out.match(/pixelHeight: (\d+)/)[1] };
};
const jpeg = (png, out) => execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", QUALITY, png, "--out", out], { stdio: "ignore" });

/** The source nine-sliced onto a w×h sheet, as an SVG resvg can render. */
function nineSlice(src, sw, sh, w, h) {
  const href = `data:image/jpeg;base64,${readFileSync(src).toString("base64")}`;
  const e = Math.round(Math.min(sw, sh) * EDGE);
  const sx = [0, e, sw - e, sw], sy = [0, e, sh - e, sh];
  const dx = [0, e, w - e, w], dy = [0, e, h - e, h];
  const cells = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      cells.push(
        `<svg x="${dx[c]}" y="${dy[r]}" width="${dx[c + 1] - dx[c]}" height="${dy[r + 1] - dy[r]}" ` +
          `viewBox="${sx[c]} ${sy[r]} ${sx[c + 1] - sx[c]} ${sy[r + 1] - sy[r]}" preserveAspectRatio="none">` +
          `<image href="${href}" width="${sw}" height="${sh}"/></svg>`,
      );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${cells.join("")}</svg>`;
}

mkdirSync(OUT, { recursive: true });
const land = size(MASTER);
copyFileSync(MASTER, join(OUT, "paper-3x2.jpg"));
const portrait = join(OUT, "paper-2x3.jpg");
execFileSync("sips", ["-r", "90", "-s", "formatOptions", QUALITY, MASTER, "--out", portrait], { stdio: "ignore" });
const port = size(portrait);

// The short side stays the master's; the long side follows the card's ratio.
const shapes = [
  ["paper-16x9.jpg", MASTER, land, Math.round((land.h * 16) / 9), land.h],
  ["paper-1x1.jpg", MASTER, land, land.h, land.h],
  ["paper-4x5.jpg", portrait, port, port.w, Math.round((port.w * 5) / 4)],
];
for (const [name, src, s, w, h] of shapes) {
  const png = join(tmp, name.replace(/\.jpg$/, ".png"));
  writeFileSync(png, new Resvg(nineSlice(src, s.w, s.h, w, h), { fitTo: { mode: "original" } }).render().asPng());
  jpeg(png, join(OUT, name));
}
rmSync(tmp, { recursive: true, force: true });
console.log(`stock: paper-3x2, paper-2x3, ${shapes.map(([n]) => n.replace(".jpg", "")).join(", ")} → src/imagery/stock`);
