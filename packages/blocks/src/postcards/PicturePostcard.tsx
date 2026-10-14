import { forwardRef, type CSSProperties } from "react";
import { FIGMA_NODES, NOTEBOOK_NODES } from "@jkidd/core";
import { figurePose, type FigureSpec } from "@jkidd/core";
import { FigureStrokes } from "@jkidd/react";
import type { SeriesId } from "./fronts";
import grain from "../assets/press/grain.png";
import specks from "../assets/press/specks.png";

/**
 * The picture postcard, one of the postcard's two types (the other is the archetype
 * Postcard). A front generated under the production spec (Postcard Image Algo 147:933),
 * in the mat, ink border and story pieces carried over from the retired illustrated
 * set: a cream mat, an ink-bordered picture, an optional live title, a location ribbon
 * and a story label tilted 2°. The ribbon sits under the title when there is one, and
 * over the label otherwise, so it never lands on the front's own lettering. The picture is one raster; everything
 * on it is live. The mat and border are the same on every card; the ink, cream and
 * ribbons are the front's series' own (--jk-genre-picture-<series>-*). Drawn on a 1536×1024 canvas and scaled, never reflowed. An Architect's
 * Notebook stick figure can walk along the bottom of the picture, behind the type; the
 * caller drives it with a drawing number. Over everything, the press: the western master's
 * grain and ink dropout, for fronts that came back cleaner than the master was printed.
 */

export const PICTURE_CANVAS = { width: 1536, height: 1024 } as const;
/** The picture inside the mat and the ink border (34px mat + 10px border), in canvas px. The figure walks here. */
export const PICTURE_SCENE = { x: 44, y: 44, width: 1448, height: 936 } as const;

export type PictureSpec = {
  /** The generated front. Its lettering, if any, is in the picture. */
  scene: string;
  /** Live title over the picture, for art-only fronts. null leaves the sky to the picture. */
  title: string | null;
  /** Story label, e.g. "THE DOGE MISPLACED TUESDAY". null leaves the picture alone. */
  story: string | null;
  /** Location ribbon: under the title, or over the label when there's no title. null hides it. */
  location: string | null;
  /** The press the front was printed on: its inks dress the border, label and ribbon. */
  series: SeriesId;
  /** One of the series' ribbons (seriesRibbons). */
  ribbon: string;
  /** Which bottom corner the label sits in: the one the hero isn't standing in. */
  side: "left" | "right";
  /** An Architect's Notebook stick figure in the front's ink. null or absent: none. */
  figure?: FigureSpec | null;
  /** The press printed over the whole card, 0–1 (Front.press). 0 or absent: none. */
  press?: number;
};

/** The stick figure at one drawing, in the front's ink, placed on the picture (PICTURE_SCENE). */
export function SketchFigure({ spec, drawing }: { spec: FigureSpec; drawing: number }) {
  const pose = figurePose(spec, drawing, PICTURE_SCENE);
  return (
    <svg
      className="jk-pic__figure"
      data-figma={NOTEBOOK_NODES.Figures}
      data-cycle={spec.cycle}
      viewBox={`0 0 ${pose.width / pose.scale} ${pose.height / pose.scale}`}
      width={pose.width}
      height={pose.height}
      style={{ transform: `translate(${pose.x}px, ${pose.y}px)` }}
      aria-hidden="true"
    >
      <FigureStrokes pose={pose} />
    </svg>
  );
}

export const PicturePostcard = forwardRef<HTMLDivElement, { spec: PictureSpec; drawing?: number }>(function PicturePostcard(
  { spec, drawing = 0 },
  ref,
) {
  const title = spec.title?.trim() || null;
  const story = spec.story?.trim() || null;
  const location = spec.location?.trim() || null;
  const inks = `--jk-genre-picture-${spec.series}`;
  const style = {
    "--pic-ink": `var(${inks}-ink)`,
    "--pic-cream": `var(${inks}-cream)`,
    "--pic-ribbon": `var(${inks}-ribbon-${spec.ribbon})`,
    "--pic-on-ribbon": `var(${inks}-on-ribbon-${spec.ribbon})`,
  } as CSSProperties;
  const press = Math.min(1, Math.max(0, spec.press ?? 0));
  return (
    <div
      ref={ref}
      className="jk-pic"
      style={style}
      data-series={spec.series}
      data-ribbon={spec.ribbon}
      data-side={spec.side}
      data-figma={FIGMA_NODES.PicturePostcard[1]}
    >
      <div className="jk-pic__scene">
        <img className="jk-pic__art" src={spec.scene} alt="" draggable={false} />
        {spec.figure ? <SketchFigure spec={spec.figure} drawing={drawing} /> : null}
        {title ? (
          <div className="jk-pic__lockup">
            <p className="jk-pic__title">{title}</p>
            {location ? <p className="jk-pic__ribbon">{location}</p> : null}
          </div>
        ) : null}
        {story || (location && !title) ? (
          <div className="jk-pic__story">
            {location && !title ? <p className="jk-pic__ribbon">{location}</p> : null}
            {story ? <p className="jk-pic__label">{story}</p> : null}
          </div>
        ) : null}
      </div>
      {press > 0 ? (
        <div
          className="jk-pic__press"
          style={{ "--pic-press": press, "--pic-grain": `url("${grain}")`, "--pic-specks": `url("${specks}")` } as CSSProperties}
          aria-hidden="true"
        >
          <i className="jk-pic__grain" />
          <i className="jk-pic__dropout" />
        </div>
      ) : null}
    </div>
  );
});
