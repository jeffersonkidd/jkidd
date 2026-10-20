// pnpm notebook: copy what jkidd-ds uses from the Architect's Notebook kit into vendor/.
// The kit is upstream (~/Desktop/architects-notebook, Figma gWBVp3oNqUv7ymJXNORuM0); this
// is the only way its files get in. Run it again after regenerating the kit, then diff.
//
// Taken so far:
//   dist/figure-frames.json → vendor/architects-notebook/figure-frames.json
//     The stick-figure loops (walk, run, wave). Numbers are rounded to 2 places, which is
//     0.05px at postcard scale, and less than half the bytes.
//   shapes/<name>.svg → vendor/architects-notebook/shapes.json
//     The SHAPES below, for the library pipeline card: each as its box and its paths,
//     with the pen (stroke-width), dash and solid fill the kit gave them. Same rounding.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KIT = resolve(process.env.NOTEBOOK_DIR ?? join(root, "../../../architects-notebook"));
const OUT = join(root, "vendor/architects-notebook");

const round = (s) => s.replace(/-?\d+\.\d+/g, (n) => String(+(+n).toFixed(2)));
const sha = (buf) => createHash("sha256").update(buf).digest("hex");

const SHAPES = [
  "cylinder",
  "stack",
  "window-frame",
  "document",
  "arrow-right",
  "arrow-curved",
  "x-mark",
  "north-arrow",
  "underline-squiggle",
  "figure-pointing",
];

const srcPath = join(KIT, "dist/figure-frames.json");
let raw;
try {
  raw = readFileSync(srcPath);
} catch {
  console.error(`No ${srcPath}. Run \`npm run figures\` in the kit first, or set NOTEBOOK_DIR.`);
  process.exit(1);
}
const data = JSON.parse(raw);
const frames = Object.fromEntries(
  Object.entries(data.frames).map(([cycle, list]) => [
    cycle,
    list.map((f) => ({ boil: f.boil.map(round), still: f.still.map(round), dx: +f.dx.toFixed(2) })),
  ]),
);

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const shapes = {};
const shapeHashes = {};
for (const name of SHAPES) {
  const svg = readFileSync(join(KIT, "shapes", `${name}.svg`), "utf8");
  const [, , w, h] = attr(svg.match(/<svg[^>]*>/)[0], "viewBox").split(" ").map(Number);
  const paths = [...svg.matchAll(/<path[^>]*>/g)].map(([tag]) => {
    const p = { d: round(attr(tag, "d")), pen: +attr(tag, "stroke-width") };
    const dash = attr(tag, "stroke-dasharray");
    if (dash) p.dash = dash;
    if (attr(tag, "fill") === "currentColor") p.solid = true;
    return p;
  });
  shapes[name] = { w, h, paths };
  shapeHashes[name] = sha(svg);
}

mkdirSync(OUT, { recursive: true });
const out = JSON.stringify({ viewBox: data.viewBox, frames });
writeFileSync(join(OUT, "figure-frames.json"), out + "\n");
const shapesOut = JSON.stringify(shapes);
writeFileSync(join(OUT, "shapes.json"), shapesOut + "\n");
writeFileSync(
  join(OUT, "SOURCE.json"),
  JSON.stringify(
    {
      kit: "Architect's Notebook",
      figma: "gWBVp3oNqUv7ymJXNORuM0",
      license: "MIT (kit); generated figure geometry is the kit owner's",
      files: {
        "figure-frames.json": {
          from: "dist/figure-frames.json",
          generator: "gen-figure-anim.js",
          sha256: sha(raw),
          transform: "numbers rounded to 2 decimal places",
        },
        "shapes.json": {
          from: "shapes/<name>.svg",
          generator: "gen-shapes.js",
          sha256: shapeHashes,
          transform: "paths with their pen, dash and solid fill; numbers rounded to 2 decimal places",
        },
      },
    },
    null,
    2,
  ) + "\n",
);

console.log(
  `figure-frames.json: ${Object.keys(frames).join(", ")} · ${(raw.length / 1024).toFixed(0)}K → ${(out.length / 1024).toFixed(0)}K`,
);
console.log(`shapes.json: ${SHAPES.length} shapes · ${(shapesOut.length / 1024).toFixed(0)}K`);
