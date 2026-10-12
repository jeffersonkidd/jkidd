// node --test scripts/ : guards on the token sources and the generated CSS.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { palette, tokens, SCHEMES, POST_TYPES, GENRES, root } from "./lib/tokens.mjs";
import { audit, WAIVERS } from "./check-contrast.mjs";
import { contrast } from "./lib/color.mjs";

test("the palette matches the Figma library's counts: 90 palette vars, 49 roles, 6 modes", () => {
  const paletteVars = Object.values(palette.palettes).reduce((n, tones) => n + Object.keys(tones).length, 0);
  assert.equal(paletteVars, 90);
  assert.equal(SCHEMES.length, 6);
  for (const mode of SCHEMES) assert.equal(Object.keys(palette.schemes[mode]).length, 49, mode);
});

test("every post type points at scheme roles that exist", () => {
  const roles = new Set(Object.keys(palette.schemes.light));
  for (const [type, t] of Object.entries(POST_TYPES)) {
    for (const k of ["accent", "ink", "onAccent"]) assert.ok(roles.has(t[k]), `${type}.${k} = ${t[k]}`);
  }
});

test("five post types, as in CONTENT-SYSTEM.md §3", () => {
  assert.deepEqual(Object.keys(POST_TYPES), ["progress", "decision", "failure", "principle", "teaching"]);
});

test("type/ink is readable as text in every scheme (the kicker lesson)", () => {
  const bad = audit().filter((r) => r.rule === "ink / surface" && !r.pass);
  assert.deepEqual(bad, []);
});

test("accent-as-text is exactly the failure type/ink exists to avoid", () => {
  // If this ever passes, type/ink may no longer be needed for these two types.
  const s = palette.schemes.light;
  assert.ok(contrast(s.primaryContainer, s.surface) < 4.5);
  assert.ok(contrast(s.tertiaryContainer, s.surface) < 4.5);
});

test("every waiver still matches a real failure (stale waivers are removed)", () => {
  const rows = audit();
  for (const w of WAIVERS) {
    const row = rows.find((r) => r.scheme === w.scheme && r.type === w.type && r.rule === w.rule);
    assert.ok(row, `waiver for a pair that doesn't exist: ${JSON.stringify(w)}`);
    assert.ok(!row.pass, `waiver no longer needed: ${w.scheme}/${w.type}/${w.rule} passes at ${row.ratio.toFixed(2)}`);
  }
});

test("generated CSS is in step with the sources", () => {
  const css = readFileSync(`${root}src/tokens.css`, "utf8");
  for (const mode of SCHEMES.filter((m) => m !== "light")) assert.match(css, new RegExp(`\\[data-scheme="${mode}"\\]`));
  for (const type of Object.keys(POST_TYPES)) assert.match(css, new RegExp(`\\[data-post-type="${type}"\\]`));
  assert.match(css, new RegExp(`--jk-card-chrome-inset: ${tokens.layout.cardChromeInset.value}px`));
});

test("every genre ribbon becomes a fill and an on-fill variable", () => {
  const css = readFileSync(`${root}src/tokens.css`, "utf8");
  for (const [genre, g] of Object.entries(GENRES)) {
    for (const k of Object.keys(g.ribbons)) {
      assert.match(css, new RegExp(`--jk-genre-${genre}-ribbon-${k}: `));
      assert.match(css, new RegExp(`--jk-genre-${genre}-on-ribbon-${k}: var\\(--jk-genre-${genre}-`));
    }
  }
});
