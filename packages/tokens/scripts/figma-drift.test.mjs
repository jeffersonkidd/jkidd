// node --test: the token sources against the Figma snapshot in sources/figma/.
// Refresh the snapshot with scripts/figma/export.js (as a Figma development
// plugin, or through the Figma MCP), then fix what this lists in the sources
// or waive it in sources/figma-waivers.json with a reason.
// Image fills (paintStyles) are not compared: the site bundles its own copies.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { palette, tokens, POST_TYPES, root } from "./lib/tokens.mjs";
import { kebab } from "./lib/color.mjs";

const figma = JSON.parse(readFileSync(`${root}sources/figma/foundations.json`, "utf8"));
// Post Type lives in the postcards lane's library (moved from Foundations 2026-10-20).
const postcards = JSON.parse(readFileSync(`${root}sources/figma/postcards.json`, "utf8"));
const WAIVERS = JSON.parse(readFileSync(`${root}sources/figma-waivers.json`, "utf8")).waivers;

const SCHEME_MODES = {
  Light: "light",
  "Light MC": "light-medium-contrast",
  "Light HC": "light-high-contrast",
  Dark: "dark",
  "Dark MC": "dark-medium-contrast",
  "Dark HC": "dark-high-contrast",
};
const WEIGHTS = { Thin: 100, "Extra Light": 200, Light: 300, Regular: 400, Medium: 500, "Semi Bold": 600, Bold: 700, "Extra Bold": 800, Black: 900 };
// Card sizes live in tokens.canvas, not tokens.layout.
const CANVAS = {
  "--jk-card-width-16x9": ["16:9", "width"],
  "--jk-card-height-16x9": ["16:9", "height"],
  "--jk-card-width-square": ["1:1", "width"],
  "--jk-card-width-4x5": ["4:5", "width"],
  "--jk-card-height-4x5": ["4:5", "height"],
};

const own = (o) => Object.entries(o ?? {}).filter(([k]) => !k.startsWith("$"));
const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const alias = (v) => (typeof v === "string" && v.match(/^\{([^.]+)\.(.+)\}$/)) || null;
const pct = (s) => Math.round(parseFloat(s) * 1000) / 1000;
const families = (f) => [f.family, ...f.fallback.split(",").map((s) => s.trim().replace(/^"|"$/g, ""))];

