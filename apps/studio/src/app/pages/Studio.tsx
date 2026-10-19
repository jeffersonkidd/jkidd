import { useEffect, useMemo, useRef, useState } from "react";
import { getFontEmbedCSS, toPng } from "html-to-image";
import {
  ARCHETYPES,
  CANVAS,
  DressedPostcard,
  POST_TYPES,
  SAMPLES,
  SCHEMES,
  SERIES,
  SERIES_IDS,
  TEMPLATES,
  dressBack,
  type Archetype,
  type CardSpec,
  type Ratio,
} from "../../ds";
import { PageHeader, Segmented, Select, TextField, cap } from "../components/Controls";
import { ScaledBox, ScaledCard } from "../components/ScaledCard";
import { lintCard } from "../lint";
import { decodeSpec, encodeSpec } from "../share";
import type { PageProps } from "../App";

const ARCHETYPE_KEYS = Object.keys(ARCHETYPES) as Archetype[];
const TEMPLATE_IDS = ["", ...TEMPLATES.map((t) => t.id)];
const BACKS = ["plain", "dressed"] as const;
const DRESSES = ["", ...SERIES_IDS] as const;

function slug(spec: CardSpec) {
  const day = spec.day ? `${spec.day.toLowerCase().replace(/\s+/g, "-")}-` : "";
  return `jkidd-${day}${spec.archetype}-${spec.postType}-${(spec.ratio ?? "16:9").replace(":", "x")}`;
}

// Fonts are embedded as data URLs in every export; build that CSS once per session.
let fontCSS: Promise<string> | null = null;

