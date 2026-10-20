// node --test : dressing the back. The reader, the picker and the placer are pure, so they run
// here over every card template; the browser only measures.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { CATALOG } from "../src/postcards/back/catalog.ts";
import { readCard } from "../src/postcards/back/read.ts";
import { BUDGET, pickDressing } from "../src/postcards/back/pick.ts";
import { place } from "../src/postcards/back/place.ts";
import { TEMPLATES } from "../src/postcards/templates.ts";
import { POST_TYPE_TOKENS, SCHEME_COLORS } from "../../tokens/src/tokens.gen.ts";

const src = (f) => new URL(`../src/${f}`, import.meta.url);
const dress = (t, options = {}) => {
  const source = { idea: t.idea, event: t.event };
  const reading = readCard(t.spec, source);
  return { reading, dressing: pickDressing(t.spec, reading, CATALOG, options), source };
};
const byId = (id) => TEMPLATES.find((t) => t.id === id);

/** Resolve a reader path ("content.before.items[0]", "source.event", "day") against a card. */
function at(spec, source, path) {
  if (path.startsWith("source.")) return source?.[path.slice(7)];
  if (path === "postType") return spec.postType;
  if (path === "frame.handle") return "@JFKIDD";
  return path.split(/\.|\[(\d+)\]/).filter(Boolean).reduce((v, k) => v?.[k], spec);
}

// Fixtures for the frame states no template uses yet. Test data, not copy: nothing renders it.
const SERIES_POST = { archetype: "parity", postType: "progress", day: "DAY 04", series: "21 DAYS OF DEV", content: { left: { label: "FIGMA", specimen: "A" }, right: { label: "CODE", specimen: "A" } } };

const ALL = [...TEMPLATES, { id: "series-post", idea: "fixture", event: "fixture", spec: SERIES_POST }];
const SERIES = ["western", "build-in-public", "miami", "spy", "treasure", "pirate", "christmas", "space"];

test("the catalog: unique ids, every element sourced and licensed, under-text inks kept faint", () => {
  assert.equal(new Set(CATALOG.map((c) => c.id)).size, CATALOG.length);
  for (const c of CATALOG) {
    assert.ok(c.source && c.license, `${c.id} needs a source and a license`);
    if (c.kind === "texture") assert.ok(c.maxAlpha <= 0.2, `${c.id}: a texture under text stays at or under 0.2`);
    if (c.kind === "shape") assert.ok(c.weight > 0, `${c.id} needs a weight`);
    for (const tag of c.tags) assert.match(tag, /^(topic|tone|archetype|style):[a-z-]+$/, `${c.id}: ${tag}`);
  }
});

test("every reading cites paths that hold what it quotes", () => {
  for (const t of ALL) {
    const { reading, source } = dress(t);
    const quotes = [...reading.topics.flatMap((x) => x.evidence), ...reading.numbers, ...reading.verbs, ...(reading.verdict ? [reading.verdict] : [])];
    for (const e of quotes) {
      const v = at(t.spec, source, e.path);
      assert.equal(typeof v, "string", `${t.id}: ${e.path}`);
      assert.ok(v.includes(e.text), `${t.id}: “${e.text}” isn't in ${e.path} (“${v}”)`);
    }
  }
});

test("dressing never writes: everything a shape prints is the card's own or catalog artwork", () => {
  for (const t of ALL) {
    for (const series of [null, ...SERIES]) {
      const { dressing, source } = dress(t, { dress: series });
      for (const s of dressing.shapes) {
        const artwork = (CATALOG.find((c) => c.id === s.id).artwork ?? []).map((a) => a.text);
        for (const p of s.prints) {
          if (p.path === "artwork") assert.ok(artwork.includes(p.text), `${t.id}/${s.id}: “${p.text}” isn't catalog artwork`);
          else assert.ok(String(at(t.spec, source, p.path)).toUpperCase().includes(p.text.toUpperCase()), `${t.id}/${s.id}: “${p.text}” isn't at ${p.path}`);
        }
        // Every printed param is one of the prints, upper-casing aside.
        const printed = s.prints.map((p) => p.text.toUpperCase());
        for (const k of ["label", "ringTop", "ringBottom", "word", "idea", "event"]) {
          const v = s.params[k];
          if (v) assert.ok(printed.includes(String(v).toUpperCase()), `${t.id}/${s.id}.${k} = “${v}” isn't traced`);
        }
      }
    }
  }
});

test("same card, same back; another take is a different seed", () => {
  const t = byId("link-page-weight");
  assert.deepEqual(dress(t).dressing, dress(t).dressing);
  assert.notEqual(dress(t, { take: 1 }).dressing.seed, dress(t).dressing.seed);
});

test("the ornament budget holds on every card, every take, every dress", () => {
  for (const t of ALL) {
    for (let take = 0; take < 6; take++) {
      for (const series of [null, "western"]) {
        const { dressing } = dress(t, { take, dress: series });
        const used = dressing.shapes.reduce((n, s) => n + CATALOG.find((c) => c.id === s.id).weight, 0);
        assert.ok(used <= BUDGET, `${t.id} take ${take}: ${used} > ${BUDGET}`);
        assert.equal(dressing.shapes[0].id, "cachet");
        assert.ok(dressing.texture.id);
      }
    }
  }
});

