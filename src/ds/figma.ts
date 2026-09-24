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

export function figmaUrl(node: string) {
  return `https://www.figma.com/design/${FIGMA_FILE_KEY}/JKidd---DS?node-id=${node.replace(":", "-")}`;
}
