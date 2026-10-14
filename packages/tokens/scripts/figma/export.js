// Reads a Figma library into one snapshot object, saved as
// packages/tokens/sources/figma/<library>.json and checked by the drift tests
// (packages/tokens/scripts/figma-drift.test.mjs, packages/core/scripts/figma-nodes.test.mjs).
// Read-only: it never changes the file.
//
// What it records: the file's pages; every local variable collection (modes,
// default mode, publishing) and variable (value in every mode, scopes, code
// syntax for every platform, description, key); text, effect, paint and grid
// styles with their bound variables and descriptions; and every component and
// component set (page, size, description, properties, variant count).
//
// Two ways to run it, same code:
//   - As a development plugin (manifest.json next to this file): Plugins →
//     Development → JKidd Figma Snapshot. It opens a pane with a download button.
//   - Through the Figma MCP's use_figma: set globalThis.__JK_NO_UI__ = true before
//     this file and append `return await snapshot();`. A use_figma return is capped
//     at 20KB, so call the parts instead (readFile, readCollections(["Scheme"]),
//     readStyles, readComponents([pageId])) and join them with assemble().
//
// The Variables REST API needs Figma Enterprise, so the Plugin API is the only way in.
// Async API calls only: the sync getters are deprecated under dynamic page loading.

const round = (n, places = 2) => Math.round(n * 10 ** places) / 10 ** places;

function hex({ r, g, b, a }) {
  const parts = [r, g, b, ...(a !== undefined && a < 1 ? [a] : [])];
  return "#" + parts.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

const unit = ({ value, unit }) => (unit === "AUTO" ? "auto" : `${round(value)}${unit === "PERCENT" ? "%" : "px"}`);

// Figma escapes descriptions as HTML; keep them readable.
const text = (s) => (s || "").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// Drop empty strings, empty arrays and empty objects so the snapshot stays readable.
function compact(o) {
  if (Array.isArray(o)) return o.map(compact);
  if (!o || typeof o !== "object") return o;
  const out = {};
  for (const [k, v] of Object.entries(o)) {
    const c = compact(v);
    if (c === "" || c === undefined || (Array.isArray(c) && !c.length) || (c && typeof c === "object" && !Array.isArray(c) && !Object.keys(c).length)) continue;
    out[k] = c;
  }
  return out;
}

async function lookups() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();
  return {
    collections,
    byId: Object.fromEntries(variables.map((v) => [v.id, v])),
    collectionName: Object.fromEntries(collections.map((c) => [c.id, c.name])),
  };
}

// An alias is written {Collection.variable/name}; collection names hold no dots.
function aliasName(val, { byId, collectionName }) {
  const target = byId[val.id];
  return target ? `{${collectionName[target.variableCollectionId]}.${target.name}}` : `{missing ${val.id}}`;
}

// boundVariables → { field: "{Collection.name}" }, flattening array-valued fields.
function bound(bv, l) {
  const out = {};
  for (const [field, b] of Object.entries(bv || {})) {
    if (Array.isArray(b)) b.forEach((x, i) => (out[`${field}.${i}`] = aliasName(x, l)));
    else if (b && b.id) out[field] = aliasName(b, l);
  }
  return out;
}

async function readFile() {
  return {
    $description:
      "Snapshot of a Figma library, written by packages/tokens/scripts/figma/export.js. Don't edit by hand: refresh it from Figma. The drift tests check the token sources and figma.ts against it.",
    file: figma.root.name,
    fileKey: figma.fileKey || null,
    readAt: new Date().toISOString().slice(0, 10),
    pages: figma.root.children.map((p) => ({ id: p.id, name: p.name })),
  };
}

