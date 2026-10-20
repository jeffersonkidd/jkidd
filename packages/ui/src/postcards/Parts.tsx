import type { CSSProperties, ReactNode } from "react";
import arrowLine from "./assets/arrow-line.svg";
import { FIGMA_NODES } from "@jkidd/core";

/** Post type label. Empty by default, so it reads the card's type (type/label). */
export function Kicker({ children }: { children?: string }) {
  return (
    <span className="jk-kicker" data-figma={FIGMA_NODES.Kicker[1]}>
      <span className="jk-kicker__bullet" aria-hidden />
      <span className="jk-kicker__label jk-text-card-kicker">{children}</span>
    </span>
  );
}

export type ZoneTone = "default" | "error" | "primary";

/** A dashed zone with its Zone Label sitting on the top edge. */
export function Zone({
  label,
  tone = "default",
  className = "",
  children,
}: {
  label: string;
  tone?: ZoneTone;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`jk-zone ${className}`} data-tone={tone}>
      <span className="jk-zone-label jk-text-card-chrome" data-figma={FIGMA_NODES.ZoneLabel[1]}>
        {label}
      </span>
      {children}
    </div>
  );
}

/** A component or token chip. Pass swatch to override the type accent with the real token. */
export function TokenChip({ children, swatch, fill }: { children: string; swatch?: string; fill?: boolean }) {
  return (
    <span className="jk-chip" data-fill={fill || undefined} data-figma={FIGMA_NODES.TokenChip[1]}>
      <span className="jk-chip__swatch" style={swatch ? { background: swatch } : undefined} aria-hidden />
      <span className="jk-text-card-code">{children}</span>
    </span>
  );
}

/** One arrow per card. The annotation carries the rule. */
export function Arrow({ children }: { children: string }) {
  const style = { "--jk-arrow-src": `url("${arrowLine}")` } as CSSProperties;
  return (
    <span className="jk-arrow" data-figma={FIGMA_NODES.Arrow[1]}>
      <span className="jk-arrow__line" style={style} aria-hidden />
      <span className="jk-arrow__label">{children}</span>
    </span>
  );
}

/** The whole argument of a Parity card. */
export function EqualsBadge() {
  return (
    <span className="jk-badge" data-figma={FIGMA_NODES.EqualsBadge[1]} aria-label="equals">
      =
    </span>
  );
}

/** The hero of a Pipeline card: one real command. Use the command that actually ran. */
export function Terminal({ children }: { children: string }) {
  return (
    <span className="jk-terminal jk-text-card-code" data-figma={FIGMA_NODES.Terminal[1]}>
      <span className="jk-terminal__prompt">$</span>
      <span>{children}</span>
    </span>
  );
}

export type RowMark = "check" | "cross" | "dot";
const GLYPH: Record<RowMark, string> = { check: "✓", cross: "✕", dot: "●" };

/**
 * One line of a Ledger or Before / After card. Check for shipped, Cross (error) for
 * the mistake, Dot for a note. struck draws the subtraction ledger's strike line, as
 * long as the text.
 */
export function CheckRow({
  mark = "check",
  struck = false,
  text = "body",
  markTone = "type",
  children,
}: {
  mark?: RowMark;
  struck?: boolean;
  text?: "body" | "code";
  markTone?: "type" | "primary";
  children: string;
}) {
  return (
    <div
      className="jk-row"
      data-mark={mark}
      data-mark-tone={markTone}
      data-struck={struck || undefined}
      data-figma={FIGMA_NODES.CheckRow[1]}
    >
      <span className="jk-row__mark" aria-hidden>
        {GLYPH[mark]}
      </span>
      <span className={`jk-row__text ${text === "code" ? "jk-text-card-code" : "jk-text-card-body"}`}>
        {struck ? <s style={{ textDecoration: "none" }}>{children}</s> : children}
        {struck ? <span className="jk-row__strike" aria-hidden /> : null}
      </span>
    </div>
  );
}
