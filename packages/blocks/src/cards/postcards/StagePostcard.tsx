import { forwardRef, useId, type CSSProperties } from "react";
import rough from "roughjs";
import { NOTEBOOK_NODES } from "@jkidd/core";
import { figureBoxFor, figurePose, figureTransform, type FigureCycle, type FigureLine } from "@jkidd/core";
import { FigureStrokes } from "@jkidd/ui/cards";
import stock from "@jkidd/ui/imagery/stock/paper-3x2.jpg";

/**
 * The stage postcard: a theatre stage drawn in one-point perspective on graph paper
 * ruled over the card stock (its 3:2 cut, the shape of the canvas, so never stretched),
 * in the Architect's Notebook hand, with stick figures at three depths. Not in
 * Workbench yet. Drawn on a 1536×1024 canvas and scaled, never reflowed.
 *
 * The paper sets the dimensions. One square is 32px, and the stage is built so a
 * figure is a whole number of squares tall wherever it stands: 8 downstage, 6
 * midstage, 4 upstage, 3 at the back wall. That falls out of one rule, from a
 * camera two figures high: a figure H px tall stands on y = HORIZON + 2H.
 */

export const STAGE_CANVAS = { width: 1536, height: 1024 } as const;
export const STAGE_SQUARE = 32;

const CX = 768;
/** Halo tile cut from the middle of the stock, in the figure's own units. */
const HALO_TILE = 192;
const HORIZON = 320;
/** Floor half-width per px below the horizon: the stage narrows toward the vanishing point. */
const SPREAD = 1.125;
const floorAt = (squares: number) => HORIZON + 2 * squares * STAGE_SQUARE;
const halfWidth = (y: number) => SPREAD * (y - HORIZON);

export const STAGE_DEPTHS = ["up", "mid", "down"] as const;
export type StageDepth = (typeof STAGE_DEPTHS)[number];

type Depth = {
  name: string;
  /** Figure height in squares. */
  squares: number;
  /** Feet line, canvas px. */
  floor: number;
  /** Visible floor at this depth. */
  lane: readonly [number, number];
  /** The wings: a figure walks from behind one to behind the other, and is clipped to this span. */
  wings: readonly [number, number];
};

const depth = (name: string, squares: number, wing: number): Depth => {
  const floor = floorAt(squares);
  const lane = [CX - halfWidth(floor), CX + halfWidth(floor)] as const;
  return { name, squares, floor, lane, wings: [lane[0] - wing, lane[1] + wing] };
};

/** Downstage's wings are the proscenium piers (64–192 and 1344–1472). */
export const STAGE: Record<StageDepth, Depth> = {
  up: depth("Upstage", 4, 115),
  mid: depth("Midstage", 6, 173),
  down: depth("Downstage", 8, 128),
};

const BACK = floorAt(3);
const APRON = 864;
const LIP = 880;
const BAND = 896;
/** Flats and the back wall are 2.6 figures tall at their own depth. */
const FLAT = 2.6;

export type StageActor = {
  depth: StageDepth;
  cycle: FigureCycle;
  /** 1 walks right, -1 walks left. */
  dir: 1 | -1;
  /** Where a waving figure stands, as a fraction of its depth's floor. */
  at?: number;
  /** Drawings ahead of the clock, so figures don't step in time. */
  offset?: number;
};

export type StageSpec = {
  story: string | null;
  location: string | null;
  actors: StageActor[];
  line: FigureLine;
};

/* ---- the drawing: rough.js, seeded, built once ---------------------------- */

type Kind = "ink" | "thin" | "faint" | "hatch" | "tape" | "dim";
type Stroke = { d: string; kind: Kind };
type Fill = { points: string; kind: "paper" | "flat" };
type Layer = { fills: Fill[]; strokes: Stroke[] };

const PEN = { roughness: 0.9, bowing: 0.9, preserveVertices: false };