async function readCollections(names) {
  const l = await lookups();
  const out = {};
  for (const c of l.collections) {
    if (names && !names.includes(c.name)) continue;
    const variables = {};
    for (const id of c.variableIds) {
      const v = l.byId[id];
      if (!v) continue;
      const value = (val) =>
        val && typeof val === "object" && val.type === "VARIABLE_ALIAS"
          ? aliasName(val, l)
          : v.resolvedType === "COLOR" ? hex(val) : v.resolvedType === "FLOAT" ? round(val, 4) : val;
      variables[v.name] = compact({
        type: v.resolvedType,
        css: v.codeSyntax && v.codeSyntax.WEB ? v.codeSyntax.WEB.replace(/^var\((.*)\)$/, "$1") : null,
        values: Object.fromEntries(c.modes.map((m) => [m.name, value(v.valuesByMode[m.modeId])])),
        description: text(v.description),
        scopes: v.scopes,
        // Only when it says more than `css` (an iOS or Android name).
        codeSyntax: Object.keys(v.codeSyntax || {}).some((k) => k !== "WEB") ? v.codeSyntax : undefined,
        hiddenFromPublishing: v.hiddenFromPublishing || undefined,
        id: v.id,
        key: v.key,
      });
    }
    out[c.name] = compact({
      modes: c.modes.map((m) => m.name),
      defaultMode: (c.modes.find((m) => m.modeId === c.defaultModeId) || {}).name,
      hiddenFromPublishing: c.hiddenFromPublishing || undefined,
      id: c.id,
      key: c.key,
      variables,
    });
  }
  return { collections: out };
}

async function readStyles() {
  const l = await lookups();
  const meta = (s) => ({ description: text(s.description), documentationLinks: (s.documentationLinks || []).map((d) => d.uri), id: s.id.replace(/,$/, ""), key: s.key });
  const textStyles = {};
  for (const s of await figma.getLocalTextStylesAsync()) {
    const b = bound(s.boundVariables, l);
    textStyles[s.name] = compact({
      family: s.fontName.family,
      style: s.fontName.style,
      fontVariable: b.fontFamily ? b.fontFamily.replace(/^\{Type\.|\}$/g, "") : null,
      size: s.fontSize,
      lineHeight: unit(s.lineHeight),
      letterSpacing: unit(s.letterSpacing),
      case: s.textCase,
      decoration: s.textDecoration !== "NONE" ? s.textDecoration : undefined,
      paragraphSpacing: s.paragraphSpacing || undefined,
      paragraphIndent: s.paragraphIndent || undefined,
      listSpacing: s.listSpacing || undefined,
      leadingTrim: s.leadingTrim !== "NONE" ? s.leadingTrim : undefined,
      hangingPunctuation: s.hangingPunctuation || undefined,
      hangingList: s.hangingList || undefined,
      boundVariables: b,
      ...meta(s),
    });
  }
  const effectStyles = {};
  for (const s of await figma.getLocalEffectStylesAsync()) {
    effectStyles[s.name] = compact({
      effects: s.effects.map((e) => compact({
        type: e.type,
        ...(e.offset ? { x: e.offset.x, y: e.offset.y } : {}),
        blur: e.radius,
        spread: e.spread,
        color: e.color ? hex(e.color) : undefined,
        blendMode: e.blendMode !== "NORMAL" ? e.blendMode : undefined,
        visible: e.visible === false ? false : undefined,
        showShadowBehindNode: e.showShadowBehindNode === false ? false : undefined,
        boundVariables: bound(e.boundVariables, l),
      })),
      ...meta(s),
    });
  }
  const paintStyles = {};
  for (const s of await figma.getLocalPaintStylesAsync()) {
    paintStyles[s.name] = compact({
      paints: s.paints.map((p) => compact({
        type: p.type,
        color: p.type === "SOLID" ? hex(p.color) : undefined,
        opacity: p.opacity !== undefined && p.opacity < 1 ? round(p.opacity) : undefined,
        blendMode: p.blendMode && p.blendMode !== "NORMAL" ? p.blendMode : undefined,
        visible: p.visible === false ? false : undefined,
        scaleMode: p.scaleMode,
        imageHash: p.imageHash,
        boundVariables: bound(p.boundVariables, l),
      })),
      ...meta(s),
    });
  }
  const gridStyles = {};
  for (const s of await figma.getLocalGridStylesAsync()) gridStyles[s.name] = compact({ grids: s.layoutGrids, ...meta(s) });
  return { textStyles, effectStyles, paintStyles, gridStyles };
}

