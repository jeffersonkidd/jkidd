import { useId, type ComponentType } from "react";
import { Bell, Braces, Component, Contrast, Feather, Flag, LayoutGrid, Package, Signpost, Skull, SquareTerminal, Sun, Type } from "lucide-react";
import { POST_TYPES } from "@jkidd/tokens";
import { FIGMA_NODES } from "@jkidd/core";

/* The dressing shapes (Primitives › Dressing): what a postcard back is dressed with, drawn on
   the card's own roles, so no colour is set here that the scheme or the post type doesn't
   supply. Which ones a card gets, and where, is @jkidd/blocks cards/back/ (catalog, pick, place).
   Placed shapes take canvas coordinates. */

type Icon = ComponentType<{ x?: number; y?: number; width?: number; height?: number; strokeWidth?: number }>;

/** Each post type's stamp icon (Icons page: Flag, Signpost, Skull, Sun, Bell). */
export const STAMP_ICONS = { flag: Flag, signpost: Signpost, skull: Skull, sun: Sun, bell: Bell } satisfies Record<string, Icon>;
export type StampIcon = keyof typeof STAMP_ICONS;

/** The postmark's topic glyphs (Icons page: Braces to Package, Feather, Layout Grid). */
export const TOPIC_GLYPHS = {
  tokens: Braces,
  type: Type,
  color: Contrast,
  figma: Component,
  code: SquareTerminal,
  weight: Feather,
  layout: LayoutGrid,
  ship: Package,
} satisfies Record<string, Icon>;
export type TopicGlyph = keyof typeof TOPIC_GLYPHS;

export type Rect = { x: number; y: number; w: number; h: number };

const useUid = () => useId().replace(/[^a-zA-Z0-9]/g, "");

/** Ink that has met paper: speckle knock-outs so a stamp reads as stamped, not drawn. */
function Wear({ id, w, h, amount = 1 }: { id: string; w: number; h: number; amount?: number }) {
  return (
    <>
      <filter id={`${id}-speck`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed={7} />
        <feColorMatrix values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${4 * amount} ${-2.1 * amount}`} />
      </filter>
      <mask id={`${id}-wear`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
        <rect width={w} height={h} fill="white" />
        <rect width={w} height={h} filter={`url(#${id}-speck)`} />
      </mask>
    </>
  );
}

const wave = (x0: number, x1: number, y: number, phase: number) => {
  let d = "";
  for (let x = x0; x <= x1; x += 4) d += `${x === x0 ? "M" : "L"}${x},${(y + Math.sin((x - x0) / 9 + phase) * 6).toFixed(1)} `;
  return d;
};

export type CachetProps = {
  /** The post type's stamp icon. */
  icon: StampIcon;
  /** The topic glyph in the postmark; without one, a dot. */
  glyph?: TopicGlyph | null;
  /** The post type label on the stamp. */
  label: string;
  /** Over the ring: the series, or the handle. */
  ringTop: string;
  /** Under the ring: the day or the date; without one, a rule. */
  ringBottom?: string | null;
  stampTilt?: number;
  markTilt?: number;
  wavePhase?: number;
};

/** Stamp and postmark: the post type's stamp, cancelled. 400×220. */
export function Cachet({ icon, glyph, label, ringTop, ringBottom, stampTilt = 0, markTilt = 0, wavePhase = 0 }: CachetProps) {
  const id = useUid();
  const Mark = STAMP_ICONS[icon] ?? Flag;
  const Glyph = glyph ? TOPIC_GLYPHS[glyph] : null;
  const [sx, sy, sw, sh] = [252, 26, 128, 164];
  const [cx, cy] = [94, 110];
  const perf: { x: number; y: number }[] = [];
  for (let x = sx; x <= sx + sw; x += 12.8) perf.push({ x, y: sy }, { x, y: sy + sh });
  for (let y = sy + 12.6; y < sy + sh; y += 12.6) perf.push({ x: sx, y }, { x: sx + sw, y });
  return (
    <svg className="jk-back__cachet" data-figma={FIGMA_NODES.Cachet[1]} width="400" height="220" viewBox="0 0 400 220" aria-hidden>
      <defs>
        <mask id={`${id}-perf`} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="220">
          <rect x={sx} y={sy} width={sw} height={sh} fill="white" />
          {perf.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="5" fill="black" />
          ))}
        </mask>
        <path id={`${id}-top`} d={`M${cx - 58},${cy} a58,58 0 0 1 116,0`} />
        <path id={`${id}-bot`} d={`M${cx - 70},${cy} a70,70 0 0 0 140,0`} />
        <Wear id={id} w={400} h={220} />
      </defs>

      <g transform={`rotate(${stampTilt} ${sx + sw / 2} ${sy + sh / 2})`}>
        <g className="jk-back__stamp-paper" mask={`url(#${id}-perf)`}>
          <rect x={sx} y={sy} width={sw} height={sh} />
        </g>
        <g className="jk-back__stamp-face">
          <rect x={sx + 10} y={sy + 10} width={sw - 20} height={sh - 20} />
        </g>
        <g className="jk-back__stamp-ink">
          <rect x={sx + 16} y={sy + 16} width={sw - 32} height={sh - 32} fill="none" strokeWidth="1.5" />
          <text x={sx + 24} y={sy + 40} className="jk-back__stamp-value">
            2¢
          </text>
          <Mark x={sx + sw / 2 - 26} y={sy + 50} width={52} height={52} strokeWidth={1.75} />
          <text x={sx + sw / 2} y={sy + sh - 28} textAnchor="middle" className="jk-back__stamp-label">
            {label}
          </text>
        </g>
      </g>

      <g className="jk-back__ink" mask={`url(#${id}-wear)`}>
        <g transform={`rotate(${markTilt} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r="78" fill="none" strokeWidth="3" />
          <circle cx={cx} cy={cy} r="52" fill="none" strokeWidth="1.5" />
          <text className="jk-back__ring-text">
            <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">
              {ringTop}
            </textPath>
          </text>
          {ringBottom ? (
            <text className="jk-back__ring-text">
              <textPath href={`#${id}-bot`} startOffset="50%" textAnchor="middle">
                {ringBottom}
              </textPath>
            </text>
          ) : (
            <path d={`M${cx - 30},${cy + 64} h60`} strokeWidth="2" />
          )}
          {Glyph ? <Glyph x={cx - 20} y={cy - 20} width={40} height={40} strokeWidth={1.75} /> : <circle cx={cx} cy={cy} r="4" />}
        </g>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={wave(cx + 86, 398, 74 + i * 18, wavePhase + i * 0.35)} fill="none" strokeWidth="3" strokeLinecap="round" />
        ))}
      </g>
    </svg>
  );
}

