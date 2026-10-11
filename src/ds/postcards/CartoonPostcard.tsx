import { forwardRef } from "react";
import { GENRE_RIBBONS } from "../tokens.gen";
import { NOTEBOOK_NODES } from "../figma";
import { FIGURE_HALO, FIGURE_PEN, figurePose, type FigureSpec } from "./figure";

/**
 * The cartoon side of the postcard, for silly days: a generated large-letter front
 * (Postcard Image Algo 147:933) with the illustrated genre's comic story on top, set
 * in the front's own inks. The story label and location ribbon are live; the
 * picture is one raster. Drawn on a 1536×1024 canvas and scaled, never reflowed.
 * An Architect's Notebook stick figure can walk along the bottom, between the
 * picture and the story; the caller drives it with a drawing number.
 */

export const CARTOON_CANVAS = { width: 1536, height: 1024 } as const;

export type CartoonRibbon = (typeof GENRE_RIBBONS.cartoon)[number];
export const CARTOON_RIBBONS = GENRE_RIBBONS.cartoon;

export type CartoonSpec = {
  /** The generated front. Its lettering is in the picture. */
  scene: string;
  /** Story label, e.g. "SOMEONE PARKED ON THE MOON BUGGY". null leaves the picture alone. */
  story: string | null;
  /** Location ribbon over the label. null hides it. */
  location: string | null;
  ribbon: CartoonRibbon;
  /** Which bottom corner the story sits in: the one the hero isn't standing in. */
  side: "left" | "right";
  /** Workbench node the front was read from. */
  figma?: string;
  /** An Architect's Notebook stick figure in the front's ink. null or absent: none. */
  figure?: FigureSpec | null;
};

/** The stick figure at one drawing, stroked in currentColor (the front's ink). */
export function SketchFigure({ spec, drawing }: { spec: FigureSpec; drawing: number }) {
  const pose = figurePose(spec, drawing, CARTOON_CANVAS);
  return (
    <svg
      className="jk-toon__figure"
      data-figma={NOTEBOOK_NODES.Figures}
      data-cycle={spec.cycle}
      viewBox={`0 0 ${pose.width / pose.scale} ${pose.height / pose.scale}`}
      width={pose.width}
      height={pose.height}
      style={{ transform: `translate(${pose.x}px, ${pose.y}px)` }}
      aria-hidden="true"
    >
      <g className="jk-toon__figure-halo" strokeWidth={FIGURE_PEN + FIGURE_HALO}>
        {pose.paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g strokeWidth={FIGURE_PEN}>
        {pose.paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

export const CartoonPostcard = forwardRef<HTMLDivElement, { spec: CartoonSpec; drawing?: number }>(function CartoonPostcard(
  { spec, drawing = 0 },
  ref,
) {
  const story = spec.story?.trim() || null;
  const location = spec.location?.trim() || null;
  return (
    <div ref={ref} className="jk-toon" data-ribbon={spec.ribbon} data-side={spec.side} data-figma={spec.figma}>
      <img className="jk-toon__art" src={spec.scene} alt="" draggable={false} />
      {spec.figure ? <SketchFigure spec={spec.figure} drawing={drawing} /> : null}
      {story || location ? (
        <div className="jk-toon__story">
          {location ? <p className="jk-toon__ribbon">{location}</p> : null}
          {story ? <p className="jk-toon__label">{story}</p> : null}
        </div>
      ) : null}
    </div>
  );
});
