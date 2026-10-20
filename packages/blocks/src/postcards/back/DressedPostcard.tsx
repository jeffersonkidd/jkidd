import { forwardRef, useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { CANVAS } from "@jkidd/tokens";
import { Postcard, type CardSpec } from "../Postcard";
import grain from "@jkidd/ui/imagery/press/grain.png";
import specks from "@jkidd/ui/imagery/press/specks.png";
import stock16x9 from "@jkidd/ui/imagery/stock/paper-16x9.jpg";
import stock1x1 from "@jkidd/ui/imagery/stock/paper-1x1.jpg";
import stock4x5 from "@jkidd/ui/imagery/stock/paper-4x5.jpg";
import sky16x9 from "@jkidd/ui/imagery/stock/palm-sky-16x9.jpg";
import sky1x1 from "@jkidd/ui/imagery/stock/palm-sky-1x1.jpg";
import sky4x5 from "@jkidd/ui/imagery/stock/palm-sky-4x5.jpg";
import { CATALOG } from "./catalog";
import { readCard, type CardSource, type Reading } from "./read";
import { pickDressing, rng, type DressOptions, type Dressing } from "./pick";
import { place, type Placement, type Rect } from "./place";
import { Airmail, Cachet, ColorBar, Imprint, PhotoCorners, Registration, RubberStamp, type StampIcon, type TopicGlyph } from "@jkidd/ui/postcards";

/**
 * Dressing the back: an archetype card's JSON, read for meaning, dressed from the stock catalog,
 * placed in the room the content leaves. The workflow, node by node:
 *
 *   intake (CardSpec) → lint (apps/studio lint.ts) → read (read.ts) → pick (pick.ts)
 *   → place (place.ts, measured here) → check (dropped shapes, contrast) → export
 *
 * The frame and the content render as the plain Postcard does, printed on the card stock (cut
 * to the card's ratio) in the light scheme; the dressing only lies under it
 * (texture), faintly over it (overlays), and beside it (shapes).
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

/** The card stocks cut to each canvas (@jkidd/ui scripts/stock.mjs): the paper so the burnt edge is even all round, the palm sky so the palm stays. */
const STOCK = { "16:9": stock16x9, "1:1": stock1x1, "4:5": stock4x5 } as const;
const PALM_SKY: Record<keyof typeof STOCK, string> = { "16:9": sky16x9, "1:1": sky1x1, "4:5": sky4x5 };

/** The variables the back reads: the card stock and the palm sky for its ratio, the press images and this seed's foxing. */
export const backVars = (seed: number, ratio: keyof typeof STOCK = "16:9") =>
  ({
    "--back-stock": `url("${STOCK[ratio]}")`,
    "--back-palm-sky": `url("${PALM_SKY[ratio]}")`,
    "--back-grain": `url("${grain}")`,
    "--back-specks": `url("${specks}")`,
    "--back-foxing": foxing(seed),
  }) as CSSProperties;

export const DressedPostcard = forwardRef<
  HTMLDivElement,
  { spec: CardSpec; dressing: Dressing; onPlace?: (placed: Placed) => void }
>(function DressedPostcard({ spec, dressing, onPlace }, forwarded) {
  const card: CardSpec = { ...spec, scheme: dressing.scheme };
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
    ...backVars(dressing.seed, card.ratio ?? "16:9"),
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
      data-stock={dressing.stock}
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
              return pos ? (
                <div key={s.id} style={pos}>
                  <Cachet
                    icon={s.params.icon as StampIcon}
                    glyph={(s.params.glyph as TopicGlyph) || null}
                    label={String(s.params.label)}
                    ringTop={String(s.params.ringTop)}
                    ringBottom={String(s.params.ringBottom) || null}
                    stampTilt={Number(s.params.stampTilt)}
                    markTilt={Number(s.params.markTilt)}
                    wavePhase={Number(s.params.wavePhase)}
                  />
                </div>
              ) : null;
            case "rubber":
              return pos ? <div key={s.id} style={pos}><RubberStamp word={String(s.params.word)} tilt={Number(s.params.tilt)} size={s.size} /></div> : null;
            case "imprint":
              return pos ? <div key={s.id} style={pos}><Imprint idea={String(s.params.idea)} event={String(s.params.event)} size={s.size} /></div> : null;
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
