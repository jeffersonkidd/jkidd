import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { getFontEmbedCSS, toPng } from "html-to-image";
import {
  ARCHETYPES,
  CANVAS,
  DressedPostcard,
  POST_TYPES,
  Postcard,
  SCHEMES,
  SERIES,
  SERIES_IDS,
  STOCKS,
  TEMPLATES,
  dressBack,
  figmaUrl,
  type Archetype,
  type CardSpec,
  type Placed,
  type Ratio,
  type Stock,
  vectorSvg,
  withInlineSvgPaint,
} from "../../ds";
import { PageHeader, Segmented, Select, TextField, cap } from "../components/Controls";
import { ScaledBox } from "../components/ScaledCard";
import { lintCard } from "../lint";
import { decodeSpec, encodeSpec } from "../share";
import type { PageProps } from "../App";
import { Picker, findPick } from "./studio/Picker";
import { DressingReport, shapeName } from "./studio/DressingReport";
import { ThumbnailTest, TypeRow } from "./studio/ThumbnailTest";

const ARCHETYPE_KEYS = Object.keys(ARCHETYPES) as Archetype[];
const DRESSES = ["", ...SERIES_IDS] as const;

const FIRST = findPick("sample-manifesto", { scheme: "dark", ratio: "16:9", project: null, day: null, series: null })!.spec;

function slug(spec: CardSpec) {
  const day = spec.day ? `${spec.day.toLowerCase().replace(/\s+/g, "-")}-` : "";
  return `jkidd-${day}${spec.archetype}-${spec.postType}-${(spec.ratio ?? "16:9").replace(":", "x")}`;
}

/** The URL's card: `c` is the spec itself, `t` the tile it came from (a template brings its source). */
function fromQuery(query: URLSearchParams) {
  const key = query.get("t") ?? "";
  const spec = decodeSpec(query.get("c") ?? "") ?? findPick(key, FIRST)?.spec ?? FIRST;
  return {
    spec,
    pick: findPick(key, spec) ? key : query.get("c") ? "" : "sample-manifesto",
    dress: (DRESSES as readonly string[]).includes(query.get("dress") ?? "") ? (query.get("dress") ?? "") : "",
    take: Math.max(0, Number(query.get("take")) || 0),
    stock: ((STOCKS as readonly string[]).includes(query.get("stock") ?? "") ? query.get("stock") : "paper") as Stock,
  };
}

// Fonts are embedded as data URLs in every export; build that CSS once per session.
let fontCSS: Promise<string> | null = null;

/**
 * Pick a card, edit its data, lint it against the card rules, dress its back from the stock
 * catalog, and export it at canvas size. Content never invents.
 */
