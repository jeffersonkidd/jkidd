// node --test: every node ID in src/figma.ts against the Figma snapshots in
// @jkidd/tokens (sources/figma/), so a component that moves or is deleted in
// Figma fails here instead of leaving a dead "Open in Figma" link or data-figma.
// WORKBENCH_NODES and NOTEBOOK_NODES live in other files and aren't snapshotted.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/figma.ts", import.meta.url), "utf8");
const snapshot = (name) => JSON.parse(readFileSync(new URL(`../../tokens/sources/figma/${name}.json`, import.meta.url), "utf8"));
const SNAPSHOTS = { Foundations: "foundations", Primitives: "primitives", Layout: "layout", Compositions: "compositions", Blocks: "blocks" };

/** The body of `export const NAME = { ... }` in figma.ts. */
function block(name) {
  const start = source.indexOf(`export const ${name} = {`);
  assert.ok(start >= 0, `${name} not found in figma.ts`);
  return source.slice(start, source.indexOf("\n}", start));
}

// `Kicker: [LIBRARIES.Primitives, "65:62"],` or `"Postcard/Manifesto": [LIBRARIES.Blocks, "61:812"],`
const entries = (name) => [...block(name).matchAll(/^\s+"?([^":]+)"?:\s*\[LIBRARIES\.(\w+),\s*"(\d+:\d+)"\]/gm)].map(([, n, lib, id]) => [n, lib, id]);
const FIGMA_NODES = entries("FIGMA_NODES");
const LINK_NODES = entries("LINK_NODES");

test("figma.ts lists the nodes this test checks", () => {
  assert.ok(FIGMA_NODES.length >= 28, `parsed ${FIGMA_NODES.length} FIGMA_NODES`);
  assert.ok(LINK_NODES.length >= 14, `parsed ${LINK_NODES.length} LINK_NODES`);
});

test("every figma.ts node is a component, component set or top-level frame in its library's snapshot", () => {
  const missing = [];
  for (const [name, lib, id] of [...FIGMA_NODES, ...LINK_NODES]) {
    const snap = snapshot(SNAPSHOTS[lib]);
    if (!snap.components[id] && !snap.frames?.[id]) missing.push(`${name} → ${lib} ${id} (snapshot read ${snap.readAt})`);
  }
  assert.deepEqual(missing, [], "node IDs that are not in Figma");
});
