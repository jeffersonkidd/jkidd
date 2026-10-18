import { forwardRef, useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { CANVAS } from "@jkidd/tokens";
import { Postcard, type CardSpec } from "../Postcard";
import grain from "../assets/press/grain.png";
import specks from "../assets/press/specks.png";
import { CATALOG } from "./catalog";
import { readCard, type CardSource, type Reading } from "./read";
import { pickDressing, rng, type DressOptions, type Dressing } from "./pick";
import { place, type Placement, type Rect } from "./place";
import { Airmail, Cachet, ColorBar, Imprint, PhotoCorners, Registration, RubberStamp } from "./Shapes";

/**
 * Dressing the back: an archetype card's JSON, read for meaning, dressed from the stock catalog,
 * placed in the room the content leaves. The workflow, node by node:
 *
 *   intake (CardSpec) → lint (apps/site lint.ts) → read (read.ts) → pick (pick.ts)
 *   → place (place.ts, measured here) → check (dropped shapes, contrast) → export
 *
 * The frame and the content render exactly as the plain Postcard does; the dressing only lies
 * under it (texture), faintly over it (overlays), and beside it (shapes).
 */
export function dressBack(spec: CardSpec, options: DressOptions & { source?: CardSource | null } = {}): { reading: Reading; dressing: Dressing } {
  const reading = readCard(spec, options.source ?? null);
  return { reading, dressing: pickDressing(spec, reading, CATALOG, options) };
}

export type Placed = { shapes: Record<string, Placement>; zones: Rect[] };

const RAIL = 16;

/** Seeded age spots for the foxing overlay, in the scheme's tertiary. */
function foxing(seed: number) {
  const r = rng(seed ^ 0xf0c5);
  return Array.from({ length: 5 }, () => {
    const [x, y, size] = [r() * 100, r() * 100, 60 + r() * 160];
    return `radial-gradient(circle at ${x.toFixed(1)}% ${y.toFixed(1)}%, color-mix(in srgb, var(--md-sys-color-tertiary) 55%, transparent) 0, transparent ${size.toFixed(0)}px)`;
  }).join(", ");
}

/** The variables the textures and overlays read: the press images and this seed's foxing. */
export const backVars = (seed: number) =>
  ({
    "--back-grain": `url("${grain}")`,
    "--back-specks": `url("${specks}")`,
    "--back-foxing": foxing(seed),
  }) as CSSProperties;

export const DressedPostcard = forwardRef<
  HTMLDivElement,
  { spec: CardSpec; dressing: Dressing; onPlace?: (placed: Placed) => void }
>(function DressedPostcard({ spec, dressing, onPlace }, forwarded) {
  const card: CardSpec = dressing.scheme ? { ...spec, scheme: dressing.scheme } : spec;
  const canvas = CANVAS[card.ratio ?? "16:9"];
  const root = useRef<HTMLDivElement | null>(null);
  const [placed, setPlaced] = useState<Placed>({ shapes: {}, zones: [] });

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      root.current = el;
      if (typeof forwarded === "function") forwarded(el);
      else if (forwarded) forwarded.current = el;
    },
    [forwarded],
  );

  // Measure the rendered card and find room for the shapes. Again once the fonts land, since
  // the type sets the content's width.
  useLayoutEffect(() => {
    let live = true;
    const measure = () => {
      const el = root.current;
      if (!live || !el) return;
      const box = el.getBoundingClientRect();
      const k = box.width / canvas.width;
      if (!k) return;
      const rel = (e: Element): Rect => {
        const b = e.getBoundingClientRect();
        return { x: (b.left - box.left) / k, y: (b.top - box.top) / k, w: b.width / k, h: b.height / k };
      };
      // A zone is mostly air: its border and what's in it are obstacles, its empty middle isn't.
      // A shape can sit inside a zone or outside it, never across its edge.
      const content = el.querySelector(".jk-card__content")?.firstElementChild;
      const parts = content ? [...content.children] : [];
      const edges = (r: Rect): Rect[] => [
        { x: r.x, y: r.y, w: r.w, h: 2 },
        { x: r.x, y: r.y + r.h - 2, w: r.w, h: 2 },
        { x: r.x, y: r.y, w: 2, h: r.h },
        { x: r.x + r.w - 2, y: r.y, w: 2, h: r.h },
      ];
      const obstacles = [
        ...[...el.querySelectorAll(".jk-card__rail, .jk-card__chrome > :not(.jk-card__spacer)")].map(rel),
        ...parts.flatMap((p) => (p.classList.contains("jk-zone") ? [...edges(rel(p)), ...[...p.children].map(rel)] : [rel(p)])),
      ].filter((r) => r.w >= 1 && r.h >= 1);
      const boxes = dressing.shapes.filter((s) => s.prefer).map((s) => ({ id: s.id, w: s.size.w, h: s.size.h, prefer: s.prefer! }));
      const bounds = { x: RAIL + 20, y: 20, w: canvas.width - RAIL - 40, h: canvas.height - 40 };
      const next: Placed = {
        shapes: place(boxes, obstacles, canvas, bounds),
        zones: dressing.shapes.some((s) => s.id === "corners") ? [...el.querySelectorAll(".jk-card__content .jk-zone")].map(rel) : [],
      };
      setPlaced((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => {
      live = false;
    };
  }, [spec, dressing, canvas]);

  useLayoutEffect(() => onPlace?.(placed), [placed, onPlace]);

  const style = {
    width: canvas.width,
    height: canvas.height,
    ...backVars(dressing.seed),
    ...(dressing.dress && {
      "--dress-paper": `var(--jk-genre-picture-${dressing.dress}-cream)`,
      "--dress-ink": `var(--jk-genre-picture-${dressing.dress}-ink)`,
    }),
  } as CSSProperties;

  const at = (id: string) => placed.shapes[id];
  return (
    <div
      ref={setRef}
      className="jk-back"
      data-scheme={card.scheme ?? "dark"}
      data-post-type={card.postType}
      data-texture={dressing.texture.id}
      data-overlays={dressing.overlays.map((o) => o.id).join(" ") || undefined}
      data-dress={dressing.dress ?? undefined}
      style={style}
    >
      <Postcard spec={card} />
      <div className="jk-back__shapes">
        {dressing.shapes.map((s) => {
          const p = at(s.id);
          const pos = p ? ({ position: "absolute", left: p.x, top: p.y, transform: `scale(${p.scale})`, transformOrigin: "0 0" } as const) : null;
          switch (s.id) {
            case "cachet":
              return pos ? <div key={s.id} style={pos}><Cachet params={s.params} /></div> : null;
            case "rubber":
              return pos ? <div key={s.id} style={pos}><RubberStamp params={s.params} size={s.size} /></div> : null;
            case "imprint":
              return pos ? <div key={s.id} style={pos}><Imprint params={s.params} size={s.size} /></div> : null;
            case "airmail":
              return <Airmail key={s.id} />;
            case "registration":
              return <Registration key={s.id} canvas={canvas} rail={RAIL} />;
            case "colorbar":
              return <ColorBar key={s.id} />;
            case "corners":
              return <PhotoCorners key={s.id} zones={placed.zones} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
});
