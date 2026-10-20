import type { CSSProperties, ReactNode } from "react";
import { LINK_NODES } from "@jkidd/core";

/**
 * The page shells (JKidd - Compositions, Web page): a backdrop to stand on and a paper
 * sheet that holds the content. Unlike the card frame, these reflow.
 */

/** Stage: the backdrop image, full bleed, with the sheet centred on it. */
export function Stage({ backdrop, children }: { backdrop?: string; children: ReactNode }) {
  const style = (backdrop ? { "--web-backdrop": `url("${backdrop}")` } : {}) as CSSProperties;
  return (
    <div className="web-stage" style={style} data-figma={LINK_NODES.Stage[1]}>
      {children}
    </div>
  );
}

/**
 * Sheet: the card stock's vertical cut stretched to an 800px column, as the Shell frame
 * does in Figma. Pinned to the light scheme because the paper is a light raster.
 */
export function Sheet({ paper, children }: { paper?: string; children: ReactNode }) {
  const style = (paper ? { "--web-paper": `url("${paper}")` } : {}) as CSSProperties;
  return (
    <div className="web-sheet" style={style} data-scheme="light" data-figma={LINK_NODES.Sheet[1]}>
      {children}
    </div>
  );
}
