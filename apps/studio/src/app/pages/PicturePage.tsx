import { useEffect, useMemo, useRef, useState } from "react";
import { getFontEmbedCSS, toPng } from "html-to-image";
import {
  BRIEF_FIELDS,
  PICTURE_CANVAS,
  SERIES,
  SERIES_IDS,
  PicturePostcard,
  DEFAULT_MASTER,
  FIGURE_CYCLES,
  FIGURE_DRAWINGS_PER_SECOND,
  FRONTS,
  FRONT_QC,
  FRONT_SPEC,
  STORY_STARTERS,
  NOTEBOOK_FILE_KEY,
  NOTEBOOK_NODES,
  WORKBENCH_FILE_KEY,
  WORKBENCH_NODES,
  figmaUrl,
  frontPrompt,
  seriesRibbons,
  withInlineSvgPaint,
  type PictureSpec,
  type FigureCycle,
  type FigureLine,
  type Front,
  type SeriesId,
  type FrontBrief,
} from "../../ds";
import { PageHeader, Segmented, Select, TextField, Toggle, cap } from "../components/Controls";
import { ScaledBox } from "../components/ScaledCard";
import type { PageProps } from "../App";
import { recordPicture, videoType } from "../video";

const byId = (id: string) => FRONTS.find((f) => f.id === id) ?? FRONTS[0];
/** A series' fronts: the master first, drifted ones last. */
const inSeries = (id: SeriesId) => {
  const rank = (f: Front) => (f.id === SERIES[id].master ? 0 : f.drifted ? 2 : 1);
  return FRONTS.filter((f) => f.series === id).sort((a, b) => rank(a) - rank(b));
};
const SIDES = ["left", "right"] as const;
/** Story starters: the library's own copy. */
const STARTERS = STORY_STARTERS;
/** The title the illustrated set printed over its scenes: the library's own copy. */
const TITLE = "Jefferson Kidd";

let fontCSS: Promise<string> | undefined;

const LINES = ["boil", "still"] as const;

/** The figure's drawing number, ticking at 12 drawings a second while playing. */
function useDrawing(playing: boolean) {
  const [drawing, setDrawing] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setDrawing((d) => d + 1), 1000 / FIGURE_DRAWINGS_PER_SECOND);
    return () => clearInterval(id);
  }, [playing]);
  return drawing;
}

/**
 * The picture postcard, one of the postcard's two types (the archetypes are the other).
 * Generate a front from a series master and the production spec, bring it back, put the
 * story on it, export.
 */
