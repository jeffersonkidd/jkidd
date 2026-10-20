import { FIGMA_FILE_KEY } from "@jkidd/tokens";

/**
 * The JKidd design libraries: Foundations, then one file per lane, Postcards and Web,
 * each using Foundations and never the other, as the lanes do in code. Foundations was
 * JKidd - DS. Postcards was JKidd - Compositions (renamed 2026-10-20, briefly JKidd -
 * Cards); Web was made the same day. Primitives and Blocks are being emptied into them
 * (Icons into Foundations) and go once they are; their pages become page groups in
 * Postcards and Web.
 */
export const LIBRARIES = {
  Foundations: FIGMA_FILE_KEY,
  Postcards: "N62b8rJJLQ4MT339QUVpr9",
  Web: "WESzLAXCcLo9RK4SfIt4Pa",
  Primitives: "jm9r6k7bY7JuaJup8EWKgQ",
  Blocks: "1qe9bxB8lEeLhFolzYd5sI",
} as const;

/** A node in one of the libraries: [file key, node ID]. data-figma takes the ID ([1]); figmaUrl takes the pair. */
export type FigmaNode = readonly [fileKey: string, node: string];

/** Where each code component lives in the libraries. Its ID is rendered as data-figma on the root element. */
export const FIGMA_NODES = {
  // Foundations (Cover page; marks and the emblem on Marks; the emblem's master on Illustrations)
  /** The Cover frame, on the palm sky (Imagery/Palm Sky). The light and dark covers were deleted 2026-10-19. */
  Cover: [LIBRARIES.Foundations, "484:63"],
  Monogram: [LIBRARIES.Foundations, "7:20"],
  Wordmark: [LIBRARIES.Foundations, "7:27"],
  ProjectMark: [LIBRARIES.Foundations, "7:28"],
  HandleLockup: [LIBRARIES.Foundations, "7:30"],
  /** Variant Badge/Figure × Tone Original/Mono, built from the master (Illustrations › Logo Assets › asset 3, 425:3522). */
  Emblem: [LIBRARIES.Foundations, "611:128"],
  // Primitives (Card Parts page)
  Kicker: [LIBRARIES.Primitives, "65:62"],
  CheckRow: [LIBRARIES.Primitives, "65:65"],
  TokenChip: [LIBRARIES.Primitives, "65:86"],
  Arrow: [LIBRARIES.Primitives, "65:89"],
  EqualsBadge: [LIBRARIES.Primitives, "65:94"],
  Terminal: [LIBRARIES.Primitives, "65:96"],
  ZoneLabel: [LIBRARIES.Primitives, "65:99"],
  // Primitives (Dressing page): the stock catalog's shapes, @jkidd/ui cards/Dressing.tsx
  Cachet: [LIBRARIES.Primitives, "203:2"],
  RubberStamp: [LIBRARIES.Primitives, "205:6"],
  Imprint: [LIBRARIES.Primitives, "205:10"],
  Airmail: [LIBRARIES.Primitives, "205:13"],
  Registration: [LIBRARIES.Primitives, "205:16"],
  ColorBar: [LIBRARIES.Primitives, "205:19"],
  PhotoCorners: [LIBRARIES.Primitives, "205:33"],
  // Postcards (Frame page)
  CardFrame: [LIBRARIES.Postcards, "252:521"],
  ContentEmpty: [LIBRARIES.Postcards, "252:574"],
  // Postcards (Archetypes page)
  Manifesto: [LIBRARIES.Postcards, "81:239"],
  ArchitectureDiagram: [LIBRARIES.Postcards, "81:247"],
  Pipeline: [LIBRARIES.Postcards, "81:262"],
  Parity: [LIBRARIES.Postcards, "81:281"],
  BeforeAfter: [LIBRARIES.Postcards, "81:294"],
  Ledger: [LIBRARIES.Postcards, "81:305"],
  // Blocks (Postcards page)
  "Postcard/Manifesto": [LIBRARIES.Blocks, "61:812"],
  "Postcard/Architecture Diagram": [LIBRARIES.Blocks, "61:814"],
  "Postcard/Pipeline": [LIBRARIES.Blocks, "61:816"],
  "Postcard/Parity": [LIBRARIES.Blocks, "61:818"],
  "Postcard/Before After": [LIBRARIES.Blocks, "61:820"],
  "Postcard/Ledger": [LIBRARIES.Blocks, "61:822"],
  // Blocks (Picture Postcard page): the component, and the board with the brief and the Western inks
  PicturePostcard: [LIBRARIES.Blocks, "77:1763"],
  PictureBoard: [LIBRARIES.Blocks, "77:1719"],
} as const satisfies Record<string, FigmaNode>;

export type FigmaNodeName = keyof typeof FIGMA_NODES;

/** JKidd - Workbench: drafts and reference that aren't in the libraries. */
export const WORKBENCH_FILE_KEY = "7Q8GN3IPMoM6lhFtIMquya";

/** Linktrees page (102:551): the original mockup, now reference only; the live layers are LINK_NODES. */
export const WORKBENCH_NODES = {
  LinkPage: "120:1335",
  LinkBackdrop: "120:1338",
  LinkPaper: "103:627",
  LinkRow: "118:515",
  /** Postcard Image Algo page: the large-letter front gallery and its production spec, one flattened frame. */
  PostcardFronts: "147:948",
} as const;

/**
 * The link page as live layers across the four libraries (rebuilt 2026-10-13 from the
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
  // Postcards (Web page)
  Stage: [LIBRARIES.Postcards, "252:642"],
  Sheet: [LIBRARIES.Postcards, "252:635"],
  // Postcards (Link page)
  LinkHeader: [LIBRARIES.Postcards, "42:141"],
  LinkProfile: [LIBRARIES.Postcards, "42:241"],
  TabBar: [LIBRARIES.Postcards, "42:354"],
  LinkRow: [LIBRARIES.Postcards, "44:203"],
  LinkTile: [LIBRARIES.Postcards, "44:218"],
  // Blocks (Link Page page)
  LinkPage: [LIBRARIES.Blocks, "29:990"],
} as const satisfies Record<string, FigmaNode>;

/** Architect's Notebook: the hand-drawn kit, a published library upstream of this one. Files come in by `pnpm notebook`. */
export const NOTEBOOK_FILE_KEY = "gWBVp3oNqUv7ymJXNORuM0";

export const NOTEBOOK_NODES = {
  /** Stick figures page; the animated loops are generated from the same rig (gen-figure-anim.js). */
  Figures: "37:2",
} as const;

/** A Figma link to a library node ([file key, node]), or to a node ID in another file (Foundations by default). */
export function figmaUrl(node: string | FigmaNode, fileKey: string = FIGMA_FILE_KEY) {
  if (typeof node !== "string") [fileKey, node] = node;
  const library = (Object.keys(LIBRARIES) as (keyof typeof LIBRARIES)[]).find((k) => LIBRARIES[k] === fileKey);
  const name =
    fileKey === WORKBENCH_FILE_KEY
      ? "JKidd---Workbench"
      : fileKey === NOTEBOOK_FILE_KEY
        ? "Architects-Notebook"
        : `JKidd---${library ?? "Foundations"}`;
  return `https://www.figma.com/design/${fileKey}/${name}?node-id=${node.replace(":", "-")}`;
}
