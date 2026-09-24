import { FIGMA_NODES } from "../figma";

export type MonogramTone = "brand" | "ink" | "outline";
export type MonogramSize = "L" | "M" | "S";

/**
 * JK monogram. PLACEHOLDER: typeset in the display face until the real marks are
 * designed (JKIDD.md §6 step 3). Brand on light or dark; Ink for the Principle card
 * and print; Outline over photos.
 */
export function Monogram({ tone = "brand", size = "L" }: { tone?: MonogramTone; size?: MonogramSize }) {
  return (
    <span className="jk-monogram" data-tone={tone} data-size={size} data-figma={FIGMA_NODES.Monogram} role="img" aria-label="JK">
      JK
    </span>
  );
}

/** Typeset wordmark. PLACEHOLDER. The surname carries the brand colour. */
export function Wordmark({ layout = "inline" }: { layout?: "inline" | "stacked" }) {
  return (
    <p className="jk-wordmark" data-layout={layout} data-figma={FIGMA_NODES.Wordmark}>
      <span className="jk-wordmark__given">Jefferson</span>
      <span className="jk-wordmark__surname">KIDD</span>
    </p>
  );
}

/** The swappable project slot: TIBBIE X, HF LAB, SDS LAB, MONOFLY. */
export function ProjectMark({ children }: { children: string }) {
  return (
    <span className="jk-project-mark jk-text-card-chrome" data-figma={FIGMA_NODES.ProjectMark}>
      {children}
    </span>
  );
}

/**
 * Top-right chrome of every card (decision 3a): the J.F. Kidd mark and handle stay
 * fixed; the project mark sits in a slot and can be hidden (pass project={null}).
 */
export function HandleLockup({ handle = "@JFKIDD", project }: { handle?: string; project?: string | null }) {
  return (
    <span className="jk-lockup" data-figma={FIGMA_NODES.HandleLockup}>
      <Monogram size="S" />
      <span className="jk-lockup__handle jk-text-card-chrome">{handle}</span>
      {project ? (
        <>
          <span className="jk-lockup__divider" aria-hidden />
          <ProjectMark>{project}</ProjectMark>
        </>
      ) : null}
    </span>
  );
}
