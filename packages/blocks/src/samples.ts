import type { Archetype, CardSpec } from "./Postcard";

export { LINK_SAMPLE } from "./link/sample";

/**
 * The six Postcard/* components from JKidd - Blocks (Postcards, 61:811), as data. Sample copy is
 * the library's own: from postcard-wireframes.jsx and the v0.1 build (2026-09-24).
 * Replace it with the real work before posting: content never invents.
 */
export const SAMPLES: Record<Archetype, CardSpec> = {
  manifesto: {
    archetype: "manifesto",
    postType: "principle",
    day: "DAY 18",
    series: "21 DAYS OF DEV",
    project: "TIBBIE X",
    content: {
      lines: ["One idea per card.", "The tweet carries nuance."],
      payoff: "The card is the claim.",
      attribution: "PRINCIPLE 5 · ONE IDEA PER CARD",
    },
  },
  architecture: {
    archetype: "architecture",
    postType: "decision",
    day: "DAY 02",
    series: "21 DAYS OF DEV",
    project: "TIBBIE X",
    content: {
      from: { label: "PRIMITIVES", chips: ["color", "space", "radius", "type", "motion"] },
      arrow: "imports",
      to: { label: "COMPOSITIONS" },
    },
  },
  pipeline: {
    archetype: "pipeline",
    postType: "teaching",
    project: "TIBBIE X",
    content: {
      source: { label: "FIGMA VARIABLES", chips: ["primary", "surface", "outline"] },
      transform: { label: "SCRIPT", command: "pnpm tokens" },
      output: { label: "TOKENS.CSS", lines: ["surface", "primary", "outline"], highlight: 1 },
      arrows: ["export", "writes"],
    },
  },
  parity: {
    archetype: "parity",
    postType: "progress",
    day: "DAY 04",
    series: "21 DAYS OF DEV",
    project: "TIBBIE X",
    content: {
      left: { label: "FIGMA", specimen: "Follow the build" },
      right: { label: "CODE", specimen: "Follow the build" },
    },
  },
  "before-after": {
    archetype: "before-after",
    postType: "failure",
    project: "TIBBIE X",
    content: {
      before: { items: ["--gray-100", "--gray-200", "--blue-500"] },
      after: { items: ["surface", "surface-container", "primary"] },
    },
  },
  ledger: {
    archetype: "ledger",
    postType: "progress",
    day: "DAY 07",
    series: "21 DAYS OF DEV",
    project: "TIBBIE X",
    content: {
      title: "LIBRARY v0.1 SHIPPED",
      rows: [
        { text: "jkxo-tertiary.json → 90 palette variables" },
        { text: "Scheme roles in six modes" },
        { text: "Post Type modes drive the rail" },
        { text: "One constant frame, three ratios" },
        { text: "Six archetypes as components" },
        { text: "Type stays provisional (decision 1)", mark: "dot" },
      ],
    },
  },
};

export const SAMPLE_LIST = Object.values(SAMPLES);


/**
 * Stories to start a picture or stage postcard from: the retired illustrated set's copy
 * (JKidd - Workbench; the frames were deleted 2026-10-13), each a story label and its location
 * ribbon. The library's own copy, kept when its scenes were dropped.
 */
export const STORY_STARTERS: { story: string; location: string }[] = [
  { location: "COLORADO • HIGH COUNTRY", story: "THE 4:10 NEVER REACHED SILVER PASS" },
  { location: "MISSISSIPPI • MIDNIGHT RUN", story: "THE CARD SHARP WHO STOLE THE MOON" },
  { location: "MARE TRANQUILLITATIS • 2164", story: "SOMEONE PARKED ON THE MOON BUGGY" },
  { location: "EDO • KITES OVER NIHONBASHI", story: "THE PARADE THAT TOOK A WRONG TURN" },
  { location: "VENICE • CARNIVAL, 1598", story: "THE DOGE MISPLACED TUESDAY" },
];