test("the reader hears what the cards say", () => {
  const weight = dress(byId("link-page-weight"));
  assert.equal(weight.reading.topics[0].topic, "weight");
  assert.equal(weight.reading.verdict?.text, "SHIPPED");
  assert.ok(weight.dressing.shapes.some((s) => s.id === "rubber" && s.params.word === "SHIPPED"));

  const audit = dress(byId("88-of-90"));
  assert.equal(audit.reading.tone, "correction");
  assert.equal(audit.reading.verdict?.text, "Waived");
  assert.ok(audit.reading.numbers.some((n) => n.text === "88 of 90"));
  assert.ok(audit.dressing.overlays.some((o) => o.id === "foxing"));

  assert.equal(dress(byId("min-width-zero")).dressing.texture.id, "grid");
  assert.equal(dress(byId("figma-variables")).dressing.texture.id, "ledger");
  assert.equal(dress(byId("figma-wins-type")).dressing.texture.id, "grid");

  const series = dress(ALL.at(-1));
  assert.ok(series.reading.seriesPost);
  assert.ok(series.dressing.shapes.some((s) => s.id === "airmail"));
  assert.equal(series.dressing.shapes[0].params.ringBottom, "DAY 04");
});

test("templates carry their source up the divider; a card with no source doesn't", () => {
  const { dressing } = dress(byId("rebuild-script"));
  assert.ok(dressing.shapes.some((s) => s.id === "imprint" && s.params.idea === "2026-10-11-02"));
  const bare = pickDressing(SERIES_POST, readCard(SERIES_POST), CATALOG);
  assert.ok(!bare.shapes.some((s) => s.id === "imprint"));
  assert.match(bare.skipped.find((s) => s.id === "imprint").why, /source/);
});

test("place: nearest free spot, never on an obstacle, dropped when there's no room", () => {
  const canvas = { width: 1600, height: 900 };
  const bounds = { x: 0, y: 0, w: 1600, h: 900 };
  const wall = { x: 0, y: 0, w: 1200, h: 900 };
  const got = place([{ id: "a", w: 200, h: 100, prefer: [0.5, 0.5] }], [wall], canvas, bounds);
  assert.ok(got.a.x >= 1200 + 28, "clear of the wall and its gap");
  const shrunk = place([{ id: "s", w: 400, h: 100, prefer: [0.9, 0.5] }], [wall], canvas, bounds);
  assert.equal(shrunk.s?.scale, 0.8, "a shape shrinks before it's dropped");
  const full = place([{ id: "b", w: 800, h: 100, prefer: [0.9, 0.5] }], [wall], canvas, bounds);
  assert.equal(full.b, null);
  const two = place([{ id: "c", w: 300, h: 300, prefer: [0.9, 0.2] }, { id: "d", w: 300, h: 300, prefer: [0.9, 0.2] }], [wall], canvas, bounds);
  assert.ok(two.c && two.d && Math.abs(two.c.y - two.d.y) >= 300, "placed shapes don't overlap");
});

// WCAG 2.x, as scripts/lib/color.mjs.
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const mix = (a, b, p) => {
  const [na, nb] = [parseInt(a.slice(1), 16), parseInt(b.slice(1), 16)];
  const ch = (n, s) => (n >> s) & 255;
  return "#" + [16, 8, 0].map((s) => Math.round(ch(na, s) * p + ch(nb, s) * (1 - p)).toString(16).padStart(2, "0")).join("");
};

test("dressed in a series, the text still reads at 4.5:1 on the series' cream", () => {
  const css = readFileSync(new URL("../../tokens/src/tokens.css", import.meta.url), "utf8");
  const token = (name) => css.match(new RegExp(`--jk-genre-picture-${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  const light = SCHEME_COLORS.light;
  for (const s of SERIES) {
    const [ink, cream] = [token(`${s}-ink`), token(`${s}-cream`)];
    assert.ok(ink && cream, `${s}: ink and cream tokens`);
    assert.ok(ratio(ink, cream) >= 4.5, `${s}: ink on cream ${ratio(ink, cream).toFixed(2)}`);
    // on-surface-variant: 82% ink (dressedpostcard.css). Chrome, zone labels and attributions.
    const variant = mix(ink, cream, 0.82);
    assert.ok(ratio(variant, cream) >= 4.5, `${s}: on-surface-variant ${ratio(variant, cream).toFixed(2)}`);
    for (const [type, t] of Object.entries(POST_TYPE_TOKENS)) {
      // Principle's ink is on-surface, which the dress makes the series' ink.
      const typeInk = t.ink === "onSurface" ? ink : light[t.ink];
      assert.ok(ratio(typeInk, cream) >= 4.5, `${s}/${type}: type/ink ${typeInk} on ${cream} ${ratio(typeInk, cream).toFixed(2)}`);
    }
  }
});

test("components read CSS variables only: no hex in the back's code", () => {
  const dir = new URL("../src/postcards/back/", import.meta.url);
  for (const f of readdirSync(dir)) {
    const text = readFileSync(new URL(f, dir), "utf8");
    assert.doesNotMatch(text, /(?<![%&\w])#[0-9a-f]{3,8}\b(?![\w-])/i, `${f} has a hex value`);
  }
});

test("on the palm sky: the dark scheme, no series inks, and the same picks as on paper", () => {
  for (const t of ALL) {
    const paper = dress(t, { dress: "western", take: 2 }).dressing;
    const sky = dress(t, { stock: "palm-sky", dress: "western", take: 2 }).dressing;
    assert.equal(sky.stock, "palm-sky");
    assert.equal(sky.scheme, "dark", `${t.id}: the wash is dark, so the back takes the dark scheme`);
    assert.equal(sky.dress, null, `${t.id}: a series' dark ink wouldn't read on the wash`);
    assert.equal(sky.seed, paper.seed, `${t.id}: the stock doesn't reshuffle the back`);
  }
  assert.match(readFileSync(src("postcards/back/dressedpostcard.css"), "utf8"), /surface\) 75%, transparent/, "the wash the 4.5:1 sums were run at");
});
