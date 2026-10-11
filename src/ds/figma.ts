import { FIGMA_FILE_KEY } from "./tokens.gen";

/** Where each code component lives in JKidd - DS. Rendered as data-figma on the root element. */
export const FIGMA_NODES = {
  Cover: "11:1298",
  Monogram: "7:20",
  Wordmark: "7:27",
  ProjectMark: "7:28",
  HandleLockup: "7:30",
  CardFrame: "8:60",
  ContentEmpty: "8:2",
  Kicker: "9:3",
  CheckRow: "9:24",
  TokenChip: "9:25",
  Arrow: "9:28",
  EqualsBadge: "9:33",
  Terminal: "9:35",
  ZoneLabel: "9:38",
  Manifesto: "11:3",
  ArchitectureDiagram: "11:13",
  Pipeline: "11:44",
  Parity: "11:82",
  BeforeAfter: "11:98",
  Ledger: "11:123",
  "Postcard/Manifesto": "11:184",
  "Postcard/Architecture Diagram": "11:212",
  "Postcard/Pipeline": "11:261",
  "Postcard/Parity": "11:317",
  "Postcard/Before After": "11:351",
  "Postcard/Ledger": "11:397",
} as const;

export type FigmaNodeName = keyof typeof FIGMA_NODES;

/** JKidd - Workbench: the link page and the illustrated postcards are drawn here, not in the library yet. */
export const WORKBENCH_FILE_KEY = "7Q8GN3IPMoM6lhFtIMquya";

/** Linktrees page (102:551). Only Link Row is live layers; the page itself is a flattened mockup. */
export const WORKBENCH_NODES = {
  LinkPage: "120:1335",
  LinkBackdrop: "120:1338",
  LinkPaper: "103:627",
  LinkRow: "118:515",
  /** Illustrated postcards; each sample carries its own node (ILLUSTRATED_SAMPLES). */
  IllustratedPostcard: "63:55",
  /** Postcard Image Algo page: the large-letter front gallery and its production spec, one flattened frame. */
  PostcardFronts: "147:948",
  /** Cartoon postcards board on the same page: Cartoon/* ink swatches and the component. */
  CartoonBoard: "158:536",
  CartoonPostcard: "158:580",
} as const;

/** Architect's Notebook: the hand-drawn kit, a published library upstream of this one. Files come in by `pnpm notebook`. */
export const NOTEBOOK_FILE_KEY = "gWBVp3oNqUv7ymJXNORuM0";

export const NOTEBOOK_NODES = {
  /** Stick figures page; the animated loops are generated from the same rig (gen-figure-anim.js). */
  Figures: "37:2",
} as const;

export function figmaUrl(node: string, fileKey: string = FIGMA_FILE_KEY) {
  const name =
    fileKey === WORKBENCH_FILE_KEY ? "JKidd---Workbench" : fileKey === NOTEBOOK_FILE_KEY ? "Architects-Notebook" : "JKidd---DS";
  return `https://www.figma.com/design/${fileKey}/${name}?node-id=${node.replace(":", "-")}`;
}