/** Build a card from data, lint it against the card rules, export it at canvas size. */
export function Studio({ query }: PageProps) {
  const initial = useMemo(() => decodeSpec(query.get("c") ?? "") ?? { ...SAMPLES.manifesto, scheme: "dark" as const }, [query]);
  const [spec, setSpec] = useState<CardSpec>(initial);
  const [json, setJson] = useState(() => JSON.stringify(initial.content, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSpec(initial);
    setJson(JSON.stringify(initial.content, null, 2));
  }, [initial]);

  const findings = lintCard(spec);
  const set = (patch: Partial<CardSpec>) => setSpec((s) => ({ ...s, ...patch }) as CardSpec);

  const switchArchetype = (a: Archetype) => {
    const sample = SAMPLES[a];
    setSpec((s) => ({ ...s, archetype: a, content: sample.content, postType: sample.postType }) as CardSpec);
    setJson(JSON.stringify(sample.content, null, 2));
  };

  const [templateId, setTemplateId] = useState("");
  const template = TEMPLATES.find((t) => t.id === templateId);
  const pickTemplate = (id: string) => {
    setTemplateId(id);
    const t = TEMPLATES.find((t) => t.id === id);
    if (!t) return;
    setSpec((s) => ({ scheme: s.scheme, ratio: s.ratio, day: null, series: null, project: null, ...t.spec }) as CardSpec);
    setJson(JSON.stringify(t.spec.content, null, 2));
  };

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

  const exportPng = async (pixelRatio: number) => {
    if (!cardRef.current) return;
    const { width, height } = CANVAS[spec.ratio ?? "16:9"];
    try {
      await document.fonts.ready;
      fontCSS ??= getFontEmbedCSS(cardRef.current);
      const t0 = performance.now();
      const url = await toPng(cardRef.current, { width, height, pixelRatio, fontEmbedCSS: await fontCSS });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug(spec)}${dressed ? "-dressed" : ""}${pixelRatio > 1 ? `@${pixelRatio}x` : ""}.png`;
      a.click();
      flash(`Exported ${width * pixelRatio}×${height * pixelRatio} PNG in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
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

  const ratio = spec.ratio ?? "16:9";

  // Dressing the back (#/backs): read this card's JSON and dress it from the stock catalog.
  const [back, setBack] = useState<(typeof BACKS)[number]>("plain");
  const [dress, setDress] = useState<(typeof DRESSES)[number]>("");
  const [take, setTake] = useState(0);
  const source = template ? { idea: template.idea, event: template.event } : null;
  const dressed = useMemo(
    () => (back === "dressed" ? dressBack(spec, { source, dress: dress || null, take }).dressing : null),
    [back, spec, dress, take, template],
  );
  const preview = (width?: number, ref?: typeof cardRef) =>
    dressed ? (
      <ScaledBox canvas={CANVAS[ratio]} width={width} label="Dressed back preview">
        <DressedPostcard ref={ref} spec={spec} dressing={dressed} />
      </ScaledBox>
    ) : (
      <ScaledCard ref={ref} spec={spec} width={width} label={`${ARCHETYPES[spec.archetype].name} postcard preview`} />
    );

  return (
    <div className="page page--wide">
      <PageHeader eyebrow="Creator OS" title="Studio">
        <p>
          A card is data: frame settings plus one archetype's content. Edit it, check it against the card rules, and export
          it at canvas size for Postiz. Write the real work in, not the sample. Content never invents.
        </p>
      </PageHeader>

      <div className="studio">
        <form className="studio__panel" onSubmit={(e) => e.preventDefault()}>
          <Select
            label="Template"
            value={templateId}
            options={TEMPLATE_IDS}
            onChange={pickTemplate}
            format={(id) => {
              const t = TEMPLATES.find((t) => t.id === id);
              return t ? `${t.name} · ${ARCHETYPES[t.spec.archetype].name}` : "None: the archetype's sample";
            }}
          />
          {template ? (
            <p className="muted">
              Idea {template.idea}, journal {template.event}. Pattern: {template.pattern}. Check the copy against the event before posting.
            </p>
          ) : null}
          <Select label="Archetype" value={spec.archetype} options={ARCHETYPE_KEYS} onChange={switchArchetype} format={(a) => ARCHETYPES[a].name} />
          <Segmented label="Post type" value={spec.postType} options={POST_TYPES} onChange={(postType) => set({ postType })} format={cap} />
          <Select label="Scheme" value={spec.scheme ?? "dark"} options={SCHEMES} onChange={(scheme) => set({ scheme })} />
          <Segmented label="Ratio" value={ratio} options={Object.keys(CANVAS) as Ratio[]} onChange={(r) => set({ ratio: r })} />
          <div className="row-2">
            <TextField label="Day" value={spec.day ?? ""} placeholder="regular post" onChange={(v) => set({ day: v.toUpperCase() || null })} />
            <TextField label="Series" value={spec.series ?? ""} placeholder="regular post" onChange={(v) => set({ series: v.toUpperCase() || null })} />
          </div>
          <TextField label="Project slot" value={spec.project ?? ""} placeholder="empty hides it" onChange={(v) => set({ project: v.toUpperCase() || null })} />
          <Segmented label="Back" value={back} options={BACKS} onChange={setBack} format={cap} />
          {back === "dressed" ? (
            <div className="row-2">
              <Select
                label="Printed in"
                value={dress}
                options={DRESSES}
                onChange={setDress}
                format={(d) => (d ? SERIES[d].name : "Card's scheme")}
              />
              <label className="field">
                <span className="label">Take {take + 1}</span>
                <button type="button" className="btn" onClick={() => setTake((t) => t + 1)}>
                  Another take
                </button>
              </label>
            </div>
          ) : null}
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
          {preview(undefined, cardRef)}

          <div className="studio__bar">
            <button className="btn btn--primary" onClick={() => exportPng(1)}>
              Export PNG · {CANVAS[ratio].width}×{CANVAS[ratio].height}
            </button>
            <button className="btn" onClick={() => exportPng(2)}>
              @2x
            </button>
            <button className="btn" onClick={() => copy(JSON.stringify(spec, null, 2), "card JSON")}>
              Copy JSON
            </button>
            <button className="btn btn--ghost" onClick={() => copy(`${location.origin}${location.pathname}#/studio?c=${encodeSpec(spec)}`, "share link")}>
              Copy link
            </button>
            <span className="studio__status" role="status">
              {status}
            </span>
          </div>

          <div className="studio__checks">
            <div className="studio__thumb">
              <span className="label">At 320px (Principle 4)</span>
              {preview(320)}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
