// node --test scripts/ : the packages stack in the order of the Figma libraries, and
// each one may only use the packages beneath it. Foundations → Primitives → Layout →
// Compositions → Blocks in Figma; tokens → core → ui → blocks in code.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** What each package may import. Anything not listed is a layer violation. */
const ALLOWED = {
  tokens: [],
  core: ["tokens"],
  ui: ["tokens", "core"],
  blocks: ["tokens", "core", "ui"],
};

const files = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|css)$/.test(f) ? [p] : [];
  });

const specifiers = (src) => [
  ...src.matchAll(/(?:from|import)\s+["']([^"']+)["']/g),
  ...src.matchAll(/@import\s+["']([^"']+)["']/g),
].map((m) => m[1]);

test("the packages are the ones the layers name", () => {
  const dirs = readdirSync(join(root, "packages")).filter((f) => statSync(join(root, "packages", f)).isDirectory());
  assert.deepEqual(dirs.sort(), Object.keys(ALLOWED).sort());
});

for (const [pkg, allowed] of Object.entries(ALLOWED)) {
  const dir = join(root, "packages", pkg);
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const declared = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });

  test(`@jkidd/${pkg} only uses the layers beneath it`, () => {
    for (const file of files(join(dir, "src"))) {
      for (const spec of specifiers(readFileSync(file, "utf8"))) {
        const where = relative(root, file);
        if (spec.startsWith("@jkidd/")) {
          const name = spec.split("/")[1];
          assert.ok(allowed.includes(name), `${where} imports ${spec}: @jkidd/${pkg} may use ${allowed.join(", ") || "nothing"}`);
          assert.ok(declared.includes(`@jkidd/${name}`), `${where} imports ${spec}, but package.json doesn't depend on it`);
        } else if (spec.startsWith(".")) {
          const target = resolve(dirname(file), spec);
          assert.ok(!relative(dir, target).startsWith(".."), `${where} reaches outside its package: ${spec}`);
        }
      }
    }
  });
}

// Across the layers run two lanes: cards (drawn at the Figma canvas size and scaled) and
// web (drawn at web size and reflowed). In ui they're src/cards and src/web; in blocks
// the link page (src/link) is web and the rest is cards, and the art (src/assets) is
// shared: one paper stock for both. A lane uses only its own side and what's shared.
const LANES = {
  ui: (rel) => rel.split("/")[0],
  blocks: (rel) => (rel.startsWith("link/") ? "web" : rel.startsWith("assets/") ? "shared" : "cards"),
};
const UI_ENTRY = { "@jkidd/ui/cards": "cards", "@jkidd/ui/web": "web" };

for (const [pkg, laneOf] of Object.entries(LANES)) {
  const src = join(root, "packages", pkg, "src");
  test(`@jkidd/${pkg} keeps cards and web apart`, () => {
    for (const file of files(src)) {
      const rel = relative(src, file);
      const lane = laneOf(rel);
      if (!["cards", "web"].includes(lane)) continue;
      for (const spec of specifiers(readFileSync(file, "utf8"))) {
        const where = relative(root, file);
        if (spec === "@jkidd/ui") assert.fail(`${where} imports @jkidd/ui: pick a lane, @jkidd/ui/cards or @jkidd/ui/web`);
        if (spec in UI_ENTRY) assert.equal(UI_ENTRY[spec], lane, `${where} is ${lane}, but imports ${spec}`);
        else if (spec.startsWith(".")) {
          const target = relative(src, resolve(dirname(file), spec));
          const other = laneOf(target);
          if (["cards", "web"].includes(other)) assert.equal(other, lane, `${where} is ${lane}, but imports ${spec} from ${other}`);
        }
      }
    }
  });
}