// Components and component sets, keyed by node ID. Variants are summarised on
// their set, not listed one by one. Also each page's top-level frames and
// sections, which figma.ts links to (the cover, boards).
async function readComponents(pageIds) {
  const components = {};
  const frames = {};
  for (const page of figma.root.children) {
    if (pageIds && !pageIds.includes(page.id)) continue;
    await page.loadAsync();
    for (const n of page.children) {
      if (n.type === "FRAME" || n.type === "SECTION") frames[n.id] = { name: n.name, type: n.type, page: page.name, width: round(n.width), height: round(n.height) };
    }
    for (const n of page.findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] })) {
      if (n.type === "COMPONENT" && n.parent && n.parent.type === "COMPONENT_SET") continue;
      const props = {};
      for (const [name, d] of Object.entries(n.componentPropertyDefinitions || {})) {
        props[name.replace(/#\d+:\d+$/, "")] = compact({ type: d.type, default: d.defaultValue, options: d.variantOptions });
      }
      components[n.id] = compact({
        name: n.name,
        type: n.type,
        page: page.name,
        width: round(n.width),
        height: round(n.height),
        variants: n.type === "COMPONENT_SET" ? n.children.length : undefined,
        properties: props,
        description: text(n.description),
        documentationLinks: (n.documentationLinks || []).map((d) => d.uri),
        key: n.key,
      });
    }
  }
  return { components, frames };
}

// Joins parts in a stable order: file, collections, styles, components.
function assemble(...parts) {
  const out = { collections: {}, textStyles: {}, effectStyles: {}, paintStyles: {}, gridStyles: {}, components: {}, frames: {} };
  for (const p of parts) {
    for (const [k, v] of Object.entries(p)) {
      if (v && typeof v === "object" && !Array.isArray(v) && out[k]) Object.assign(out[k], v);
      else out[k] = v;
    }
  }
  const { $description, file, fileKey, readAt, pages, ...rest } = out;
  return { $description, file, fileKey, readAt, pages, ...rest };
}

async function snapshot() {
  return assemble(await readFile(), await readCollections(), await readStyles(), await readComponents());
}

async function runPlugin() {
  const json = JSON.stringify(await snapshot(), null, 2) + "\n";
  // "JKidd - Primitives" → primitives.json. JKidd - DS (the old name of Foundations) still maps to foundations.json.
  const library = figma.root.name.toLowerCase().replace(/^jkidd - /, "").replace(/[^a-z0-9]+/g, "-");
  const file = `${library === "ds" ? "foundations" : library}.json`;
  figma.showUI(
    `<style>
      body { margin: 0; padding: 12px; font: 12px/1.4 ui-monospace, monospace; }
      button { font: inherit; padding: 6px 12px; margin-bottom: 8px; }
      textarea { width: 100%; height: 340px; white-space: pre; }
    </style>
    <button id="dl">Download ${file}</button>
    <p>Save it as <b>packages/tokens/sources/figma/${file}</b>, then run <b>pnpm check</b>.
    If the download is blocked, click the text, copy it and paste over that file.</p>
    <textarea id="t" spellcheck="false" readonly onclick="this.select()"></textarea>
    <script>
      onmessage = (e) => {
        const json = e.data.pluginMessage;
        document.getElementById("t").value = json;
        document.getElementById("dl").onclick = () => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
          a.download = ${JSON.stringify(file)};
          a.click();
        };
      };
    </script>`,
    { width: 560, height: 460, title: "JKidd Figma Snapshot" },
  );
  figma.ui.postMessage(json);
}

if (typeof figma !== "undefined" && !globalThis.__JK_NO_UI__) runPlugin();
