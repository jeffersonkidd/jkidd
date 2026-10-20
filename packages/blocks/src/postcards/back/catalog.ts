/**
 * The stock catalog: the graphic elements a back can be dressed with. Textures lie under the
 * content, overlays print over it, shapes go in the space the content leaves free, and styles
 * repaint the paper. Every element is drawn here in code (SVG and CSS on the card's own tokens)
 * or taken from a press this repo already owns, so the whole catalog is ours to print.
 *
 * Pure data, no imports: `scripts/back.test.mjs` reads it under plain Node.
 *
 * Tags say what an element suits, in the reader's words (read.ts): `topic:*`, `tone:*`,
 * `archetype:*`. The picker (pick.ts) scores them against what the card's JSON means.
 */

export type CatalogKind = "texture" | "overlay" | "shape";

export type CatalogEntry = {
  id: string;
  kind: CatalogKind;
  name: string;
  /** What it looks like, for the catalog page. */
  look: string;
  tags: string[];
  /** Shapes: what it costs out of the card's ornament budget (pick.ts BUDGET). */
  weight?: number;
  /** Shapes: canvas size, before placement. Width can be set by the shape's text. */
  size?: { w: number; h: number };
  /** Shapes: what the card must carry for the element to have anything true to say. */
  needs?: ("verdict" | "source" | "series-post")[];
  /**
   * Text the element prints that isn't the card's own: fixed artwork, with where it comes from.
   * Everything else a shape prints is read off the JSON (back.test.mjs holds it to that).
   */
  artwork?: { text: string; from: string }[];
  /** Under-text textures: how strong the ink may get, 0–1 of the role it's drawn in. */
  maxAlpha?: number;
  source: string;
  license: string;
};

const OURS = "Drawn in code for this repo";
const OWN = "Ours";

export const CATALOG: CatalogEntry[] = [
  // ── Textures: under the content ────────────────────────────────────────────
  {
    id: "fiber",
    kind: "texture",
    name: "Card stock",
    look: "Fine fractal grain and long paper fibres, in the scheme's ink.",
    tags: ["tone:milestone", "topic:weight"],
    maxAlpha: 0.1,
    source: OURS,
    license: OWN,
  },
  {
    id: "laid",
    kind: "texture",
    name: "Laid paper",
    look: "Close horizontal laid lines crossed by wide chain lines, like writing paper held to the light.",
    tags: ["topic:type", "topic:tokens", "tone:creed", "archetype:manifesto"],
    maxAlpha: 0.09,
    source: OURS,
    license: OWN,
  },
  {
    id: "grid",
    kind: "texture",
    name: "Graph paper",
    look: "A 24px minor and 120px major grid in the post type's accent, the stage postcards' paper.",
    tags: ["topic:layout", "topic:figma", "archetype:architecture", "archetype:parity", "tone:fork"],
    maxAlpha: 0.2,
    source: OURS,
    license: OWN,
  },
  {
    id: "halftone",
    kind: "texture",
    name: "Halftone screen",
    look: "A dot screen that thickens toward the right edge.",
    tags: ["topic:color"],
    maxAlpha: 0.2,
    source: OURS,
    license: OWN,
  },
  {
    id: "ledger",
    kind: "texture",
    name: "Ledger ruling",
    look: "Feint rules every 56px and a double margin line in the accent, left of the content.",
    tags: ["archetype:ledger", "topic:ship", "tone:milestone"],
    maxAlpha: 0.14,
    source: OURS,
    license: OWN,
  },

  // ── Overlays: printed over everything, kept faint ──────────────────────────
  {
    id: "press",
    kind: "overlay",
    name: "The western press",
    look: "The western master's grain and ink dropout: the picture postcards' press (Front.press).",
    tags: ["style:series"],
    maxAlpha: 0.45,
    source: "packages/ui/src/imagery/press, sampled from the western master's flat sky (2026-10-14)",
    license: OWN,
  },
  {
    id: "foxing",
    kind: "overlay",
    name: "Foxing",
    look: "A few soft age spots in the tertiary tone, placed by the card's seed.",
    tags: ["tone:correction"],
    maxAlpha: 0.16,
    source: OURS,
    license: OWN,
  },

  // ── Shapes: placed in free space, never over the content or the frame ─────
  {
    id: "cachet",
    kind: "shape",
    name: "Stamp and postmark",
    look: "A perforated stamp carrying the post type's icon, cancelled by a ring postmark and machine waves.",
    tags: [],
    weight: 1,
    size: { w: 400, h: 220 },
    artwork: [{ text: "2¢", from: "Entry 001-C: the type is marked with a 2¢ postage stamp" }],
    source: OURS,
    license: OWN,
  },
  {
    id: "rubber",
    kind: "shape",
    name: "Rubber stamp",
    look: "One verdict word from the card, boxed, inked in type/ink and knocked back by the paper.",
    tags: ["tone:correction", "tone:milestone", "tone:fork"],
    weight: 1,
    size: { w: 0, h: 92 },
    needs: ["verdict"],
    source: OURS,
    license: OWN,
  },
  {
    id: "imprint",
    kind: "shape",
    name: "Divider imprint",
    look: "The divided back's centre rule, with the card's source printed up it like a publisher's number.",
    tags: [],
    weight: 1,
    size: { w: 40, h: 470 },
    needs: ["source"],
    artwork: [
      { text: "IDEA", from: "Label for the idea-bank row (templates.ts)" },
      { text: "JOURNAL", from: "Label for the journal event (templates.ts)" },
    ],
    source: OURS,
    license: OWN,
  },
  {
    id: "airmail",
    kind: "shape",
    name: "Airmail edge",
    look: "Bands of accent and ink chevrons along the top and bottom edges: one dispatch in a run.",
    tags: [],
    weight: 0.5,
    needs: ["series-post"],
    source: OURS,
    license: OWN,
  },
  {
    id: "registration",
    kind: "shape",
    name: "Registration marks",
    look: "Crosshair targets in the four corners, the printer's marks for a build that runs through a press.",
    tags: ["topic:code", "topic:tokens", "archetype:pipeline", "tone:lesson"],
    weight: 0.5,
    source: OURS,
    license: OWN,
  },
  {
    id: "colorbar",
    kind: "shape",
    name: "Colour bar",
    look: "The five post type accents as a printer's colour bar along the foot of the card.",
    tags: ["topic:color", "topic:tokens"],
    weight: 0.5,
    source: OURS,
    license: OWN,
  },
  {
    id: "corners",
    kind: "shape",
    name: "Photo corners",
    look: "Album corners on each zone, so the two halves sit like mounted prints.",
    tags: ["archetype:parity"],
    weight: 0.5,
    source: OURS,
    license: OWN,
  },
];

export const catalogEntry = (id: string) => {
  const e = CATALOG.find((c) => c.id === id);
  if (!e) throw new Error(`No catalog entry ${id}`);
  return e;
};
