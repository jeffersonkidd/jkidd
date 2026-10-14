import type { Archetype, CardSpec } from "./Postcard";
import type { IllustratedSpec } from "./postcards/IllustratedPostcard";
import railway from "./assets/postcards/railway.jpg";
import riverboat from "./assets/postcards/riverboat.jpg";
import lunar from "./assets/postcards/lunar.jpg";
import edo from "./assets/postcards/edo.jpg";
import venice from "./assets/postcards/venice.jpg";

export { LINK_SAMPLE } from "./link/sample";

/**
 * The six Postcard/* components from JKidd - Foundations (11:183), as data. Sample copy is
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
      transform: { label: "SCRIPT", command: "npm run tokens" },
      output: { label: "THEME.CSS", lines: ["--surface: …;", "--primary: …;", "--outline: …;"], highlight: 1 },
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
      after: { items: ["surface-primary", "surface-secondary", "accent-brand"] },
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
 * The illustrated postcards from JKidd - Workbench, as data: scene, ribbon and copy
 * exactly as drawn there. Venice sets its title in white; here every title is cream.
 */
export const ILLUSTRATED_SAMPLES: IllustratedSpec[] = [
  { figma: "63:64", scene: railway, ribbon: "rust", title: "Jefferson Kidd", location: "COLORADO • HIGH COUNTRY", story: "THE 4:10 NEVER REACHED SILVER PASS" },
  { figma: "63:55", scene: riverboat, ribbon: "teal", title: null, location: "MISSISSIPPI • MIDNIGHT RUN", story: "THE CARD SHARP WHO STOLE THE MOON" },
  { figma: "66:103", scene: lunar, ribbon: "sky", title: "Jefferson Kidd", location: "MARE TRANQUILLITATIS • 2164", story: "SOMEONE PARKED ON THE MOON BUGGY" },
  { figma: "66:85", scene: edo, ribbon: "vermilion", title: "Jefferson Kidd", location: "EDO • KITES OVER NIHONBASHI", story: "THE PARADE THAT TOOK A WRONG TURN" },
  { figma: "68:40", scene: venice, ribbon: "lagoon", title: "Jefferson Kidd", location: "VENICE • CARNIVAL, 1598", story: "THE DOGE MISPLACED TUESDAY" },
];
