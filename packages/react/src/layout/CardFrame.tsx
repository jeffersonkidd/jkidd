import { forwardRef, type ReactNode } from "react";
import { HandleLockup } from "../foundations/Marks";
import { FIGMA_NODES } from "@jkidd/core";
import { CANVAS, type PostType, type Ratio, type Scheme } from "@jkidd/tokens";

export type FrameProps = {
  ratio?: Ratio;
  postType: PostType;
  scheme?: Scheme;
  /** Series posts only, e.g. "DAY 04". null or omitted for regular posts. */
  day?: string | null;
  /** "21 DAYS OF DEV" for the series; null or omitted otherwise. */
  series?: string | null;
  /** The project in the lockup's slot. null hides the slot. */
  project?: string | null;
  handle?: string;
};

/**
 * The constant frame (POSTCARDS.md §1). Only the content zone changes between
 * cards. Rendered at the Figma canvas size; scale it with <ScaledCard>, never reflow it.
 */
export const CardFrame = forwardRef<HTMLDivElement, FrameProps & { children?: ReactNode }>(function CardFrame(
  { ratio = "16:9", postType, scheme = "dark", day, series, project = null, handle, children },
  ref,
) {
  const { width, height } = CANVAS[ratio];
  return (
    <div
      ref={ref}
      className="jk-card"
      data-scheme={scheme}
      data-post-type={postType}
      data-ratio={ratio}
      data-figma={FIGMA_NODES.CardFrame}
      style={{ width, height }}
    >
      <div className="jk-card__rail" />
      <div className="jk-card__body">
        <div className="jk-card__chrome">
          {day ? <span className="jk-card__chrome-text jk-text-card-chrome">{day}</span> : null}
          <span className="jk-card__spacer" />
          <HandleLockup project={project} handle={handle} />
        </div>
        <div className="jk-card__zone">
          <div className="jk-card__content">
            {children ?? (
              <div className="jk-empty jk-text-card-chrome" data-figma={FIGMA_NODES.ContentEmpty}>
                CONTENT ZONE · swap in an archetype
              </div>
            )}
          </div>
        </div>
        <div className="jk-card__chrome">
          {series ? <span className="jk-card__chrome-text jk-text-card-chrome">{series}</span> : null}
          <span className="jk-card__spacer" />
          <span className="jk-card__tick" />
        </div>
      </div>
    </div>
  );
});
