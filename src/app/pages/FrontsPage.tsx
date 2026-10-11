import { useEffect, useMemo, useRef, useState } from "react";
import { getFontEmbedCSS, toPng } from "html-to-image";
import {
  BRIEF_FIELDS,
  CARTOON_CANVAS,
  CARTOON_RIBBONS,
  CartoonPostcard,
  DEFAULT_MASTER,
  FRONTS,
  FRONT_QC,
  FRONT_SPEC,
  ILLUSTRATED_SAMPLES,
  WORKBENCH_FILE_KEY,
  WORKBENCH_NODES,
  figmaUrl,
  frontPrompt,
  type CartoonRibbon,
  type CartoonSpec,
  type FrontBrief,
} from "../../ds";
import { PageHeader, Segmented, Select, TextField, Toggle, cap } from "../components/Controls";
import { ScaledBox } from "../components/ScaledCard";
import type { PageProps } from "../App";

const byId = (id: string) => FRONTS.find((f) => f.id === id) ?? FRONTS[0];
const SIDES = ["left", "right"] as const;
/** The illustrated set's stories, as starters: the library's own copy. */
const STARTERS = ILLUSTRATED_SAMPLES.map(({ story, location }) => ({ story, location }));

let fontCSS: Promise<string> | undefined;

/**
 * The cartoon side of the postcard, for silly days. Generate a large-letter front from a
 * series master and the production spec, bring it back, put the story on it, export.
 */