/** One verdict word, boxed and inked. The code sizes it 64 + 34px a letter by 92. */
export function RubberStamp({ word, tilt = 0, size }: { word: string; tilt?: number; size: { w: number; h: number } }) {
  const id = useUid();
  const { w, h } = size;
  return (
    <svg className="jk-back__rubber" data-figma={FIGMA_NODES.RubberStamp[1]} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <defs>
        <Wear id={id} w={w} h={h} amount={1.15} />
      </defs>
      <g mask={`url(#${id}-wear)`} transform={`rotate(${tilt} ${w / 2} ${h / 2})`}>
        <rect x="6" y="8" width={w - 12} height={h - 16} rx="10" fill="none" strokeWidth="5" />
        <rect x="15" y="17" width={w - 30} height={h - 34} rx="5" fill="none" strokeWidth="2" />
        <text x={w / 2} y={h / 2 + 16} textAnchor="middle" className="jk-back__rubber-word">
          {word}
        </text>
      </g>
    </svg>
  );
}

/** The divided back's centre rule, with the card's source printed up it. */
export function Imprint({ idea, event, size }: { idea: string; event: string; size: { w: number; h: number } }) {
  const { w, h } = size;
  return (
    <svg className="jk-back__imprint" data-figma={FIGMA_NODES.Imprint[1]} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path d={`M${w - 8},0 V${h}`} strokeWidth="2" />
      <text transform={`translate(${w / 2 - 6} ${h / 2}) rotate(-90)`} textAnchor="middle" className="jk-back__imprint-text">
        IDEA {idea} · JOURNAL {event}
      </text>
    </svg>
  );
}

// ── Fixed shapes: edges and corners, outside the content by construction ────

export function Airmail() {
  return (
    <>
      <i className="jk-back__airmail" data-edge="top" data-figma={FIGMA_NODES.Airmail[1]} />
      <i className="jk-back__airmail" data-edge="bottom" data-figma={FIGMA_NODES.Airmail[1]} />
    </>
  );
}

function Target({ x, y }: { x: number; y: number }) {
  return (
    <svg className="jk-back__target" data-figma={FIGMA_NODES.Registration[1]} style={{ left: x - 16, top: y - 16 }} width="32" height="32" viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="8" fill="none" strokeWidth="1.5" />
      <path d="M16 0V32M0 16H32" strokeWidth="1.5" />
    </svg>
  );
}

export function Registration({ canvas, rail }: { canvas: { width: number; height: number }; rail: number }) {
  const i = 24;
  return (
    <>
      <Target x={rail + i} y={i} />
      <Target x={canvas.width - i} y={i} />
      <Target x={rail + i} y={canvas.height - i} />
      <Target x={canvas.width - i} y={canvas.height - i} />
    </>
  );
}

export function ColorBar() {
  return (
    <span className="jk-back__colorbar" data-figma={FIGMA_NODES.ColorBar[1]} aria-hidden>
      {POST_TYPES.map((t) => (
        <i key={t} data-post-type={t} />
      ))}
    </span>
  );
}

export function PhotoCorners({ zones }: { zones: Rect[] }) {
  const s = 34;
  return (
    <>
      {zones.flatMap((z, zi) =>
        (
          [
            [z.x, z.y, `M0,0 H${s} L0,${s} Z`],
            [z.x + z.w - s, z.y, `M${s},0 V${s} L0,0 Z`],
            [z.x, z.y + z.h - s, `M0,${s} V0 L${s},${s} Z`],
            [z.x + z.w - s, z.y + z.h - s, `M${s},${s} H0 L${s},0 Z`],
          ] as const
        ).map(([x, y, d], i) => (
          <svg key={`${zi}-${i}`} className="jk-back__corner" data-figma={FIGMA_NODES.PhotoCorners[1]} style={{ left: x - 6, top: y - 6 }} width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
            <path d={d} />
          </svg>
        )),
      )}
    </>
  );
}
