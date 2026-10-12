// node --test scripts/ : guards on what `pnpm notebook` vendored from the Architect's Notebook kit.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (f) => JSON.parse(readFileSync(new URL(`../vendor/architects-notebook/${f}`, import.meta.url)));

test("figure frames: walk, run and wave, 12 drawings each, the same 6 strokes in both lines", () => {
  const { viewBox, frames } = read("figure-frames.json");
  assert.equal(viewBox, "0 0 70 116");
  assert.deepEqual(Object.keys(frames), ["walk", "run", "wave"]);
  for (const [cycle, list] of Object.entries(frames)) {
    assert.equal(list.length, 12, cycle);
    for (const f of list) {
      assert.equal(f.boil.length, 6, cycle);
      assert.equal(f.still.length, 6, cycle);
      assert.ok(Number.isFinite(f.dx) && f.dx >= 0, cycle);
    }
  }
  assert.equal(frames.wave.reduce((s, f) => s + f.dx, 0), 0, "wave stands still");
});

test("every vendored file records where it came from", () => {
  const { files } = read("SOURCE.json");
  assert.match(files["figure-frames.json"].sha256, /^[0-9a-f]{64}$/);
});
