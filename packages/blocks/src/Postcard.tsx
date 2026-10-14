import { forwardRef } from "react";
import { CardFrame, type FrameProps } from "@jkidd/react";
import {
  ArchitectureDiagram,
  BeforeAfter,
  Ledger,
  Manifesto,
  Parity,
  Pipeline,
  type ArchitectureContent,
  type BeforeAfterContent,
  type LedgerContent,
  type ManifestoContent,
  type ParityContent,
  type PipelineContent,
} from "@jkidd/react";
import type { PostType } from "@jkidd/tokens";
import { FIGMA_NODES, type FigmaNode } from "@jkidd/core";

/** A whole card as data: the frame's props plus one archetype and its content. */
export type CardSpec = FrameProps &
  (
    | { archetype: "manifesto"; content: ManifestoContent }
    | { archetype: "architecture"; content: ArchitectureContent }
    | { archetype: "pipeline"; content: PipelineContent }
    | { archetype: "parity"; content: ParityContent }
    | { archetype: "before-after"; content: BeforeAfterContent }
    | { archetype: "ledger"; content: LedgerContent }
  );

export type Archetype = CardSpec["archetype"];

export const ARCHETYPES: Record<Archetype, { name: string; bestFor: PostType[]; figma: FigmaNode; rule: string }> = {
  manifesto: { name: "Manifesto", bestFor: ["principle"], figma: FIGMA_NODES["Postcard/Manifesto"], rule: "One oversized statement. The type is the image." },
  architecture: { name: "Architecture Diagram", bestFor: ["decision", "principle"], figma: FIGMA_NODES["Postcard/Architecture Diagram"], rule: "Two zones, one arrow. Two arrows is two cards." },
  pipeline: { name: "Pipeline", bestFor: ["teaching"], figma: FIGMA_NODES["Postcard/Pipeline"], rule: "Source → one real command → output. Highlight one thing." },
  parity: { name: "Parity", bestFor: ["progress", "teaching"], figma: FIGMA_NODES["Postcard/Parity"], rule: "The same thing twice. The = is the whole argument." },
  "before-after": { name: "Before / After", bestFor: ["failure"], figma: FIGMA_NODES["Postcard/Before After"], rule: "Red only on the left, the fix only on the right." },
  ledger: { name: "Ledger", bestFor: ["progress"], figma: FIGMA_NODES["Postcard/Ledger"], rule: "Real item names, uneven lengths, 6 rows at most." },
};

function Content(spec: CardSpec) {
  switch (spec.archetype) {
    case "manifesto":
      return <Manifesto {...spec.content} />;
    case "architecture":
      return <ArchitectureDiagram {...spec.content} />;
    case "pipeline":
      return <Pipeline {...spec.content} />;
    case "parity":
      return <Parity {...spec.content} />;
    case "before-after":
      return <BeforeAfter {...spec.content} />;
    case "ledger":
      return <Ledger {...spec.content} />;
  }
}

/** Frame + archetype from one CardSpec. */
export const Postcard = forwardRef<HTMLDivElement, { spec: CardSpec }>(function Postcard({ spec }, ref) {
  const { archetype: _a, content: _c, ...frame } = spec;
  return (
    <CardFrame ref={ref} {...frame}>
      <Content {...spec} />
    </CardFrame>
  );
});
