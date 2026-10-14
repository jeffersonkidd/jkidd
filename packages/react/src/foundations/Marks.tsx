import { useId, type CSSProperties } from "react";
import { EMBLEM, EMBLEM_LABEL, FIGMA_NODES } from "@jkidd/core";

export type MonogramTone = "brand" | "ink" | "outline";
export type MonogramSize = "L" | "M" | "S";

/**
 * JK monogram. PLACEHOLDER: typeset in the display face until the real marks are
 * designed (JKIDD.md §6 step 3). Brand on light or dark; Ink for the Principle card
 * and print; Outline over photos.
 */
export function Monogram({ tone = "brand", size = "L" }: { tone?: MonogramTone; size?: MonogramSize }) {
  return (
    <span className="jk-monogram" data-tone={tone} data-size={size} data-figma={FIGMA_NODES.Monogram[1]} role="img" aria-label="JK">
      JK
    </span>
  );
}

/** Typeset wordmark. PLACEHOLDER. The surname carries the brand colour. */
export function Wordmark({ layout = "inline" }: { layout?: "inline" | "stacked" }) {
  return (
    <p className="jk-wordmark" data-layout={layout} data-figma={FIGMA_NODES.Wordmark[1]}>
      <span className="jk-wordmark__given">Jefferson</span>
      <span className="jk-wordmark__surname">KIDD</span>
    </p>
  );
}

/** The swappable project slot: TIBBIE X, HF LAB, SDS LAB, MONOFLY. */
export function ProjectMark({ children }: { children: string }) {
  return (
    <span className="jk-project-mark jk-text-card-chrome" data-figma={FIGMA_NODES.ProjectMark[1]}>
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
    <span className="jk-lockup" data-figma={FIGMA_NODES.HandleLockup[1]}>
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

export type EmblemVariant = "badge" | "figure";
export type EmblemTone = "original" | "mono";

/**
 * The winged seahorse: J.F. Kidd's logo, favicon and avatar, drawn from the master's
 * own geometry (EMBLEM in @jkidd/core). Badge is the whole emblem in its ring; Figure
 * is the seahorse alone, boxed tight. Original keeps the master's black, grey and
 * white (from the neutral palette), and holds on light or dark because the badge
 * brings its own field; Mono draws in currentColor, for one-colour print and stamps.
 * The figure has no field to stand on, so it defaults to Mono; Original is for light
 * grounds and photos, where its white halo works as a sticker edge.
 * Size is the width in px (the badge is square); without one it fills its box.
 * Pass label={null} where a name is already given next to it.
 */
export function Emblem({
  variant = "badge",
  tone = variant === "badge" ? "original" : "mono",
  size,
  label = EMBLEM_LABEL,
  className = "",
}: {
  variant?: EmblemVariant;
  tone?: EmblemTone;
  size?: number;
  label?: string | null;
  className?: string;
}) {
  const knockout = useId();
  const badge = variant === "badge";
  const style = size === undefined ? undefined : ({ "--jk-emblem-size": `${size}px` } as CSSProperties);
  return (
    <svg
      className={`jk-emblem ${className}`}
      data-variant={variant}
      data-tone={tone}
      data-figma={FIGMA_NODES.Emblem[1]}
      viewBox={badge ? EMBLEM.viewBox : EMBLEM.figureViewBox}
      style={style}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <mask id={knockout} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
        <rect width="400" height="400" fill="white" />
        <path d={EMBLEM.halo.d} fill="black" stroke="black" strokeWidth={EMBLEM.halo.stroke} strokeLinejoin="round" />
      </mask>
      {badge ? <circle className="jk-emblem__field" cx={EMBLEM.field.cx} cy={EMBLEM.field.cy} r={EMBLEM.field.r} /> : null}
      <g mask={`url(#${knockout})`}>
        {badge ? <path className="jk-emblem__band" d={EMBLEM.band.d} strokeWidth={EMBLEM.band.stroke} /> : null}
        <g className="jk-emblem__ink">
          {EMBLEM.body.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
      <path className="jk-emblem__halo" d={EMBLEM.halo.d} strokeWidth={EMBLEM.halo.stroke} />
      <path className="jk-emblem__ink" d={EMBLEM.wing} />
    </svg>
  );
}