/** Every difference between Figma and the sources, as [key, message]. */
function drift() {
  const out = [];
  const add = (key, message) => out.push([key, message]);
  const vars = (name) => figma.collections[name]?.variables ?? {};
  const resolve = (v) => {
    const a = alias(v);
    return a ? figma.collections[a[1]]?.variables[a[2]]?.values.Value : v;
  };

  for (const name of Object.keys(figma.collections)) {
    if (!["Palette", "Scheme", "Layout", "Type"].includes(name)) add(name, "a collection this test doesn't know");
  }
  for (const name of Object.keys(postcards.collections ?? {})) {
    if (name !== "Post Type") add(`Postcards/${name}`, "a collection this test doesn't know");
  }

  // Palette: primary/primary-40 ↔ palettes.primary["40"].
  const seenTones = new Set();
  for (const [name, v] of Object.entries(vars("Palette"))) {
    const m = name.match(/^(.+)\/\1-(\d+)$/);
    const code = m && palette.palettes[m[1]]?.[m[2]];
    if (m) seenTones.add(`${m[1]}/${m[2]}`);
    if (!code) add(`Palette/${name}`, "not in jkxo-tertiary.json");
    else if (code.toUpperCase() !== v.values.Value) add(`Palette/${name}`, `Figma ${v.values.Value}, code ${code}`);
  }
  for (const [p, tones] of Object.entries(palette.palettes))
    for (const t of Object.keys(tones)) if (!seenTones.has(`${p}/${t}`)) add(`Palette/${p}/${p}-${t}`, "in code, not in Figma");

  // Scheme: every role in every mode, aliases resolved through Palette.
  const seenRoles = new Set();
  for (const [role, v] of Object.entries(vars("Scheme"))) {
    seenRoles.add(camel(role));
    for (const [mode, value] of Object.entries(v.values)) {
      const code = palette.schemes[SCHEME_MODES[mode]]?.[camel(role)];
      const hex = resolve(value);
      if (!code) add(`Scheme/${role}`, `${mode}: not in jkxo-tertiary.json`);
      else if (code.toUpperCase() !== hex) add(`Scheme/${role}`, `${mode}: Figma ${hex}, code ${code}`);
    }
  }
  for (const role of Object.keys(palette.schemes.light)) if (!seenRoles.has(role)) add(`Scheme/${kebab(role)}`, "in code, not in Figma");

  // Post Type (in Postcards): each mode names a Scheme role in Foundations, compared by name.
  const FIELDS = { "type/accent": "accent", "type/on-accent": "onAccent", "type/ink": "ink", "type/label": "label" };
  const postTypes = postcards.collections?.["Post Type"]?.variables ?? {};
  if (!Object.keys(postTypes).length) add("Post Type", "not in sources/figma/postcards.json");
  for (const [name, v] of Object.entries(postTypes)) {
    const field = FIELDS[name];
    if (!field) { add(`Post Type/${name}`, "not in tokens.postTypes"); continue; }
    for (const [mode, value] of Object.entries(v.values)) {
      const code = POST_TYPES[mode.toLowerCase()]?.[field];
      const want = field === "label" ? code : code && `{Scheme.${kebab(code)}}`;
      if (want !== value) add(`Post Type/${name}`, `${mode}: Figma ${value}, code ${want ?? "missing"}`);
    }
  }

  // Layout: matched by CSS name (the variable's code syntax).
  const layout = Object.fromEntries(own(tokens.layout).map(([, t]) => [t.figma, t]));
  const seenLayout = new Set();
  for (const [name, v] of Object.entries(vars("Layout"))) {
    const key = `Layout/${name}`;
    seenLayout.add(v.css);
    if (CANVAS[v.css]) {
      const [ratio, side] = CANVAS[v.css];
      const code = tokens.canvas[ratio]?.[side];
      if (code !== v.values.Value) add(key, `Figma ${v.values.Value}, canvas["${ratio}"].${side} ${code}`);
    } else if (!layout[v.css]) add(key, `${v.css} is not in tokens.layout`);
    else if (layout[v.css].value !== v.values.Value) add(key, `Figma ${v.values.Value}, code ${layout[v.css].value}`);
  }
  for (const [k, t] of own(tokens.layout)) if (!seenLayout.has(t.figma)) add(`Layout/${k}`, `${t.figma} is in code, not in Figma`);

  // Type: Figma's family must be in the code's stack (lettering leads with
  // Wild Words in code, which Figma can't render, and falls back to Anime Ace).
  const seenFonts = new Set();
  for (const [name, v] of Object.entries(vars("Type"))) {
    const key = name.replace(/^font\//, "");
    const code = tokens.fonts[key];
    seenFonts.add(key);
    if (!code) add(`Type/${name}`, "not in tokens.fonts");
    else if (!families(code).includes(v.values.Value)) add(`Type/${name}`, `Figma ${v.values.Value} is not in the code stack ${families(code).join(", ")}`);
    else if (code.figma !== v.css) add(`Type/${name}`, `CSS name: Figma ${v.css}, code ${code.figma}`);
  }
  for (const [k] of own(tokens.fonts)) if (!seenFonts.has(k)) add(`Type/font/${k}`, "in code, not in Figma");

  // Text styles.
  for (const [name, s] of Object.entries(figma.textStyles)) {
    const key = `textStyles/${name}`;
    const code = tokens.textStyles[name];
    if (!code) { add(key, "not in tokens.textStyles"); continue; }
    const want = {
      font: s.fontVariable?.replace(/^font\//, "") ?? `(unbound ${s.family})`,
      weight: WEIGHTS[s.style] ?? s.style,
      size: s.size,
      lineHeight: pct(s.lineHeight) / 100,
      letterSpacing: pct(s.letterSpacing),
      uppercase: s.case === "UPPER",
    };
    for (const [field, value] of Object.entries(want)) {
      const have = field === "uppercase" ? Boolean(code.uppercase) : code[field];
      if (have !== value) add(key, `${field}: Figma ${value}, code ${have}`);
    }
  }
  for (const [name] of own(tokens.textStyles)) if (!figma.textStyles[name]) add(`textStyles/${name}`, "in code, not in Figma");

  // Effect styles.
  for (const [name, { effects: shadows }] of Object.entries(figma.effectStyles)) {
    const key = `effectStyles/${name}`;
    const code = tokens.effects?.[name];
    const f = (list) => JSON.stringify(list.map((s) => [s.x, s.y, s.blur, s.spread, s.color.toLowerCase()]));
    if (!code) add(key, "not in tokens.effects");
    else if (shadows.some((s) => s.type !== "DROP_SHADOW")) add(key, "has an effect that isn't a drop shadow");
    else if (f(shadows) !== f(code)) add(key, `Figma ${f(shadows)}, code ${f(code)}`);
  }
  for (const [name] of own(tokens.effects)) if (!figma.effectStyles[name]) add(`effectStyles/${name}`, "in code, not in Figma");

  return out;
}

const DRIFT = drift();
const waived = new Set(WAIVERS.map((w) => w.figma));

// A development plugin isn't given figma.fileKey, so a plugin snapshot is matched by
// file name instead (tokens.figma.fileName; JKidd - DS is its name before 2026-10-14).
test("the snapshot is of the library the tokens are read from", () => {
  if (figma.fileKey) assert.equal(figma.fileKey, tokens.figma.fileKey);
  else assert.ok([tokens.figma.fileName, "JKidd - DS"].includes(figma.file), `no fileKey, and "${figma.file}" isn't ${tokens.figma.fileName}`);
});

test("the token sources match the Figma snapshot, apart from waived items", () => {
  const unwaived = DRIFT.filter(([key]) => !waived.has(key));
  assert.deepEqual(unwaived.map(([key, msg]) => `${key}: ${msg}`), [], `out of step with sources/figma/foundations.json (read ${figma.readAt})`);
});

test("every Figma waiver has a reason and still applies", () => {
  const drifting = new Set(DRIFT.map(([key]) => key));
  for (const w of WAIVERS) {
    assert.ok(w.reason?.trim(), `waiver without a reason: ${w.figma}`);
    assert.ok(drifting.has(w.figma), `waiver no longer needed: ${w.figma}`);
  }
});