function drawStage(): Record<"back" | StageDepth | "front", Layer> {
  const g = rough.generator();
  let seed = 7;
  const layer = (): Layer => ({ fills: [], strokes: [] });
  const add = (l: Layer, drawable: ReturnType<typeof g.line>) => {
    for (const p of g.toPaths(drawable)) l.strokes.push({ d: p.d, kind: p.stroke as Kind });
  };
  const line = (l: Layer, kind: Kind, x1: number, y1: number, x2: number, y2: number) =>
    add(l, g.line(x1, y1, x2, y2, { ...PEN, seed: seed++, stroke: kind }));
  const box = (l: Layer, x: number, y: number, w: number, h: number, fill?: Fill["kind"], hatch?: number) => {
    if (fill) l.fills.push({ points: `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`, kind: fill });
    add(
      l,
      g.rectangle(x, y, w, h, {
        ...PEN,
        seed: seed++,
        stroke: "ink",
        ...(hatch ? { fill: "hatch", fillStyle: "hachure", hachureAngle: hatch, hachureGap: 14, fillWeight: 1 } : {}),
      }),
    );
  };

  const back = layer();
  // back wall
  const bw = halfWidth(BACK);
  box(back, CX - bw, BACK - FLAT * 3 * STAGE_SQUARE, 2 * bw, FLAT * 3 * STAGE_SQUARE, "flat");
  // floor, and the apron's lip
  const front = halfWidth(APRON);
  const floor = [
    [CX - bw, BACK],
    [CX + bw, BACK],
    [CX + front, APRON],
    [CX - front, APRON],
  ] as [number, number][];
  back.fills.push({ points: floor.map((p) => p.join(",")).join(" "), kind: "paper" });
  add(back, g.polygon(floor, { ...PEN, seed: seed++, stroke: "ink" }));
  line(back, "ink", CX - front, LIP, CX + front, LIP);
  line(back, "thin", CX - front, APRON, CX - front, LIP);
  line(back, "thin", CX + front, APRON, CX + front, LIP);
  // boards, converging on the vanishing point
  const toBack = (BACK - HORIZON) / (APRON - HORIZON);
  for (let k = -6; k <= 6; k++) {
    if (!k) continue;
    const xf = CX + k * 96;
    line(back, "faint", CX + (xf - CX) * toBack, BACK, xf, APRON);
  }
  // depth tape
  for (const d of STAGE_DEPTHS) {
    const { floor: y, lane } = STAGE[d];
    line(back, "tape", lane[0], y, lane[1], y);
  }

  const up = layer();
  const mid = layer();
  for (const [l, d] of [
    [up, STAGE.up],
    [mid, STAGE.mid],
  ] as const) {
    const w = d.lane[0] - d.wings[0];
    const h = FLAT * d.squares * STAGE_SQUARE;
    box(l, d.wings[0], d.floor - h, w, h, "flat", 52);
    box(l, d.lane[1], d.floor - h, w, h, "flat", 128);
  }

  // proscenium: piers and header, hatched like a section cut
  const down = layer();
  box(down, 64, 192, 128, STAGE.down.floor - 192, "paper", 45);
  box(down, 1344, 192, 128, STAGE.down.floor - 192, "paper", 45);
  box(down, 64, 64, 1408, 128, "paper", 45);

  // sheet border and the title strip
  const sheet = layer();
  box(sheet, 32, BAND, 1472, 992 - BAND, "paper");
  line(sheet, "thin", 1088, BAND, 1088, 992);
  line(sheet, "thin", 1344, BAND, 1344, 992);
  box(sheet, 32, 32, 1472, 960);
  // a height bar per depth, drawn over everything like any dimension
  for (const d of STAGE_DEPTHS) {
    const { floor: y, lane, squares } = STAGE[d];
    const x = lane[1] - 28;
    const top = y - squares * STAGE_SQUARE;
    line(sheet, "dim", x, y, x, top);
    line(sheet, "dim", x - 7, y + 7, x + 7, y - 7);
    line(sheet, "dim", x - 7, top + 7, x + 7, top - 7);
  }

  return { back, up, mid, down, front: sheet };
}

const LAYERS = drawStage();

function Static({ layer }: { layer: Layer }) {
  return (
    <>
      {layer.fills.flatMap((f, i) => [
        <polygon key={`f${i}`} points={f.points} className="jk-stage__paper" />,
        // A flat is the stock a shade darker: the same paper with a wash of ink over it.
        f.kind === "flat" ? <polygon key={`s${i}`} points={f.points} className="jk-stage__flat" /> : null,
      ])}
      {layer.strokes.map((s, i) => (
        <path key={i} d={s.d} className={`jk-stage__${s.kind}`} />
      ))}
    </>
  );
}

/* ---- the card ------------------------------------------------------------- */