export function FrontsPage(_: PageProps) {
  const [masterId, setMasterId] = useState(DEFAULT_MASTER);
  const master = byId(masterId);
  const [brief, setBrief] = useState<FrontBrief>(() => ({
    lettering: master.lettering,
    story: STARTERS[2].story,
    theme: "",
    scenery: "",
    props: "",
    storytelling: "",
    icons: "",
  }));
  const [location, setLocation] = useState(STARTERS[2].location);
  const [ribbon, setRibbon] = useState<CartoonRibbon>("teal");
  const [side, setSide] = useState<CartoonSpec["side"]>("right");
  const [printStory, setPrintStory] = useState(true);
  const [upload, setUpload] = useState<{ url: string; name: string } | null>(null);
  const [checked, setChecked] = useState<boolean[]>(() => FRONT_QC.map(() => false));
  const [status, setStatus] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => (upload ? URL.revokeObjectURL(upload.url) : undefined), [upload]);

  const spec: CartoonSpec = {
    scene: upload?.url ?? master.image,
    story: printStory ? brief.story.toUpperCase() : null,
    location: printStory ? location.toUpperCase() : null,
    ribbon,
    side,
    figma: WORKBENCH_NODES.CartoonPostcard,
  };
  const prompt = useMemo(() => frontPrompt(master, brief), [master, brief]);
  const hasNarrative = BRIEF_FIELDS.some(({ key }) => key !== "lettering" && brief[key].trim());
  const setField = (key: keyof FrontBrief, v: string) => setBrief((b) => ({ ...b, [key]: v }));

  const pickMaster = (id: string, scroll = false) => {
    const next = byId(id);
    setMasterId(next.id);
    setUpload(null);
    setBrief((b) => ({ ...b, lettering: b.lettering === master.lettering ? next.lettering : b.lettering }));
    if (scroll) stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 2400);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      flash("Copied the prompt. Attach the master with it.");
    } catch {
      flash("Clipboard blocked by the browser");
    }
  };

  const exportPng = async (pixelRatio: number) => {
    if (!cardRef.current) return;
    const { width, height } = CARTOON_CANVAS;
    try {
      await document.fonts.ready;
      fontCSS ??= getFontEmbedCSS(cardRef.current);
      const url = await toPng(cardRef.current, { width, height, pixelRatio, fontEmbedCSS: await fontCSS });
      const a = document.createElement("a");
      a.href = url;
      a.download = `jkidd-cartoon-${upload ? "front" : master.id}${pixelRatio > 1 ? `@${pixelRatio}x` : ""}.png`;
      a.click();
      flash(`Exported ${width * pixelRatio}×${height * pixelRatio} PNG`);
    } catch (e) {
      flash(`Export failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="page page--wide">
      <PageHeader eyebrow="Genre · Postcard Image Algo" title="Cartoon postcards">
        <p>
          The other side of the postcard, for when it's time to be silly. Big extruded letters, each a window onto
          the scene, a cartoon hero up front, printed on aged card, and one comic story slapped on top. It sits beside
          the archetypes and the illustrated postcards; it doesn't replace them.
        </p>
        <p>
          The picture is generated, not laid out: pick a series master, write the story, send the spec with the master
          attached. Only the narrative changes; the press, the inks and the lettering stay. Bring the result back here
          to put the story on it.
        </p>
      </PageHeader>

      <div className="studio" ref={stageRef}>
        <form className="studio__panel" onSubmit={(e) => e.preventDefault()}>
          <Select
            label="Series master"
            value={master.id}
            options={FRONTS.map((f) => f.id)}
            format={(id) => byId(id).name}
            onChange={(id) => pickMaster(id)}
          />

          <label className="field">
            <span className="label">Story</span>
            <textarea rows={2} value={brief.story} onChange={(e) => setField("story", e.target.value)} />
          </label>
          <div className="toon-starters">
            <span className="label">Starters</span>
            {STARTERS.map((s) => (
              <button
                key={s.story}
                type="button"
                className="btn btn--small btn--ghost"
                onClick={() => {
                  setField("story", s.story);
                  setLocation(s.location);
                }}
              >
                {s.story.charAt(0) + s.story.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <Toggle label="Print the story on the card" checked={printStory} onChange={setPrintStory} />
          {printStory ? (
            <>
              <TextField label="Location ribbon" value={location} onChange={(v) => setLocation(v.toUpperCase())} />
              <fieldset className="ribbon-picker">
                <legend className="label">Ribbon ink</legend>
                <div className="ribbon-picker__row">
                  {CARTOON_RIBBONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className="ribbon-swatch"
                      data-genre="cartoon"
                      data-ribbon={r}
                      aria-pressed={ribbon === r}
                      aria-label={cap(r.replace("-", " "))}
                      title={cap(r.replace("-", " "))}
                      onClick={() => setRibbon(r)}
                    />
                  ))}
                </div>
              </fieldset>
              <Segmented label="Corner" value={side} options={SIDES} format={cap} onChange={setSide} />
            </>
          ) : null}

          <details className="toon-brief">
            <summary className="label">The rest of the brief</summary>
            {BRIEF_FIELDS.filter(({ key }) => key !== "story").map(({ key, label }) =>
              key === "lettering" ? (
                <TextField key={key} label={label} value={brief.lettering} onChange={(v) => setField(key, v.toUpperCase())} />
              ) : (
                <label key={key} className="field">
                  <span className="label">{label}</span>
                  <textarea rows={2} value={brief[key]} onChange={(e) => setField(key, e.target.value)} />
                </label>
              ),
            )}
          </details>
          <p className="muted ill-note">
            Priority 3: only the narrative changes. Everything else is read from the master, so attach it every time.
          </p>
        </form>

        <div className="studio__stage">
          <ScaledBox canvas={CARTOON_CANVAS} label="Cartoon postcard preview">
            <CartoonPostcard ref={cardRef} spec={spec} />
          </ScaledBox>

          <div className="studio__bar">
            <button className="btn btn--primary" onClick={copy} disabled={!hasNarrative}>
              1 · Copy prompt
            </button>
            <a className="btn" href={master.image} download={`jkidd-front-master-${master.id}.jpg`}>
              2 · Download master
            </a>
            <label className="btn">
              3 · Use your front
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUpload({ url: URL.createObjectURL(file), name: file.name });
                  e.target.value = "";
                }}
              />
            </label>
            <button className="btn" onClick={() => exportPng(1)}>
              4 · Export PNG
            </button>
            <button className="btn" onClick={() => exportPng(2)}>
              @2x
            </button>
            <span className="studio__status" role="status">
              {status ||
                (upload
                  ? `Your front: ${upload.name}`
                  : hasNarrative
                    ? ""
                    : "Write a story to copy the prompt.")}
            </span>
          </div>
          <div className="studio__bar">
            {upload ? (
              <button className="btn btn--small btn--ghost" onClick={() => setUpload(null)}>
                Back to the master
              </button>
            ) : null}
            <a
              className="btn btn--small btn--ghost"
              href={figmaUrl(WORKBENCH_NODES.PostcardFronts, WORKBENCH_FILE_KEY)}
              target="_blank"
              rel="noreferrer"
            >
              Workbench {WORKBENCH_NODES.PostcardFronts} ↗
            </a>
          </div>

          <div className="studio__checks">
            <div className="studio__thumb">
              <span className="label">At 320px (Principle 4)</span>
              <ScaledBox canvas={CARTOON_CANVAS} width={320} label="Thumbnail preview">
                <CartoonPostcard spec={spec} />
              </ScaledBox>
            </div>
            <fieldset className="front-qc">
              <legend className="label">Next to the master</legend>
              {FRONT_QC.map((q, i) => (
                <label key={q} className="toggle">
                  <input
                    type="checkbox"
                    checked={checked[i]}
                    onChange={(e) => setChecked((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                  />
                  <span>{q.charAt(0) + q.slice(1).toLowerCase()}</span>
                </label>
              ))}
              <p className="muted ill-note">
                {checked.every(Boolean) ? "It belongs to the series." : 'If any answer is "no," continue refining.'}
              </p>
            </fieldset>
          </div>

          <details className="front-prompt">
            <summary className="label">The prompt</summary>
            <pre>{prompt}</pre>
          </details>
        </div>
      </div>

      <section className="section">
        <h2 className="jk-text-doc-h2">The best of</h2>
        <p className="muted">
          Generations kept from the Workbench. Any of them can be the master for the next one. Pick one to load it.
        </p>
        <div className="ill-grid">
          {FRONTS.map((f) => (
            <button key={f.id} type="button" className="ill-tile" aria-pressed={f.id === master.id} onClick={() => pickMaster(f.id, true)}>
              <img className="front-tile" src={f.image} alt="" loading="lazy" />
              <span className="ill-tile__meta">
                <span className="label">
                  {f.greeting ? "Greetings from " : ""}
                  {f.lettering}
                </span>
                <span className="ill-tile__story">{f.theme}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="jk-text-doc-h2">The production spec</h2>
        <p className="muted">Verbatim from the Workbench. The prompt is this, plus the brief.</p>
        <pre className="front-spec">{FRONT_SPEC}</pre>
      </section>
    </div>
  );
}
