import { FIGMA_FILE_KEY } from "@jkidd/tokens";

/**
 * The JKidd design libraries, in layer order; each uses only the ones before it, as
 * the packages do. Foundations was JKidd - DS. The other four were split out of
 * it on 2026-10-12 and fill as components are moved across in Figma; until then the
 * node IDs below still point into Foundations.
 */
export const LIBRARIES = {
  Foundations: FIGMA_FILE_KEY,
  Primitives: "jm9r6k7bY7JuaJup8EWKgQ",
  Layout: "JzxtC4giYrjWyiJbeNn7lY",
  Compositions: "N62b8rJJLQ4MT339QUVpr9",
  Blocks: "1qe9bxB8lEeLhFolzYd5sI",
} as const;

/** Where each code component lives in JKidd - Foundations. Rendered as data-figma on the root element. */
export const FIGMA_NODES = {
  /** The Cover frame; its Scheme mode switches it between light and dark. */
  Cover: "98:3432",
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

/** JKidd - Workbench: the link page and the picture postcard are drawn here, not in the library yet. */
export const WORKBENCH_FILE_KEY = "7Q8GN3IPMoM6lhFtIMquya";

/** Linktrees page (102:551): the original mockup, now reference only; the live layers are LINK_NODES. */
export const WORKBENCH_NODES = {
  LinkPage: "120:1335",
  LinkBackdrop: "120:1338",
  LinkPaper: "103:627",
  LinkRow: "118:515",
  /** Postcard Image Algo page: the large-letter front gallery and its production spec, one flattened frame. */
  PostcardFronts: "147:948",
  /** Picture postcard board on the same page (Handoff): the brief, the ink swatches and the component. */
  PictureBoard: "285:247",
  PicturePostcard: "158:580",
} as const;

/**
 * The link page as live layers across the five libraries (rebuilt 2026-10-13 from the
 * Workbench mockup above, at web size: the 800px sheet, not the 1600 canvas). Each
 * entry is [file key, node].
 */
export const LINK_NODES = {
  // Primitives (Controls page; Icon/* on Icons)
  Tag: [LIBRARIES.Primitives, "36:31"],
  IconKicker: [LIBRARIES.Primitives, "36:33"],
  PillButton: [LIBRARIES.Primitives, "36:50"],
  IconButton: [LIBRARIES.Primitives, "36:67"],
  Tab: [LIBRARIES.Primitives, "36:96"],
  Avatar: [LIBRARIES.Primitives, "36:107"],
  // Layout (Web page)
  Stage: [LIBRARIES.Layout, "29:35"],
  Sheet: [LIBRARIES.Layout, "29:28"],
  // Compositions (Link page)
  LinkHeader: [LIBRARIES.Compositions, "42:141"],
  LinkProfile: [LIBRARIES.Compositions, "42:241"],
  TabBar: [LIBRARIES.Compositions, "42:354"],
  LinkRow: [LIBRARIES.Compositions, "44:203"],
  LinkTile: [LIBRARIES.Compositions, "44:218"],
  // Blocks (Link Page page)
  LinkPage: [LIBRARIES.Blocks, "29:990"],
} as const satisfies Record<string, readonly [string, string]>;

/** Architect's Notebook: the hand-drawn kit, a published library upstream of this one. Files come in by `pnpm notebook`. */
export const NOTEBOOK_FILE_KEY = "gWBVp3oNqUv7ymJXNORuM0";

export const NOTEBOOK_NODES = {
  /** Stick figures page; the animated loops are generated from the same rig (gen-figure-anim.js). */
  Figures: "37:2",
} as const;

export function figmaUrl(node: string, fileKey: string = FIGMA_FILE_KEY) {
  const library = (Object.keys(LIBRARIES) as (keyof typeof LIBRARIES)[]).find((k) => LIBRARIES[k] === fileKey);
  const name =
    fileKey === WORKBENCH_FILE_KEY
      ? "JKidd---Workbench"
      : fileKey === NOTEBOOK_FILE_KEY
        ? "Architects-Notebook"
        : `JKidd---${library ?? "DS"}`;
  return `https://www.figma.com/design/${fileKey}/${name}?node-id=${node.replace(":", "-")}`;
}
