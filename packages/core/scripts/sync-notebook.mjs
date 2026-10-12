// pnpm notebook: copy what jkidd-ds uses from the Architect's Notebook kit into vendor/.
// The kit is upstream (~/Desktop/architects-notebook, Figma gWBVp3oNqUv7ymJXNORuM0); this
// is the only way its files get in. Run it again after regenerating the kit, then diff.
//
// Taken so far:
//   dist/figure-frames.json → vendor/architects-notebook/figure-frames.json
//     The stick-figure loops (walk, run, wave). Numbers are rounded to 2 places, which is
//     0.05px at postcard scale, and less than half the bytes.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KIT = resolve(process.env.NOTEBOOK_DIR ?? join(root, "../../../architects-notebook"));
const OUT = join(root, "vendor/architects-notebook");

const round = (s) => s.replace(/-?\d+\.\d+/g, (n) => String(+(+n).toFixed(2)));

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

mkdirSync(OUT, { recursive: true });
const out = JSON.stringify({ viewBox: data.viewBox, frames });
writeFileSync(join(OUT, "figure-frames.json"), out + "\n");
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
          sha256: createHash("sha256").update(raw).digest("hex"),
          transform: "numbers rounded to 2 decimal places",
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
