// pnpm emblem: turn the emblem master into the layers the code draws from.
//
//   vendor/emblem/emblem.source.svg → vendor/emblem/emblem.json
//
// The master is the winged seahorse badge exactly as exported (Affinity, then the
// vector `asset 3` in JKidd - Foundations, Illustrations › Logo Assets, 425:3522).
// Replace it with a new export and run this again; never edit emblem.json.
//
// What it does: bakes every nested transform into the path points (the master only
// uses absolute M, C, L and Z, so this is exact), scales stroke widths to match,
// rounds to 2 places (0.005 of the 400 box) and sorts the shapes into layers by
// their paint in the master, so each can take its own token. Drawn in this order:
//   field   the white disc               (fill:white; its outline lies under the
//           band, so it isn't kept: it would show as a third ring in one colour)
//   band    the grey ring                (fill:rgb(164,164,164), outlined)
//   body    the seahorse, 72 shapes      (unstyled: the master's default black)
//   halo    the wing's back feathers, in ink with a field-coloured outline that
//           parts the wing from the body and the ring (stroke:white)
//   wing    the front feathers, over the halo (unstyled)

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(root, "vendor/emblem");
const SOURCE = "emblem.source.svg";
const svg = readFileSync(join(DIR, SOURCE), "utf8");

const r2 = (n) => +n.toFixed(2);
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const style = (tag) =>
  Object.fromEntries((attr(tag, "style") ?? "").split(";").filter(Boolean).map((p) => p.split(":").map((s) => s.trim())));

/** [a b c d e f], as in matrix(a,b,c,d,e,f). */
const IDENTITY = [1, 0, 0, 1, 0, 0];
const multiply = ([a, b, c, d, e, f], [A, B, C, D, E, F]) => [
  a * A + c * B,
  b * A + d * B,
  a * C + c * D,
  b * C + d * D,
  a * E + c * F + e,
  b * E + d * F + f,
];
function parseTransform(t) {
  if (!t) return IDENTITY;
  const m = t.match(/^matrix\(([^)]+)\)$/);
  if (!m) throw new Error(`Unsupported transform: ${t}`);
  return m[1].split(/[\s,]+/).map(Number);
}
const apply = ([a, b, c, d, e, f], x, y) => [a * x + c * y + e, b * x + d * y + f];
/** How much a matrix scales lengths (uniform part), for stroke widths. */
const scaleOf = ([a, b, c, d]) => Math.sqrt(Math.abs(a * d - b * c));

function transformPath(d, m) {
  const out = [];
  for (const [, cmd, args] of d.matchAll(/([MCLZ])([^MCLZ]*)/g)) {
    const nums = (args.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []).map(Number);
    if (cmd === "Z") {
      out.push("Z");
      continue;
    }
    const pts = [];
    for (let i = 0; i < nums.length; i += 2) pts.push(apply(m, nums[i], nums[i + 1]).map(r2).join(","));
    out.push(cmd + pts.join(" "));
  }
  if (/[^MCLZ\d\s,.\-e]/.test(d)) throw new Error(`Path uses a command this script doesn't handle: ${d.slice(0, 60)}…`);
  return out.join("");
}

const layers = { field: null, band: null, body: [], halo: null, wing: null };
const stack = [IDENTITY];
let viewBox;

for (const [tag] of svg.matchAll(/<\/?(svg|g|path|circle|rect)\b[^>]*>/g)) {
  const name = tag.match(/^<\/?(\w+)/)[1];
  const top = stack.at(-1);
  if (tag.startsWith("</")) {
    if (name === "g") stack.pop();
    continue;
  }
  if (name === "svg") {
    viewBox = attr(tag, "viewBox");
    continue;
  }
  if (name === "g") {
    stack.push(multiply(top, parseTransform(attr(tag, "transform"))));
    continue;
  }
  const s = style(tag);
  if (name === "rect") {
    if (s.fill !== "none") throw new Error("The master's frame rect should be unfilled");
    continue;
  }
  if (name === "circle") {
    const [cx, cy] = apply(top, +attr(tag, "cx"), +attr(tag, "cy"));
    layers.field = { cx: r2(cx), cy: r2(cy), r: r2(+attr(tag, "r") * scaleOf(top)) };
    continue;
  }
  const d = transformPath(attr(tag, "d"), top);
  if (s.fill === "rgb(164,164,164)") layers.band = { d, stroke: r2(parseFloat(s["stroke-width"]) * scaleOf(top)) };
  else if (s.stroke === "white") layers.halo = { d, stroke: r2(parseFloat(s["stroke-width"]) * scaleOf(top)) };
  else if (!s.fill && !s.stroke && !layers.halo) layers.body.push(d);
  else if (!s.fill && !s.stroke && !layers.wing) layers.wing = d;
  else throw new Error(`Unexpected paint in the master: ${attr(tag, "style")}`);
}

if (!layers.field || !layers.band || !layers.body.length || !layers.halo || !layers.wing) throw new Error("A layer is missing from the master");

// The seahorse alone (body, halo and wing), for the figure variant: the box round
// every point, control points included, and the halo's outline.
const coords = [...layers.body, layers.halo.d, layers.wing].flatMap((d) => d.match(/-?\d*\.?\d+/g).map(Number));
const xs = coords.filter((_, i) => i % 2 === 0);
const ys = coords.filter((_, i) => i % 2 === 1);
const pad = layers.halo.stroke / 2;
const [x0, y0] = [Math.floor(Math.min(...xs) - pad), Math.floor(Math.min(...ys) - pad)];
const figureViewBox = [x0, y0, Math.ceil(Math.max(...xs) + pad) - x0, Math.ceil(Math.max(...ys) + pad) - y0].join(" ");

writeFileSync(join(DIR, "emblem.json"), JSON.stringify({ viewBox, figureViewBox, ...layers }) + "\n");
writeFileSync(
  join(DIR, "SOURCE.json"),
  JSON.stringify(
    {
      mark: "Emblem: the winged seahorse badge (logo, favicon, avatar)",
      figma: { file: "ADhu9noVbgFbtapMZivOHw", node: "425:3522", where: "JKidd - Foundations › Illustrations › Logo Assets › asset 3" },
      files: {
        "emblem.json": {
          from: SOURCE,
          generator: "scripts/sync-emblem.mjs",
          sha256: createHash("sha256").update(svg).digest("hex"),
          transform: "transforms baked into the points, numbers rounded to 2 places, shapes sorted, in paint order, into field, band, body, halo and wing",
        },
      },
    },
    null,
    2,
  ) + "\n",
);
console.log(`emblem.json: ${layers.body.length} body shapes, viewBox ${viewBox}, figure ${figureViewBox}`);
