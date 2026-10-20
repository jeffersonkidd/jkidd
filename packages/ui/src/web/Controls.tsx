import type { CSSProperties, ReactNode } from "react";
import { LINK_NODES } from "@jkidd/core";
import commandSvg from "./assets/command.svg";
import chevronSvg from "./assets/chevron-right.svg";

/**
 * The web controls (JKidd - Primitives, Controls page; Icon/* on Icons). Drawn at web
 * size, so sizes match Figma 1:1, and they reflow: unlike the cards, nothing here is
 * scaled.
 */

/** Figma icon assets, drawn as masks so they take the role colour in every scheme. */
function MaskIcon({ src, size }: { src: string; size: number }) {
  const style = { "--web-icon-src": `url("${src}")`, width: size, height: size } as CSSProperties;
  return <span className="web-mask-icon" style={style} aria-hidden />;
}

export function CommandIcon({ size = 16 }: { size?: number }) {
  return <MaskIcon src={commandSvg} size={size} />;
}

export function ChevronRightIcon({ size = 20 }: { size?: number }) {
  return <MaskIcon src={chevronSvg} size={size} />;
}

/** An <a> when there's somewhere to go; otherwise the same box, inert. */
export function Linkish({ href, className, children, label }: { href?: string; className: string; children: ReactNode; label?: string }) {
  return href ? (
    <a className={className} href={href} aria-label={label}>
      {children}
    </a>
  ) : (
    <span className={className} aria-label={label} role={label ? "img" : undefined}>
      {children}
    </span>
  );
}

export function Tag({ children }: { children: string }) {
  return (
    <span className="web-tag" data-figma={LINK_NODES.Tag[1]}>
      {children}
    </span>
  );
}

/** Icon Kicker: Card/Kicker at half size, with an icon in place of the bullet. */
export function IconKicker({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="web-kicker" data-figma={LINK_NODES.IconKicker[1]}>
      <span className="web-kicker__icon">{icon}</span>
      <span className="web-kicker__label">{label}</span>
    </span>
  );
}

export type PillVariant = "ghost" | "outlined";

export function PillButton({ href, variant = "ghost", children }: { href?: string; variant?: PillVariant; children: string }) {
  return (
    <Linkish href={href} className={`web-pill web-pill--${variant}`}>
      {children}
    </Linkish>
  );
}

export function IconButton({ href, label, children }: { href?: string; label: string; children: ReactNode }) {
  return (
    <Linkish href={href} className="web-icon-button" label={label}>
      {children}
    </Linkish>
  );
}

export function Tab({ pressed, onClick, icon, children }: { pressed: boolean; onClick: () => void; icon?: ReactNode; children: string }) {
  return (
    <button type="button" className="web-tab" aria-pressed={pressed} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}

export function Avatar({ src }: { src?: string }) {
  return <span className="web-avatar">{src ? <img src={src} alt="" /> : null}</span>;
}
