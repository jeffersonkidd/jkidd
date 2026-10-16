import type { CardSpec } from "./Postcard";

/**
 * Card templates: archetype cards filled from recorded work, one per idea in the idea bank
 * (Workbench `projects/jkidd/ideas/IDEAS.md`). Every figure on a card is in the journal event it
 * cites (`journal/YYYY-MM-DD.md`), so a template is a starting draft, not invented copy.
 * Tibbie X is client work: its cards leave the project slot empty (CONTENT-SYSTEM.md §2).
 */
export type CardTemplate = {
  id: string;
  name: string;
  /** The idea-bank row and the journal event behind it. */
  idea: string;
  event: string;
  /** The tweet pattern the idea lists first (TWEET-PATTERNS.md §3). */
  pattern: string;
  spec: CardSpec;
};

export const TEMPLATES: CardTemplate[] = [
  {
    id: "figma-variables",
    name: "Five variable collections",
    idea: "2026-09-24-02",
    event: "2026-09-24 03:20",
    pattern: "Actual results (OT 30)",
    spec: {
      archetype: "ledger",
      postType: "progress",
      content: {
        title: "JKXO-TERTIARY.JSON → FIGMA VARIABLES",
        rows: [
          { text: "Palette · 90 tones" },
          { text: "Scheme · 49 roles × 6 modes" },
          { text: "Post Type · 5 modes" },
          { text: "Layout · 34" },
          { text: "Type · 3 font families" },
          { text: "15 text styles bound to them" },
        ],
      },
    },
  },
  {
    id: "type-ink",
    name: "Fills aren't text",
    idea: "2026-09-24-03",
    event: "2026-09-24 03:30",
    pattern: "Single simple change (OT 43)",
    spec: {
      archetype: "before-after",
      postType: "teaching",
      scheme: "light",
      content: {
        before: { label: "KICKER IN TYPE/ACCENT", items: ["#01C6DE on #F4FAFC", "#FFAE00 on #F4FAFC"] },
        after: { label: "KICKER IN TYPE/INK", items: ["type/ink → primary", "type/ink → tertiary"] },
      },
    },
  },
  {
    id: "strike-layer",
    name: "Draw the strike",
    idea: "2026-09-24-04",
    event: "2026-09-24 03:45",
    pattern: "What nobody told me (OT 15)",
    spec: {
      archetype: "before-after",
      postType: "teaching",
      content: {
        before: { label: "SHARED TEXT PROPERTY", items: ["Label decoration: STRIKETHROUGH", "struck on all six variants"] },
        after: { label: "ITS OWN LAYER", items: ["Label decoration: NONE", "Strike: a rectangle"] },
      },
    },
  },
  {
    id: "outermost-mode",
    name: "Set the mode once",
    idea: "2026-09-24-05",
    event: "2026-09-24 03:55",
    pattern: "What nobody told me (OT 15)",
    spec: {
      archetype: "architecture",
      postType: "teaching",
      content: {
        from: { label: "POSTCARD/* SETS POST TYPE", chips: ["progress", "decision", "failure", "principle", "teaching"] },
        arrow: "inherits",
        to: { label: "CONTENT/* SETS NO MODE" },
      },
    },
  },
  {
    id: "library-audit",
    name: "Library v0.1, audited",
    idea: "2026-09-24-06",
    event: "2026-09-24 04:05",
    pattern: "Actual results (OT 30)",
    spec: {
      archetype: "ledger",
      postType: "progress",
      content: {
        title: "JKIDD - DS v0.1",
        rows: [
          { text: "14 pages" },
          { text: "Card Frame in 16:9, 1:1 and 4:5" },
          { text: "7 card parts" },
          { text: "6 Content/* archetypes, 6 Postcard/* cards" },
          { text: "0 unbound fills or strokes, 0 unstyled text" },
          { text: "Marks are placeholders", mark: "dot" },
        ],
      },
    },
  },
  {
    id: "88-of-90",
    name: "88 of 90",
    idea: "2026-10-11-07",
    event: "2026-09-24 04:57",
    pattern: "Numbers as evidence (OT 29, M 6)",
    spec: {
      archetype: "manifesto",
      postType: "failure",
      scheme: "light",
      content: {
        kicker: "CONTRAST AUDIT",
        lines: ["88 of 90 pairs pass.", "Progress rail: 1.97:1.", "Decision rail: 1.76:1."],
        payoff: "Waived, until a fix fails the test.",
        attribution: "SCRIPTS/CHECK-CONTRAST.MJS · LIGHT SCHEME",
      },
    },
  },
  {
    id: "special-elite-metrics",
    name: "Fixed without redrawing",
    idea: "2026-10-11-01",
    event: "2026-10-11 ~06:30",
    pattern: "Numbers as evidence (OT 29, M 6)",
    spec: {
      archetype: "before-after",
      postType: "teaching",
      content: {
        before: { label: "SPECIAL ELITE v1.001", items: ["sidebearing spread 147", "sCapHeight 713", "line height 1.000 em"] },
        after: { label: "SPECIAL ELITE EVEN", items: ["sidebearing spread 0", "sCapHeight 1412", "line height 1.250 em"] },
      },
    },
  },
  {
    id: "rebuild-script",
    name: "The repair is a script",
    idea: "2026-10-11-02",
    event: "2026-10-11 ~06:30",
    pattern: "Exact process (OT 45)",
    spec: {
      archetype: "pipeline",
      postType: "teaching",
      content: {
        source: { label: "SPECIAL ELITE v1.001", chips: ["outlines", "metrics"] },
        transform: { label: "REBUILD.PY", command: "python3 rebuild.py" },
        output: { label: "TWO CUTS", lines: ["Special Elite Even", "Special Elite Mono"], highlight: 0 },
        arrows: ["reads", "writes"],
      },
    },
  },
  {
    id: "link-page-weight",
    name: "18.9 MB to 630 KB",
    idea: "2026-10-11-03",
    event: "2026-10-11 ~06:40",
    pattern: "Action and consequence (OT 11)",
    spec: {
      archetype: "before-after",
      postType: "progress",
      content: {
        before: { label: "FROM FIGMA", items: ["paper · 18.9 MB PNG", "palm sky · 1.9 MB"] },
        after: { label: "SHIPPED", items: ["paper.jpg · 630 KB", "palm-sky.jpg · 270 KB"] },
      },
    },
  },
  {
    id: "min-width-zero",
    name: "The tab strip widened the page",
    idea: "2026-10-11-04",
    event: "2026-10-11 ~06:45",
    pattern: "Pitfall tip (M 21)",
    spec: {
      archetype: "before-after",
      postType: "teaching",
      content: {
        before: { label: "390PX, OVERFLOWING", items: ["grid-template-columns: 1fr", "min-width: auto"] },
        after: { label: "390PX, FITS", items: ["grid-template-columns: minmax(0, 1fr)", "min-width: 0"] },
      },
    },
  },
  {
    id: "libraries-follow-imports",
    name: "Libraries follow the imports",
    idea: "2026-10-11-05",
    event: "2026-10-11 10:05",
    pattern: "Visualise the principle (M 24)",
    spec: {
      archetype: "architecture",
      postType: "principle",
      project: null,
      content: {
        from: { label: "FOUNDATIONS", chips: ["Color 21", "Scale 29", "Typography 19"] },
        arrow: "subscribed downstream",
        to: { label: "UI · BLOCKS · APP: NO LOCAL TOKENS" },
      },
    },
  },
  {
    id: "figma-wins-type",
    name: "Figma wins the type",
    idea: "2026-10-11-06",
    event: "2026-09-24 00:46",
    pattern: "Comparison, answered (OT 8)",
    spec: {
      archetype: "parity",
      postType: "decision",
      project: null,
      content: {
        left: { label: "FIGMA · 15 TEXT STYLES", specimen: "heading-xl" },
        right: { label: "CODE · 15 @UTILITY", specimen: "heading-xl" },
      },
    },
  },
  {
    id: "three-type-calls",
    name: "Three type calls, one morning",
    idea: "2026-10-11-08",
    event: "2026-10-11 ~06:30, ~07:30, ~07:50",
    pattern: "Then vs now (OT 34)",
    spec: {
      archetype: "ledger",
      postType: "decision",
      content: {
        title: "THREE TYPE CALLS, ONE MORNING",
        rows: [
          { text: "Display: Special Elite Even" },
          { text: "Body: Excalifont", mark: "cross", struck: true },
          { text: "Body: Inter, again" },
          { text: "Lettering: Wild Words + Bangers, short text only" },
        ],
      },
    },
  },
];
