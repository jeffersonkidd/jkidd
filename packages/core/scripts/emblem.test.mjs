// node --test scripts/ : guards on the emblem geometry `pnpm emblem` makes from its master.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const file = (f) => readFileSync(new URL(`../vendor/emblem/${f}`, import.meta.url));
const emblem = JSON.parse(file("emblem.json"));

test("emblem.json was made from the master that's checked in", () => {
  const { files } = JSON.parse(file("SOURCE.json"));
  const sha = createHash("sha256").update(file("emblem.source.svg")).digest("hex");
  assert.equal(files["emblem.json"].sha256, sha, "the master changed: run pnpm emblem");
});

test("emblem layers: field, band, body, halo and wing, inside a square box", () => {
  assert.equal(emblem.viewBox, "0 0 400 400");
  assert.ok(emblem.field.r > 0);
  assert.ok(emblem.band.d && emblem.band.stroke > 0);
  assert.ok(emblem.body.length > 0);
  assert.ok(emblem.halo.d && emblem.halo.stroke > 0);
  assert.ok(emblem.wing);
  const [x, y, w, h] = emblem.figureViewBox.split(" ").map(Number);
  assert.ok(x >= 0 && y >= 0 && x + w <= 400 && y + h <= 400, `figure box ${emblem.figureViewBox} leaves the badge`);
});

test("emblem paths are absolute M, C, L and Z only, in the badge's own units", () => {
  for (const d of [emblem.band.d, ...emblem.body, emblem.halo.d, emblem.wing]) {
    assert.match(d, /^M[MCLZ\d\s,.\-]*$/);
    assert.doesNotMatch(d, /\.\d{3}/, "numbers are rounded to 2 places");
  }
});
