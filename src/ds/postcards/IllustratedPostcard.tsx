import { forwardRef } from "react";
import { GENRE_RIBBONS } from "../tokens.gen";

/**
 * The illustrated postcard genre from JKidd - Workbench (riverboat 63:55, mountain
 * railway 63:64, …): a cream mat, an ink-bordered printed scene, a title lockup with
 * the location ribbon, and a tilted story label. The scene is one raster; everything
 * on it is live. Drawn on a 1536×1024 canvas and scaled, never reflowed.
 */

export const ILLUSTRATED_CANVAS = { width: 1536, height: 1024 } as const;

export type Ribbon = (typeof GENRE_RIBBONS.illustrated)[number];
export const RIBBONS = GENRE_RIBBONS.illustrated;

export type IllustratedSpec = {
  /** The illustration. Text-free: the ribbon, title and label are drawn on top. */
  scene: string;
  ribbon: Ribbon;
  /** Location ribbon, e.g. "COLORADO • HIGH COUNTRY". */
  location: string;
  /** Story label, e.g. "THE 4:10 NEVER REACHED SILVER PASS". */
  story: string;
  /** Big title over the scene. null leaves the sky to the picture (the riverboat card). */
  title: string | null;
  /** Workbench node the card was read from. */
  figma?: string;
};

export const IllustratedPostcard = forwardRef<HTMLDivElement, { spec: IllustratedSpec }>(function IllustratedPostcard(
  { spec },
  ref,
) {
  return (
    <div ref={ref} className="jk-ill" data-ribbon={spec.ribbon} data-figma={spec.figma}>
      <div className="jk-ill__scene">
        <img className="jk-ill__art" src={spec.scene} alt="" draggable={false} />
        <div className="jk-ill__lockup">
          {spec.title ? <p className="jk-ill__title">{spec.title}</p> : null}
          <p className="jk-ill__ribbon">{spec.location}</p>
        </div>
        <p className="jk-ill__label">{spec.story}</p>
      </div>
    </div>
  );
});