export const StagePostcard = forwardRef<HTMLDivElement, { spec: StageSpec; drawing?: number }>(function StagePostcard(
  { spec, drawing = 0 },
  ref,
) {
  const id = useId();
  const clip = (d: StageDepth) => `${id}-${d}`;
  // The stock as a paint, so the floor, piers, flats and title strip cut the grid back to
  // card stock. Plain characters: the id is written into a CSS url().
  const stockId = `stock-${id.replace(/[^\w-]/g, "")}`;
  const style = {
    "--stage-stock": `url("${stock}")`,
    "--stage-stock-paint": `url(#${stockId})`,
    "--figure-halo": `url(#${stockId}-plain)`,
  } as CSSProperties;
  const story = spec.story?.trim() || null;
  const location = spec.location?.trim() || null;

  const poses = spec.actors.map((a) => {
    const d = STAGE[a.depth];
    return {
      actor: a,
      pose: figurePose({ cycle: a.cycle, line: spec.line }, drawing + (a.offset ?? 0), STAGE_CANVAS, {
        height: figureBoxFor(d.squares * STAGE_SQUARE),
        floor: d.floor,
        lane: a.cycle === "wave" ? d.lane : d.wings,
        dir: a.dir,
        at: a.at,
      }),
    };
  });

  return (
    <div ref={ref} className="jk-stage" style={style}>
      <svg className="jk-stage__drawing" viewBox={`0 0 ${STAGE_CANVAS.width} ${STAGE_CANVAS.height}`} aria-hidden="true">
        <defs>
          <pattern id={stockId} patternUnits="userSpaceOnUse" width={STAGE_CANVAS.width} height={STAGE_CANVAS.height}>
            <image href={stock} width={STAGE_CANVAS.width} height={STAGE_CANVAS.height} preserveAspectRatio="none" />
          </pattern>
          {/* Halos: a figure is drawn in its own scaled units, so it tiles the stock's plain middle, clear of the burnt edge. */}
          <pattern id={`${stockId}-plain`} patternUnits="userSpaceOnUse" width={HALO_TILE} height={HALO_TILE}>
            <image href={stock} x={-STAGE_CANVAS.width / 2} y={-STAGE_CANVAS.height / 2} width={STAGE_CANVAS.width} height={STAGE_CANVAS.height} preserveAspectRatio="none" />
          </pattern>
          {STAGE_DEPTHS.map((d) => (
            <clipPath key={d} id={clip(d)}>
              <rect x={STAGE[d].wings[0]} y={0} width={STAGE[d].wings[1] - STAGE[d].wings[0]} height={STAGE_CANVAS.height} />
            </clipPath>
          ))}
        </defs>

        <Static layer={LAYERS.back} />
        {STAGE_DEPTHS.map((d) => {
          const { lane, floor, squares, name } = STAGE[d];
          const size = 8 + squares * 1.5;
          return (
            <g key={d}>
              <text className="jk-stage__depth" x={lane[0] + 36} y={floor - 10} fontSize={size}>
                {name.toUpperCase()} · {squares} SQ
              </text>
            </g>
          );
        })}
        {poses
          .filter(({ actor }) => actor.cycle === "wave")
          .map(({ actor, pose }, i) => {
            const x = pose.x + pose.width / 2;
            const y = STAGE[actor.depth].floor + 4;
            const r = STAGE[actor.depth].squares * 2.5;
            return (
              <g key={i} className="jk-stage__spike">
                <line x1={x - r} y1={y - r / 2} x2={x + r} y2={y + r / 2} />
                <line x1={x - r} y1={y + r / 2} x2={x + r} y2={y - r / 2} />
              </g>
            );
          })}

        {STAGE_DEPTHS.map((d) => (
          <g key={d}>
            <g clipPath={`url(#${clip(d)})`} data-figma={NOTEBOOK_NODES.Figures}>
              {poses
                .filter(({ actor }) => actor.depth === d)
                .map(({ actor, pose }, i) => (
                  <g key={i} transform={figureTransform(pose)} data-cycle={actor.cycle}>
                    <FigureStrokes pose={pose} />
                  </g>
                ))}
            </g>
            <Static layer={LAYERS[d]} />
          </g>
        ))}
        <Static layer={LAYERS.front} />
        {STAGE_DEPTHS.map((d) => {
          const { lane, floor, squares } = STAGE[d];
          return (
            <text
              key={d}
              className="jk-stage__dim-label"
              x={lane[1] - 42}
              y={floor - (squares * STAGE_SQUARE) / 2 + 8}
              fontSize={14 + squares * 1.5}
              textAnchor="end"
            >
              {squares}
            </text>
          );
        })}
      </svg>

      <div className="jk-stage__title">
        <div className="jk-stage__cell">
          <span className="jk-stage__label">Story</span>
          <span className="jk-stage__story" data-long={story && story.length > 40 ? "" : undefined}>
            {story}
          </span>
        </div>
        <div className="jk-stage__cell">
          <span className="jk-stage__label">Location</span>
          <span className="jk-stage__value">{location}</span>
        </div>
        <div className="jk-stage__cell">
          <span className="jk-stage__label">Squares</span>
          <span className="jk-stage__value">
            {STAGE.down.squares} · {STAGE.mid.squares} · {STAGE.up.squares}
          </span>
        </div>
      </div>
    </div>
  );
});