export function PicturePage(_: PageProps) {
  const [masterId, setMasterId] = useState(DEFAULT_MASTER);
  const master = byId(masterId);
  const [brief, setBrief] = useState<FrontBrief>(() => ({
    lettering: master.lettering ?? "",
    story: STARTERS[2].story,
    theme: "",
    scenery: "",
    props: "",
    storytelling: "",
    icons: "",
  }));
  const [location, setLocation] = useState(STARTERS[2].location);
  const [ribbon, setRibbon] = useState("teal");
  const ribbons = seriesRibbons(master.series);
  const [side, setSide] = useState<PictureSpec["side"]>("right");
  const [printStory, setPrintStory] = useState(true);
  const [titleOn, setTitleOn] = useState(master.lettering === null);
  const [title, setTitle] = useState(TITLE);
  const [upload, setUpload] = useState<{ url: string; name: string } | null>(null);
  const [checked, setChecked] = useState<boolean[]>(() => FRONT_QC.map(() => false));
  const [figureOn, setFigureOn] = useState(true);
  const [pressOn, setPressOn] = useState(() => (master.press ?? 0) > 0);
  const [cycle, setCycle] = useState<FigureCycle>("walk");
  const [line, setLine] = useState<FigureLine>("boil");
  const [playing, setPlaying] = useState(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [recording, setRecording] = useState(false);
  const drawing = useDrawing(playing);
  const [status, setStatus] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => (upload ? URL.revokeObjectURL(upload.url) : undefined), [upload]);

  const spec: PictureSpec = {
    scene: upload?.url ?? master.image,
    series: master.series,
    title: titleOn ? title : null,
    story: printStory ? brief.story.toUpperCase() : null,
    location: printStory ? location.toUpperCase() : null,
    ribbon: ribbons.includes(ribbon) ? ribbon : ribbons[0],
    side,
    figure: figureOn ? { cycle, line } : null,
    // A front's own measured press; full press on one it doesn't know (an upload), or when asked for.
    press: pressOn ? (upload ? 1 : master.press || 1) : 0,
  };
  const prompt = useMemo(() => frontPrompt(master, brief), [master, brief]);
  const hasNarrative = BRIEF_FIELDS.some(({ key }) => key !== "lettering" && brief[key].trim());
  const setField = (key: keyof FrontBrief, v: string) => setBrief((b) => ({ ...b, [key]: v }));

  const pickMaster = (id: string, scroll = false) => {
    const next = byId(id);
    setMasterId(next.id);
    // Ribbons belong to a series: keep the ink if the new press has it, else its first.
    const nextRibbons = seriesRibbons(next.series);
    if (!nextRibbons.includes(ribbon)) setRibbon(nextRibbons[0]);
    setUpload(null);
    setPressOn((next.press ?? 0) > 0);
    // Lettering in the picture is the title; an art-only front takes the live one.
    setTitleOn(next.lettering === null);
    setBrief((b) => ({ ...b, lettering: b.lettering === (master.lettering ?? "") ? (next.lettering ?? "") : b.lettering }));
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
    const { width, height } = PICTURE_CANVAS;
    try {
      await document.fonts.ready;
      fontCSS ??= getFontEmbedCSS(cardRef.current);
      const card = cardRef.current;
      const options = { width, height, pixelRatio, fontEmbedCSS: await fontCSS };
      const url = await withInlineSvgPaint(card, () => toPng(card, options));
      const a = document.createElement("a");
      a.href = url;
      a.download = `jkidd-postcard-${upload ? "front" : master.id}${pixelRatio > 1 ? `@${pixelRatio}x` : ""}.png`;
      a.click();
      flash(`Exported ${width * pixelRatio}×${height * pixelRatio} PNG`);
    } catch (e) {
      flash(`Export failed: ${(e as Error).message}`);
    }
  };

  const exportVideo = async () => {
    if (!cardRef.current || !spec.figure) return;
    setRecording(true);
    try {
      await document.fonts.ready;
      fontCSS ??= getFontEmbedCSS(cardRef.current);
      const { blob, ext, seconds } = await recordPicture(cardRef.current, spec.figure, PICTURE_CANVAS, {
        fontEmbedCSS: await fontCSS,
        onProgress: (done) => setStatus(`Recording ${Math.round(done * 100)}%. Keep this tab in front.`),
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `jkidd-postcard-${upload ? "front" : master.id}-${spec.figure.cycle}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
      flash(`Exported ${seconds.toFixed(1)}s ${ext.toUpperCase()} · ${PICTURE_CANVAS.width}×${PICTURE_CANVAS.height}`);
    } catch (e) {
      flash(`Video failed: ${(e as Error).message}`);
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="page page--wide">
      <PageHeader eyebrow="Postcard · Postcard Image Algo" title="Picture postcards">
        <p>
          One of the postcard's two types; the archetypes are the other. Big extruded letters, each a window onto the
          scene, a cartoon hero up front, printed on aged card, set in a cream mat with an ink border. On top, live:
          a location ribbon, a story label tilted 2°, and a title when the front has no lettering of its own.
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
            label="Front"
            value={master.id}
            options={FRONTS.map((f) => f.id)}
            format={(id) => `${SERIES[byId(id).series].name} · ${byId(id).name}`}
            onChange={(id) => pickMaster(id)}
          />
          <p className="muted front-note">
            {SERIES[master.series].name} series, master: {byId(SERIES[master.series].master).name}.
            {master.drifted ? ` Drifted: ${master.drifted}. Regenerate it from the master before using it as one.` : ""}
          </p>

          <label className="field">
            <span className="label">Story</span>
            <textarea rows={2} value={brief.story} onChange={(e) => setField("story", e.target.value)} />
          </label>
          <div className="story-starters">
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

          <Toggle label="Title over the picture" checked={titleOn} onChange={setTitleOn} />
          {titleOn ? <TextField label="Title" value={title} onChange={setTitle} /> : null}

          <Toggle label="Print the story on the card" checked={printStory} onChange={setPrintStory} />
          {printStory ? (
            <>
              <TextField label="Location ribbon" value={location} onChange={(v) => setLocation(v.toUpperCase())} />
              <fieldset className="ribbon-picker">
                <legend className="label">Ribbon ink · {SERIES[master.series].name}</legend>
                <div className="ribbon-picker__row">
                  {ribbons.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className="ribbon-swatch"
                      style={{
                        background: `var(--jk-genre-picture-${master.series}-ribbon-${r})`,
                        borderColor: `var(--jk-genre-picture-${master.series}-ink)`,
                      }}
                      data-ribbon={r}
                      aria-pressed={spec.ribbon === r}
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

          <Toggle label="Press (the western master's grain)" checked={pressOn} onChange={setPressOn} />

          <Toggle label="Stick figure (Architect's Notebook)" checked={figureOn} onChange={setFigureOn} />
          {figureOn ? (
            <>
              <Segmented label="Figure" value={cycle} options={FIGURE_CYCLES} format={cap} onChange={setCycle} />
              <Segmented label="Line" value={line} options={LINES} format={cap} onChange={setLine} />
              <Toggle label="Play" checked={playing} onChange={setPlaying} />
            </>
          ) : null}

          <details className="front-brief">
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
          <p className="muted front-note">
            Priority 3: only the narrative changes. Everything else is read from the master, so attach it every time.
          </p>
        </form>

        <div className="studio__stage">
          <ScaledBox canvas={PICTURE_CANVAS} label="Picture postcard preview">
            <PicturePostcard ref={cardRef} spec={spec} drawing={drawing} />
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
            {figureOn ? (
              <button
                className="btn"
                onClick={exportVideo}
                disabled={recording || !videoType()}
                title={videoType() ? undefined : "This browser can't record video"}
              >
                5 · Export video
              </button>
            ) : null}
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
            {figureOn ? (
              <a
                className="btn btn--small btn--ghost"
                href={figmaUrl(NOTEBOOK_NODES.Figures, NOTEBOOK_FILE_KEY)}
                target="_blank"
                rel="noreferrer"
              >
                Architect's Notebook {NOTEBOOK_NODES.Figures} ↗
              </a>
            ) : null}
          </div>

          <div className="studio__checks">
            <div className="studio__thumb">
              <span className="label">At 320px (Principle 4)</span>
              <ScaledBox canvas={PICTURE_CANVAS} width={320} label="Thumbnail preview">
                <PicturePostcard spec={spec} drawing={drawing} />
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
              <p className="muted front-note">
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
        <h2 className="jk-text-doc-h2">The series</h2>
        <p className="muted">
          Generations kept from the Workbench, by press. A series is one master, the fronts drawn from it and the
          inks read off them; its ribbons are its own. Any on-press front can be the master for the next one. Pick one
          to load it.
        </p>
        {SERIES_IDS.map((id) => (
          <div key={id} className="front-series">
            <h3 className="label">
              {SERIES[id].name} · {inSeries(id).length} front{inSeries(id).length === 1 ? "" : "s"}
            </h3>
            <div className="front-grid">
              {inSeries(id).map((f) => (
                <button key={f.id} type="button" className="front-pick" aria-pressed={f.id === master.id} onClick={() => pickMaster(f.id, true)}>
                  <img className="front-tile" src={f.image} alt="" loading="lazy" />
                  <span className="front-pick__meta">
                    <span className="label">
                      {f.id === SERIES[id].master ? "Master · " : ""}
                      {f.drifted ? "Drifted · " : ""}
                      {f.greeting ? "Greetings from " : ""}
                      {f.lettering ?? "No lettering"}
                    </span>
                    <span className="front-pick__story">{f.drifted ? `${f.theme}. ${f.drifted}.` : f.theme}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="section">
        <h2 className="jk-text-doc-h2">The production spec</h2>
        <p className="muted">Verbatim from the Workbench. The prompt is this, plus the brief.</p>
        <pre className="front-spec">{FRONT_SPEC}</pre>
      </section>
    </div>
  );
}
