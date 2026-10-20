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
// web (drawn at web size and reflowed). In ui and blocks they're src/cards and src/web,
// entered as @jkidd/<pkg>/cards and @jkidd/<pkg>/web; anything else in src (the fonts,
// the art in blocks/src/assets) is shared. A lane uses only its own side and what's shared.
const LANE_NAMES = ["cards", "web"];
const laneOf = (rel) => (LANE_NAMES.includes(rel.split("/")[0]) ? rel.split("/")[0] : "shared");

for (const pkg of ["ui", "blocks"]) {
  const src = join(root, "packages", pkg, "src");
  test(`@jkidd/${pkg} keeps cards and web apart`, () => {
    for (const file of files(src)) {
      const lane = laneOf(relative(src, file));
      if (lane === "shared") continue;
      for (const spec of specifiers(readFileSync(file, "utf8"))) {
        const where = relative(root, file);
        const [, name, entry] = spec.match(/^@jkidd\/(ui|blocks)(?:\/([^/]+))?/) ?? [];
        if (name && !entry) assert.fail(`${where} imports @jkidd/${name}: pick a lane, @jkidd/${name}/cards or @jkidd/${name}/web`);
        if (name && LANE_NAMES.includes(entry)) assert.equal(entry, lane, `${where} is ${lane}, but imports ${spec}`);
        else if (spec.startsWith(".")) {
          const other = laneOf(relative(src, resolve(dirname(file), spec)));
          if (other !== "shared") assert.equal(other, lane, `${where} is ${lane}, but imports ${spec} from ${other}`);
        }
      }
    }
  });
}

test("ui and blocks are entered by lane only", () => {
  for (const pkg of ["ui", "blocks"]) {
    const { exports } = JSON.parse(readFileSync(join(root, "packages", pkg, "package.json"), "utf8"));
    for (const key of Object.keys(exports)) {
      const lane = key.split("/")[1];
      assert.ok(LANE_NAMES.includes(lane) || key === "./fonts", `@jkidd/${pkg} exports ${key}: entries are ./cards or ./web (or ui's shared ./fonts)`);
    }
  }
});

test("the apps pick a lane too", () => {
  for (const app of readdirSync(join(root, "apps")).filter((f) => statSync(join(root, "apps", f)).isDirectory())) {
    const src = join(root, "apps", app, "src");
    for (const file of files(src)) {
      for (const spec of specifiers(readFileSync(file, "utf8"))) {
        assert.ok(!/^@jkidd\/(ui|blocks)$/.test(spec), `${relative(root, file)} imports ${spec}: pick a lane`);
      }
    }
  }
});
