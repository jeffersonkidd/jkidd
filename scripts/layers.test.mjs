// node --test scripts/ : the packages stack in the order of the Figma libraries, and
// each one may only use the packages beneath it. Foundations → Primitives → Layout →
// Compositions → Blocks in Figma; tokens → core → ui → react → blocks in code.

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
  ui: ["tokens"],
  react: ["tokens", "core", "ui"],
  blocks: ["tokens", "core", "ui", "react"],
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
