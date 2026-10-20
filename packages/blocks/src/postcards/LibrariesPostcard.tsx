import { forwardRef, useId, type CSSProperties } from "react";
import rough from "roughjs";
import { LIBRARIES, NOTEBOOK_SHAPES, type NotebookShapeName } from "@jkidd/core";
import stock from "@jkidd/ui/imagery/stock/paper-3x2.jpg";

/**
 * The library pipeline card: the four Figma files, in layer order, drawn as a sheet in
 * the Architect's Notebook on the stage's graph paper (32px squares over the card stock).
 * Every shape is the kit's own (`NOTEBOOK_SHAPES`), placed on the grid; the sheet border
 * is rough.js with the kit's pen, like the stage's. Not in Workbench or the libraries
 * yet. Drawn on a 1536×1024 canvas and scaled, never reflowed.
 *
 * The copy is the repo's own: the libraries and their pages (packages/core/src/figma.ts),
 * the packages they map to and the layer rule (README).
 */

export const LIBRARIES_CANVAS = { width: 1536, height: 1024 } as const;

type Library = {
  name: keyof typeof LIBRARIES;
  shape: NotebookShapeName;
  /** Where the name sits inside the shape, in the shape's own units. */
  label: readonly [number, number];
  holds: readonly [string, string];
  code: string;
};

export const LIBRARY_PIPELINE: readonly Library[] = [
  { name: "Foundations", shape: "cylinder", label: [60, 50], holds: ["Variables · text styles", "Marks · cover"], code: "tokens · ui/foundations" },
  { name: "Primitives", shape: "stack", label: [64, 52], holds: ["Card parts · dressing", "Controls · icons"], code: "ui/primitives" },
  { name: "Compositions", shape: "window-frame", label: [60, 56], holds: ["Frame · canvases · web", "Archetypes · link"], code: "ui/compositions" },
  { name: "Blocks", shape: "document", label: [60, 40], holds: ["Postcards · link page", "Picture · stage"], code: "@jkidd/blocks" },
];

/** Nodes are 8 squares wide with 4-square arrows between: 4×256 + 3×128 fills the sheet's 1408px. */
const NODE = { w: 256, h: 192, top: 288 } as const;
const GAP = 128;
const nodeX = (i: number) => 64 + i * (NODE.w + GAP);
/** Canvas px per kit stroke-width unit: the kit's 1.6 pen draws 3.2, the stage's ink. */
const INK = 2;

/* ---- the kit's shapes, placed ---------------------------------------------- */

type Ink = "ink" | "blueprint" | "red-pen";

function Shape({
  name,
  x,
  y,
  w,
  h,
  flip,
  ink = "ink",
}: {
  name: NotebookShapeName;
  x: number;
  y: number;
  /** Size on the canvas; the shape stretches to it, and its line weight doesn't. */
  w: number;
  h: number;
  /** Turned half round, end for end. */
  flip?: boolean;
  ink?: Ink;
}) {
  const s = NOTEBOOK_SHAPES[name];
  const sx = w / s.w;
  const sy = h / s.h;
  const t = flip ? `translate(${x + w} ${y + h}) scale(${-sx} ${-sy})` : `translate(${x} ${y}) scale(${sx} ${sy})`;
  return (
    <g transform={t} className={`jk-libraries__shape jk-libraries__shape--${ink}`} data-shape={name}>
      {s.paths.map((p, i) =>
        p.solid ? (
          <path key={i} d={p.d} className="jk-libraries__solid" />
        ) : (
          <path key={i} d={p.d} strokeWidth={p.pen * INK} strokeDasharray={p.dash} vectorEffect="non-scaling-stroke" />
        ),
      )}
    </g>
  );
}

/* ---- the sheet: rough.js, seeded, built once -------------------------------- */

function drawSheet(): string[] {
  const g = rough.generator();
  const pen = { roughness: 0.9, bowing: 0.9, preserveVertices: false };
  return [
    g.rectangle(32, 32, 1472, 960, { ...pen, seed: 3 }),
    g.line(32, 896, 1504, 896, { ...pen, seed: 4 }),
    g.line(608, 896, 608, 992, { ...pen, seed: 5 }),
    g.line(1184, 896, 1184, 992, { ...pen, seed: 6 }),
  ].flatMap((d) => g.toPaths(d).map((p) => p.d));
}

const SHEET = drawSheet();

/* ---- the card ------------------------------------------------------------- */

