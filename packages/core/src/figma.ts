import { FIGMA_FILE_KEY } from "@jkidd/tokens";

/**
 * The JKidd design libraries: Foundations, then one file per lane, Postcards and Web,
 * each using Foundations and never the other, as the lanes do in code. Foundations was
 * JKidd - DS. Postcards was JKidd - Compositions (renamed 2026-10-20, briefly JKidd -
 * Cards); Web was made the same day. Blocks was emptied into them and deleted 2026-10-20;
 * Primitives is being emptied (Icons into Foundations) and goes once it is.
 */
export const LIBRARIES = {
  Foundations: FIGMA_FILE_KEY,
  Postcards: "N62b8rJJLQ4MT339QUVpr9",
  Web: "WESzLAXCcLo9RK4SfIt4Pa",
  Primitives: "jm9r6k7bY7JuaJup8EWKgQ",
} as const;

/** A node in one of the libraries: [file key, node ID]. data-figma takes the ID ([1]); figmaUrl takes the pair. */
export type FigmaNode = readonly [fileKey: string, node: string];

/** Where each code component lives in the libraries. Its ID is rendered as data-figma on the root element. */
export const FIGMA_NODES = {
  // Foundations (Cover page; marks and the emblem on Marks; the emblem's master on Illustrations)
  /** The Cover frame, on the palm sky (Imagery/Stock/Palm Sky 16:9 (master)). The light and dark covers were deleted 2026-10-19. */
  Cover: [LIBRARIES.Foundations, "484:63"],
  Monogram: [LIBRARIES.Foundations, "7:20"],
  Wordmark: [LIBRARIES.Foundations, "7:27"],
  ProjectMark: [LIBRARIES.Foundations, "7:28"],
  HandleLockup: [LIBRARIES.Foundations, "7:30"],
  /** Variant Badge/Figure × Tone Original/Mono, built from the master (Illustrations › Logo Assets › asset 3, 425:3522). */
  Emblem: [LIBRARIES.Foundations, "611:128"],
  // Postcards (Parts page)
  Kicker: [LIBRARIES.Postcards, "266:258"],
  CheckRow: [LIBRARIES.Postcards, "266:261"],
  TokenChip: [LIBRARIES.Postcards, "266:287"],
  Arrow: [LIBRARIES.Postcards, "266:290"],
  EqualsBadge: [LIBRARIES.Postcards, "266:295"],
  Terminal: [LIBRARIES.Postcards, "266:297"],
  ZoneLabel: [LIBRARIES.Postcards, "266:300"],
  // Postcards (Dressing page): the stock catalog's shapes, @jkidd/ui cards/Dressing.tsx
  Cachet: [LIBRARIES.Postcards, "266:320"],
  RubberStamp: [LIBRARIES.Postcards, "266:343"],
  Imprint: [LIBRARIES.Postcards, "266:349"],
  Airmail: [LIBRARIES.Postcards, "266:380"],
  Registration: [LIBRARIES.Postcards, "266:355"],
  ColorBar: [LIBRARIES.Postcards, "266:360"],
  PhotoCorners: [LIBRARIES.Postcards, "266:368"],
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
  // Postcards (Postcards page)
  "Postcard/Manifesto": [LIBRARIES.Postcards, "266:482"],
  "Postcard/Architecture Diagram": [LIBRARIES.Postcards, "266:484"],
  "Postcard/Pipeline": [LIBRARIES.Postcards, "266:486"],
  "Postcard/Parity": [LIBRARIES.Postcards, "266:488"],
  "Postcard/Before After": [LIBRARIES.Postcards, "266:490"],
  "Postcard/Ledger": [LIBRARIES.Postcards, "266:492"],
  // Postcards (Picture page): the component set (a Front variant per front in FRONTS, each in
  // its series' inks), and the page's section with the brief and the Western inks. Rebuilt here
  // 2026-10-20, when Blocks was deleted.
  PicturePostcard: [LIBRARIES.Postcards, "279:157"],
  PictureBoard: [LIBRARIES.Postcards, "281:37"],
  // Postcards (Stage page): the card, built from its parts (Stage/Paper, Set, Depth Tape, Spike
  // Mark, Figure, Wing, Proscenium, Sheet, Height Bar, Title Strip), and the page's section with
  // the brief, the inks and the squares. Rebuilt 2026-10-20 from StagePostcard.tsx, after the
  // Blocks page was lost.
  StagePostcard: [LIBRARIES.Postcards, "307:29"],
  StageFigure: [LIBRARIES.Postcards, "306:49"],
  StageTitleStrip: [LIBRARIES.Postcards, "306:111"],
  StageBoard: [LIBRARIES.Postcards, "306:30"],
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
 * The link page as live layers in JKidd - Web (rebuilt 2026-10-13 from the Workbench
 * mockup above, at web size: the 800px sheet, not the 1600 canvas). Each entry is
 * [file key, node].
 */
export const LINK_NODES = {
  // Web (Primitives page: Controls; Icon/* on Foundations)
  Tag: [LIBRARIES.Web, "5:395"],
  IconKicker: [LIBRARIES.Web, "5:399"],
  PillButton: [LIBRARIES.Web, "5:405"],
  IconButton: [LIBRARIES.Web, "5:420"],
  Tab: [LIBRARIES.Web, "5:432"],
  Avatar: [LIBRARIES.Web, "5:447"],
  // Web (Layout page)
  Backdrop: [LIBRARIES.Web, "5:496"],
  Sheet: [LIBRARIES.Web, "5:489"],
  // Web (Compositions page)
  LinkHeader: [LIBRARIES.Web, "5:113"],
  LinkProfile: [LIBRARIES.Web, "5:128"],
  TabBar: [LIBRARIES.Web, "5:161"],
  LinkRow: [LIBRARIES.Web, "5:176"],
  LinkTile: [LIBRARIES.Web, "5:233"],
  // Web (Blocks page)
  LinkPage: [LIBRARIES.Web, "5:612"],
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
