// npm run contrast: every post type in every scheme mode, checked against WCAG 2.x.
//
// Why this exists: the Progress and Decision accents (cyan, amber) looked right as
// fills but couldn't be read as kicker text on a light surface. The fix was a
// separate type/ink token per type. This script keeps that fix from regressing.
//
//   ink on surface       ≥ 4.5  kicker, arrow annotation, check marks (text)
//   accent on surface    ≥ 3.0  rail, tick, swatches (non-text graphics)
//   onAccent on accent   ≥ 3.0  Manifesto payoff at 120px, Parity specimen at 40px (large text)
//
// Genres (POSTCARDS.md §4) bring their own colours, checked the same way:
//   on-ribbon on ribbon  ≥ 4.5  location ribbon text: 18px on the canvas, far smaller once scaled
//   ink on cream         ≥ 4.5  story label
//
// Known failures are listed, with a reason, in tokens/contrast-waivers.json.
// Exits 1 when any pair fails without a waiver, so `pnpm check` fails with it.

import { readFileSync } from "node:fs";
import { contrast } from "./lib/color.mjs";
import { palette, SCHEMES, POST_TYPES, GENRES, root } from "./lib/tokens.mjs";

export const WAIVERS = JSON.parse(readFileSync(`${root}tokens/contrast-waivers.json`, "utf8")).waivers;
const waived = (r) => WAIVERS.some((w) => w.scheme === r.scheme && w.type === r.type && w.rule === r.rule);

export const RULES = [
  { name: "ink / surface", fg: "ink", bg: "surface", min: 4.5 },
  { name: "accent / surface", fg: "accent", bg: "surface", min: 3 },
  { name: "on-accent / accent", fg: "onAccent", bg: "accent", min: 3 },
];

export function audit() {
  const rows = [];
  for (const scheme of SCHEMES) {
    const s = palette.schemes[scheme];
    for (const [type, t] of Object.entries(POST_TYPES)) {
      const pick = (k) => (k === "surface" ? s.surface : s[t[k]]);
      for (const r of RULES) {
        const ratio = contrast(pick(r.fg), pick(r.bg));
        const row = { scheme, type, rule: r.name, ratio, min: r.min, pass: ratio >= r.min };
        rows.push({ ...row, waived: !row.pass && waived(row) });
      }
    }
  }
  for (const [genre, g] of Object.entries(GENRES)) {
    const pairs = [
      ...Object.entries(g.ribbons).map(([k, r]) => [`${genre}/${k}`, "on-ribbon / ribbon", g.colors[r.on], r.fill]),
      [`${genre}/label`, "ink / cream", g.colors.ink, g.colors.cream],
    ];
    for (const [type, rule, fg, bg] of pairs) {
      const ratio = contrast(fg, bg);
      const row = { scheme: "genre", type, rule, ratio, min: 4.5, pass: ratio >= 4.5 };
      rows.push({ ...row, waived: !row.pass && waived(row) });
    }
  }
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = audit();
  const failed = rows.filter((r) => !r.pass && !r.waived);
  const waivedRows = rows.filter((r) => r.waived);
  const pad = (s, n) => String(s).padEnd(n);
  console.log(pad("  scheme", 24) + pad("type", 24) + pad("pair", 20) + "ratio");
  for (const r of rows) {
    const mark = r.pass ? " " : r.waived ? "~" : "✕";
    const note = r.pass ? "" : `  (needs ${r.min}${r.waived ? "; waived" : ""})`;
    console.log(`${mark} ${pad(r.scheme, 22)}${pad(r.type, 24)}${pad(r.rule, 20)}${r.ratio.toFixed(2)}${note}`);
  }
  const passed = rows.filter((r) => r.pass).length;
  console.log(`\n${passed}/${rows.length} pairs pass · ${waivedRows.length} waived (tokens/contrast-waivers.json) · ${failed.length} failing.`);
  if (failed.length) process.exit(1);
}