export const LibrariesPostcard = forwardRef<HTMLDivElement>(function LibrariesPostcard(_, ref) {
  // The stock as a paint, so the title strip and the shapes' insides cut the grid back to
  // card stock. Plain characters: the id is written into a CSS url().
  const stockId = `stock-${useId().replace(/[^\w-]/g, "")}`;
  const style = { "--libraries-stock": `url("${stock}")`, "--libraries-stock-paint": `url(#${stockId})` } as CSSProperties;
  return (
    <div ref={ref} className="jk-libraries" style={style}>
      <svg className="jk-libraries__drawing" viewBox={`0 0 ${LIBRARIES_CANVAS.width} ${LIBRARIES_CANVAS.height}`} role="img" aria-label="The four Figma files: Foundations, Primitives, Compositions, Blocks. Each uses only the ones before it.">
        <defs>
          <pattern id={stockId} patternUnits="userSpaceOnUse" width={LIBRARIES_CANVAS.width} height={LIBRARIES_CANVAS.height}>
            <image href={stock} width={LIBRARIES_CANVAS.width} height={LIBRARIES_CANVAS.height} preserveAspectRatio="none" />
          </pattern>
        </defs>
        {/* the sheet's border and title strip, cut back to card stock */}
        <rect x={32} y={896} width={1472} height={96} className="jk-libraries__paper" />
        {SHEET.map((d, i) => (
          <path key={i} d={d} className="jk-libraries__rule" />
        ))}

        {/* title */}
        <text x={64} y={104} className="jk-libraries__kicker">
          JKIDD · FIGMA LIBRARIES
        </text>
        <text x={64} y={180} className="jk-libraries__title">
          The four Figma files
        </text>
        <Shape name="underline-squiggle" x={64} y={192} w={576} h={36} ink="blueprint" />
        <Shape name="north-arrow" x={1376} y={64} w={84} h={108} />

        {/* the pipeline */}
        {LIBRARY_PIPELINE.map((lib, i) => {
          const x = nodeX(i);
          const s = NOTEBOOK_SHAPES[lib.shape];
          const cx = x + (lib.label[0] / s.w) * NODE.w;
          const cy = NODE.top + (lib.label[1] / s.h) * NODE.h;
          return (
            <g key={lib.name} data-library={lib.name}>
              <text x={x + 8} y={NODE.top - 12} className="jk-libraries__index">
                {String(i + 1).padStart(2, "0")}
              </text>
              <rect x={x + 24} y={NODE.top + 24} width={NODE.w - 48} height={NODE.h - 64} className="jk-libraries__paper" />
              <Shape name={lib.shape} x={x} y={NODE.top} w={NODE.w} h={NODE.h} />
              <text x={cx} y={cy} className="jk-libraries__name" textAnchor="middle" dominantBaseline="central">
                {lib.name}
              </text>
              {lib.holds.map((line, k) => (
                <text key={k} x={x + 8} y={NODE.top + NODE.h + 40 + k * 28} className="jk-libraries__holds">
                  {line}
                </text>
              ))}
              <text x={x + 8} y={NODE.top + NODE.h + 104} className="jk-libraries__code">
                {lib.code}
              </text>
              <text x={x + 8} y={NODE.top + NODE.h + 132} className="jk-libraries__key">
                {LIBRARIES[lib.name]}
              </text>
              {i < LIBRARY_PIPELINE.length - 1 && (
                <Shape name="arrow-right" x={x + NODE.w + 8} y={NODE.top + NODE.h / 2 - 22} w={GAP - 16} h={44} />
              )}
            </g>
          );
        })}

        {/* nothing flows back up: Blocks into Compositions, struck out */}
        <Shape name="arrow-curved" x={1072} y={640} w={288} h={192} flip />
        <Shape name="x-mark" x={1160} y={736} w={84} h={84} ink="red-pen" />

        {/* the rule, pointed at */}
        <Shape name="figure-pointing" x={72} y={704} w={111} h={165} />
        <text x={208} y={776} className="jk-libraries__rule-text">
          Each uses only the ones before it.
        </text>
        <text x={208} y={816} className="jk-libraries__holds">
          scripts/layers.test.mjs fails the build if one reaches up
        </text>
      </svg>

      <div className="jk-libraries__strip">
        <div className="jk-libraries__cell">
          <span className="jk-libraries__label">Packages</span>
          <span className="jk-libraries__value">tokens → core → ui → blocks</span>
        </div>
        <div className="jk-libraries__cell">
          <span className="jk-libraries__label">Revised</span>
          <span className="jk-libraries__value">2026-10-19 · Layout into Compositions</span>
        </div>
        <div className="jk-libraries__cell">
          <span className="jk-libraries__label">Drawn in</span>
          <span className="jk-libraries__value">Architect's Notebook</span>
        </div>
      </div>
    </div>
  );
});
