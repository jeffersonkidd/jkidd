import { useMemo, useRef, useState } from "react";
import {
  BRIEF_FIELDS,
  DEFAULT_MASTER,
  FRONTS,
  FRONT_QC,
  FRONT_SPEC,
  WORKBENCH_FILE_KEY,
  WORKBENCH_NODES,
  figmaUrl,
  frontPrompt,
  type Front,
  type FrontBrief,
} from "../../ds";
import { PageHeader, Select, TextField } from "../components/Controls";
import type { PageProps } from "../App";

const byId = (id: string) => FRONTS.find((f) => f.id === id) ?? FRONTS[0];
const emptyBrief = (master: Front): FrontBrief => ({
  lettering: master.lettering,
  theme: "",
  scenery: "",
  props: "",
  storytelling: "",
  icons: "",
});

/** Large-letter postcard fronts: the Workbench best-of, and a prompt composer built on the production spec. */
export function FrontsPage(_: PageProps) {
  const [masterId, setMasterId] = useState(DEFAULT_MASTER);
  const master = byId(masterId);
  const [brief, setBrief] = useState<FrontBrief>(() => emptyBrief(master));
  const [checked, setChecked] = useState<boolean[]>(() => FRONT_QC.map(() => false));
  const [status, setStatus] = useState("");
  const stageRef = useRef<HTMLDivElement>(null);

  const prompt = useMemo(() => frontPrompt(master, brief), [master, brief]);
  const hasNarrative = BRIEF_FIELDS.some(({ key }) => key !== "lettering" && brief[key].trim());

  const pickMaster = (id: string, scroll = false) => {
    const next = byId(id);
    setMasterId(next.id);
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

  return (
    <div className="page page--wide">
      <PageHeader eyebrow="Genre · Postcard Image Algo" title="Postcard fronts">
        <p>
          The other side of the postcard, for when it's time to be silly. Big extruded letters, each a window onto
          the scene, a cartoon hero up front, printed on aged card. It sits beside the archetypes and the illustrated
          postcards; it doesn't replace them. These fronts are generated, not laid out: pick a series master, write
          the narrative, and send the spec with the master attached. Only the narrative changes; the press, the inks
          and the lettering stay.
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
          {BRIEF_FIELDS.map(({ key, label }) =>
            key === "lettering" ? (
              <TextField
                key={key}
                label={label}
                value={brief.lettering}
                onChange={(v) => setBrief((b) => ({ ...b, lettering: v.toUpperCase() }))}
              />
            ) : (
              <label key={key} className="field">
                <span className="label">{label}</span>
                <textarea
                  rows={2}
                  value={brief[key]}
                  onChange={(e) => setBrief((b) => ({ ...b, [key]: e.target.value }))}
                />
              </label>
            ),
          )}
          <p className="muted ill-note">
            Priority 3: only these change. Everything else is read from the master, so attach it every time.
          </p>
        </form>

        <div className="studio__stage">
          <img className="front-master" src={master.image} alt={`Series master. ${master.lettering}: ${master.theme}`} />

          <div className="studio__bar">
            <button className="btn btn--primary" onClick={copy} disabled={!hasNarrative}>
              Copy prompt
            </button>
            <a className="btn" href={master.image} download={`jkidd-front-master-${master.id}.jpg`}>
              Download master
            </a>
            <a
              className="btn btn--ghost"
              href={figmaUrl(WORKBENCH_NODES.PostcardFronts, WORKBENCH_FILE_KEY)}
              target="_blank"
              rel="noreferrer"
            >
              Workbench {WORKBENCH_NODES.PostcardFronts} ↗
            </a>
            <span className="studio__status" role="status">
              {status || (hasNarrative ? "" : "Write at least one line of narrative to copy.")}
            </span>
          </div>

          <details className="front-prompt">
            <summary className="label">The prompt</summary>
            <pre>{prompt}</pre>
          </details>

          <fieldset className="front-qc">
            <legend className="label">Quality control: the new card next to the master</legend>
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
        <p className="muted">Verbatim from the Workbench. The prompt above is this, plus the brief.</p>
        <pre className="front-spec">{FRONT_SPEC}</pre>
      </section>
    </div>
  );
}