export function Studio({ query }: PageProps) {
  const initial = useMemo(() => fromQuery(query), [query]);
  const [spec, setSpec] = useState<CardSpec>(initial.spec);
  const [json, setJson] = useState(() => JSON.stringify(initial.spec.content, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [pick, setPick] = useState(initial.pick);
  const [dress, setDress] = useState(initial.dress);
  const [take, setTake] = useState(initial.take);
  const [stock, setStock] = useState<Stock>(initial.stock);
  const [status, setStatus] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSpec(initial.spec);
    setJson(JSON.stringify(initial.spec.content, null, 2));
    setPick(initial.pick);
    setDress(initial.dress);
    setTake(initial.take);
    setStock(initial.stock);
  }, [initial]);

  const findings = lintCard(spec);
  const set = (patch: Partial<CardSpec>) => setSpec((s) => ({ ...s, ...patch }) as CardSpec);
  const load = (next: CardSpec, key: string) => {
    setSpec(next);
    setJson(JSON.stringify(next.content, null, 2));
    setJsonError(null);
    setPick(key);
    setTake(0);
  };

  const choose = (key: string) => {
    const p = findPick(key, spec);
    if (p) load(p.spec, key);
  };
  const switchArchetype = (a: Archetype) => choose(`sample-${a}`);

  const template = TEMPLATES.find((t) => t.id === pick);
  const source = template ? { idea: template.idea, event: template.event } : null;
  const edited = template ? JSON.stringify(template.spec.content) !== JSON.stringify(spec.content) : false;
  const meta = ARCHETYPES[spec.archetype];

  const editJson = (text: string) => {
    setJson(text);
    try {
      const content = JSON.parse(text);
      setSpec((s) => ({ ...s, content }) as CardSpec);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 2400);
  };

  const ratio = spec.ratio ?? "16:9";
  const canvas = CANVAS[ratio];

  // Dressing the back (packages/blocks/src/postcards/back/WORKFLOW.md): read this card's JSON, dress it from the stock catalog.
  const dressed = useMemo(() => dressBack(spec, { source, stock, dress: dress || null, take }), [spec, stock, dress, take, pick]);
  const [placed, setPlaced] = useState<Placed>({ shapes: {}, zones: [] });
  const onPlace = useCallback((p: Placed) => setPlaced(p), []);
  const dropped = dressed.dressing.shapes.filter((s) => s.prefer && placed.shapes[s.id] === null);

  /** PNG at canvas size (or a multiple), or SVG: editable vectors for Figma or Illustrator (vectorSvg). */
  const exportCard = async (ref: RefObject<HTMLDivElement | null>, format: "png" | "svg", pixelRatio = 1) => {
    if (!ref.current) return;
    const { width, height } = canvas;
    try {
      await document.fonts.ready;
      fontCSS ??= getFontEmbedCSS(ref.current);
      const fontEmbedCSS = await fontCSS;
      const t0 = performance.now();
      const card = ref.current;
      const url =
        format === "svg"
          ? URL.createObjectURL(new Blob([await vectorSvg(card, { canvas, rasterize: (el) => toPng(el) })], { type: "image/svg+xml" }))
          : await withInlineSvgPaint(card, () => toPng(card, { width, height, pixelRatio, fontEmbedCSS }));
      const a = document.createElement("a");
      a.href = url;
      const back = ref === backRef ? `-dressed${stock === "paper" ? "" : `-${stock}`}${dressed.dressing.dress ? `-${dress}` : ""}${take ? `-take${take}` : ""}` : "";
      a.download = `${slug(spec)}${back}${pixelRatio > 1 ? `@${pixelRatio}x` : ""}.${format}`;
      a.click();
      if (format === "svg") setTimeout(() => URL.revokeObjectURL(url), 10_000);
      const size = format === "svg" ? `${width}×${height}` : `${width * pixelRatio}×${height * pixelRatio}`;
      flash(`Exported ${size} ${format.toUpperCase()} in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
    } catch (e) {
      flash(`Export failed: ${(e as Error).message}`);
    }
  };

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(`Copied ${what}`);
    } catch {
      flash("Clipboard blocked by the browser");
    }
  };

  const link = () => {
    const q = new URLSearchParams({ c: encodeSpec(spec) });
    if (pick) q.set("t", pick);
    if (stock !== "paper") q.set("stock", stock);
    if (dress) q.set("dress", dress);
    if (take) q.set("take", String(take));
    return `${location.origin}${location.pathname}#/studio?${q}`;
  };

  const plain = (width?: number, ref?: typeof cardRef) => (
    <ScaledBox canvas={canvas} width={width} label={`${meta.name} postcard preview`}>
      <Postcard ref={ref} spec={spec} />
    </ScaledBox>
  );
  const dressedBack = (width?: number, ref?: typeof backRef, place?: typeof onPlace) => (
    <ScaledBox canvas={canvas} width={width} label="Dressed back preview">
      <DressedPostcard ref={ref} spec={spec} dressing={dressed.dressing} onPlace={place} />
    </ScaledBox>
  );

  return (
    <div className="page page--wide">
      <PageHeader eyebrow="Creator OS" title="Studio">
        <p>
          A card is data: frame settings plus one archetype's content. Pick one, write the real work in, check it against
          the card rules, see its back dressed, and export it at canvas size for Postiz. The frame never moves;
          the dressing never writes a word the card didn't say. Content never invents.
        </p>
      </PageHeader>

      <Picker frame={spec} selected={pick} onPick={choose} />

      <div className="studio">
        <form className="studio__panel" onSubmit={(e) => e.preventDefault()}>
          <Select label="Archetype" value={spec.archetype} options={ARCHETYPE_KEYS} onChange={switchArchetype} format={(a) => ARCHETYPES[a].name} />
          <p className="muted studio__note">
            {meta.rule} Best for {meta.bestFor.map(cap).join(", ")}.{" "}
            <a href={figmaUrl(meta.figma)} target="_blank" rel="noreferrer">
              {meta.figma[1]} ↗
            </a>
          </p>
          {template ? (
            <p className="muted studio__note">
              Template “{template.name}”: idea {template.idea}, journal {template.event}. Pattern: {template.pattern}.{" "}
              {edited ? "Edited since: the back still cites this source, so check every figure against the event." : "Check the copy against the event before posting."}
            </p>
          ) : null}
          <Segmented label="Post type" value={spec.postType} options={POST_TYPES} onChange={(postType) => set({ postType })} format={cap} />
          <Select label="Scheme" value={spec.scheme ?? "dark"} options={SCHEMES} onChange={(scheme) => set({ scheme })} />
          <Segmented label="Ratio" value={ratio} options={Object.keys(CANVAS) as Ratio[]} onChange={(r) => set({ ratio: r })} />
          <div className="row-2">
            <TextField label="Day" value={spec.day ?? ""} placeholder="regular post" onChange={(v) => set({ day: v.toUpperCase() || null })} />
            <TextField label="Series" value={spec.series ?? ""} placeholder="regular post" onChange={(v) => set({ series: v.toUpperCase() || null })} />
          </div>
          <TextField label="Project slot" value={spec.project ?? ""} placeholder="empty hides it" onChange={(v) => set({ project: v.toUpperCase() || null })} />
          <Segmented label="Back printed on" value={stock} options={STOCKS} onChange={setStock} format={(s) => (s === "paper" ? "Paper" : "Palm sky")} />
          <div className="row-2">
            {stock === "paper" ? (
              <Select
                label="In inks"
                value={dress}
                options={DRESSES}
                onChange={setDress}
                format={(d) => (d ? `${SERIES[d as keyof typeof SERIES].name} inks` : "Card's own inks")}
              />
            ) : (
              <p className="muted studio__note">Printed in the dark scheme: a series' ink wouldn't read on the sky.</p>
            )}
            <label className="field">
              <span className="label">Take {take + 1}</span>
              <span className="studio__take">
                <button type="button" className="btn" onClick={() => setTake((t) => t + 1)}>
                  Another take
                </button>
                {take ? (
                  <button type="button" className="btn btn--ghost" onClick={() => setTake(0)}>
                    First
                  </button>
                ) : null}
              </span>
            </label>
          </div>
          <label className="field">
            <span className="label">Content · JSON</span>
            <textarea
              value={json}
              spellCheck={false}
              rows={14}
              aria-invalid={jsonError ? true : undefined}
              onChange={(e) => editJson(e.target.value)}
            />
            {jsonError ? <span className="field__error">{jsonError}</span> : null}
          </label>
        </form>

        <div className="studio__stage">
          <figure>
            <figcaption className="label">Default rendering</figcaption>
            {plain(undefined, cardRef)}
          </figure>
          <figure>
            <figcaption className="label">Dressed</figcaption>
            {dressedBack(undefined, backRef, onPlace)}
          </figure>

          <div className="studio__bar">
            <button className="btn btn--primary" onClick={() => exportCard(cardRef, "png")}>
              Export PNG · {canvas.width}×{canvas.height}
            </button>
            <button className="btn" onClick={() => exportCard(cardRef, "png", 2)}>
              @2x
            </button>
            <button className="btn" onClick={() => exportCard(cardRef, "svg")}>
              SVG
            </button>
            <button className="btn" onClick={() => exportCard(backRef, "png")}>
              Export dressed PNG
            </button>
            <button className="btn" onClick={() => exportCard(backRef, "svg")}>
              Dressed SVG
            </button>
            <button className="btn" onClick={() => copy(JSON.stringify(spec, null, 2), "card JSON")}>
              Copy JSON
            </button>
            <button
              className="btn"
              onClick={() => copy(JSON.stringify({ card: pick || null, source, spec, dressing: dressed.dressing, placed: placed.shapes }, null, 2), "the dressing receipt")}
            >
              Copy dressing receipt
            </button>
            <button className="btn btn--ghost" onClick={() => copy(link(), "share link")}>
              Copy link
            </button>
            <span className="studio__status" role="status">
              {status}
            </span>
          </div>

          <div className="studio__checks">
            <div className="studio__thumb">
              <span className="label">At 320px (Principle 4)</span>
              {plain(320)}
              {dressedBack(320)}
              <p className="muted">
                {dropped.length
                  ? `${dropped.map((s) => shapeName(s.id)).join(", ")} found no free space and ${dropped.length > 1 ? "were" : "was"} left off.`
                  : "Every shape found free space; nothing covers the content or the frame."}
              </p>
            </div>
            <div className="lint">
              <span className="label">
                Card rules · {findings.length ? `${findings.length} note${findings.length > 1 ? "s" : ""}` : "all clear"}
              </span>
              {findings.length ? (
                <ul>
                  {findings.map((f, i) => (
                    <li key={i} data-level={f.level}>
                      <strong>{f.level}</strong> {f.message} <em>{f.source}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Nothing to flag.</p>
              )}
              {findings.length ? <p className="muted">Dressing never fixes a card that fails them.</p> : null}
            </div>
          </div>

          <TypeRow spec={spec} onPick={(postType) => set({ postType })} />

          <DressingReport reading={dressed.reading} dressing={dressed.dressing} placed={placed} />
        </div>
      </div>

      <ThumbnailTest frame={spec} open={query.get("see") === "thumbnails"} />
    </div>
  );
}
