import { forwardRef } from "react";
import { GENRE_RIBBONS } from "../tokens.gen";

/**
 * The cartoon side of the postcard, for silly days: a generated large-letter front
 * (Postcard Image Algo 147:933) with the illustrated genre's comic story on top, set
 * in the front's own inks. The story label and location ribbon are live; the
 * picture is one raster. Drawn on a 1536×1024 canvas and scaled, never reflowed.
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
};

export const CartoonPostcard = forwardRef<HTMLDivElement, { spec: CartoonSpec }>(function CartoonPostcard({ spec }, ref) {
  const story = spec.story?.trim() || null;
  const location = spec.location?.trim() || null;
  return (
    <div ref={ref} className="jk-toon" data-ribbon={spec.ribbon} data-side={spec.side} data-figma={spec.figma}>
      <img className="jk-toon__art" src={spec.scene} alt="" draggable={false} />
      {story || location ? (
        <div className="jk-toon__story">
          {location ? <p className="jk-toon__ribbon">{location}</p> : null}
          {story ? <p className="jk-toon__label">{story}</p> : null}
        </div>
      ) : null}
    </div>
  );
});
