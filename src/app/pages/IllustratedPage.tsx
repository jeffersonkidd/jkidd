import { useRef, useState } from "react";
import { getFontEmbedCSS, toPng } from "html-to-image";
import {
  ILLUSTRATED_CANVAS,
  ILLUSTRATED_SAMPLES,
  IllustratedPostcard,
  RIBBONS,
  WORKBENCH_FILE_KEY,
  figmaUrl,
  type IllustratedSpec,
  type Ribbon,
} from "../../ds";
import { PageHeader, Select, TextField, Toggle, cap } from "../components/Controls";
import { ScaledBox } from "../components/ScaledCard";
import type { PageProps } from "../App";

const SCENES = {
  railway: { name: "Mountain railway", sample: ILLUSTRATED_SAMPLES[0] },
  riverboat: { name: "Riverboat", sample: ILLUSTRATED_SAMPLES[1] },
  lunar: { name: "Lunar colony", sample: ILLUSTRATED_SAMPLES[2] },
  edo: { name: "Edo bridge", sample: ILLUSTRATED_SAMPLES[3] },
  venice: { name: "Venice carnival", sample: ILLUSTRATED_SAMPLES[4] },
} as const;
type SceneKey = keyof typeof SCENES;
const SCENE_KEYS = Object.keys(SCENES) as SceneKey[];
const sceneOf = (spec: IllustratedSpec) => SCENE_KEYS.find((k) => SCENES[k].sample.scene === spec.scene) ?? "railway";

let fontCSS: Promise<string> | undefined;

/** The illustrated postcard genre: the Workbench set, and a maker that exports at canvas size. */
export function IllustratedPage(_: PageProps) {
  const [spec, setSpec] = useState<IllustratedSpec>(ILLUSTRATED_SAMPLES[0]);
  const [title, setTitle] = useState(ILLUSTRATED_SAMPLES[0].title ?? "Jefferson Kidd");
  const [status, setStatus] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const set = (patch: Partial<IllustratedSpec>) => setSpec((s) => ({ ...s, ...patch }));

  const load = (s: IllustratedSpec) => {
    setSpec(s);
    if (s.title) setTitle(s.title);
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 2400);
  };

  const exportPng = async (pixelRatio: number) => {
    if (!cardRef.current) return;
    const { width, height } = ILLUSTRATED_CANVAS;
    try {
      await document.fonts.ready;
      fontCSS ??= getFontEmbedCSS(cardRef.current);
      const url = await toPng(cardRef.current, { width, height, pixelRatio, fontEmbedCSS: await fontCSS });
      const a = document.createElement("a");
      a.href = url;
      a.download = `jkidd-postcard-${sceneOf(spec)}${pixelRatio > 1 ? `@${pixelRatio}x` : ""}.png`;
      a.click();
      flash(`Exported ${width * pixelRatio}×${height * pixelRatio} PNG`);
    } catch (e) {
      flash(`Export failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="page page--wide">
      <PageHeader eyebrow="Genre · POSTCARDS.md §4" title="Illustrated postcards">
        <p>
          The front of a postcard, dressed in a retro illustrated genre: a cream mat, an ink-bordered scene, a location
          ribbon and a tilted story label. The scene is the only picture; everything on it is type, so the same five
          scenes carry any story. Read from the JKidd - Workbench file. Genre colours are their own tokens, not the
          palette's.
        </p>
      </PageHeader>

      <div className="studio" ref={stageRef}>
        <form className="studio__panel" onSubmit={(e) => e.preventDefault()}>
          <Select
            label="Scene"
            value={sceneOf(spec)}
            options={SCENE_KEYS}
            format={(k) => SCENES[k].name}
            onChange={(k) => set({ scene: SCENES[k].sample.scene, figma: SCENES[k].sample.figma })}
          />
          <fieldset className="ribbon-picker">
            <legend className="label">Ribbon</legend>
            <div className="ribbon-picker__row">
              {RIBBONS.map((r: Ribbon) => (
                <button
                  key={r}
                  type="button"
                  className="ribbon-swatch"
                  data-ribbon={r}
                  aria-pressed={spec.ribbon === r}
                  aria-label={cap(r)}
                  title={cap(r)}
                  onClick={() => set({ ribbon: r })}
                />
              ))}
            </div>
          </fieldset>
          <TextField label="Location ribbon" value={spec.location} onChange={(v) => set({ location: v.toUpperCase() })} />
          <TextField label="Story label" value={spec.story} onChange={(v) => set({ story: v.toUpperCase() })} />
          <Toggle label="Title over the scene" checked={spec.title !== null} onChange={(on) => set({ title: on ? title : null })} />
          {spec.title !== null ? (
            <TextField
              label="Title"
              value={spec.title}
              onChange={(v) => {
                setTitle(v);
                set({ title: v });
              }}
            />
          ) : null}
          <p className="muted ill-note">
            Write the real story in. The scene sets the mood; the label carries the one idea (Principle 5).
          </p>
        </form>

        <div className="studio__stage">
          <ScaledBox canvas={ILLUSTRATED_CANVAS} label="Illustrated postcard preview">
            <IllustratedPostcard ref={cardRef} spec={spec} />
          </ScaledBox>

          <div className="studio__bar">
            <button className="btn btn--primary" onClick={() => exportPng(1)}>
              Export PNG · {ILLUSTRATED_CANVAS.width}×{ILLUSTRATED_CANVAS.height}
            </button>
            <button className="btn" onClick={() => exportPng(2)}>
              @2x
            </button>
            {spec.figma ? (
              <a className="btn btn--ghost" href={figmaUrl(spec.figma, WORKBENCH_FILE_KEY)} target="_blank" rel="noreferrer">
                Workbench {spec.figma} ↗
              </a>
            ) : null}
            <span className="studio__status" role="status">
              {status}
            </span>
          </div>

          <div className="studio__thumb">
            <span className="label">At 320px (Principle 4)</span>
            <ScaledBox canvas={ILLUSTRATED_CANVAS} width={320} label="Thumbnail preview">
              <IllustratedPostcard spec={spec} />
            </ScaledBox>
          </div>
        </div>
      </div>

      <section className="section">
        <h2 className="jk-text-doc-h2">The Workbench set</h2>
        <p className="muted">Five scenes as drawn in Workbench. Pick one to load it into the maker.</p>
        <div className="ill-grid">
          {ILLUSTRATED_SAMPLES.map((s) => (
            <button key={s.figma} type="button" className="ill-tile" onClick={() => load(s)}>
              <ScaledBox canvas={ILLUSTRATED_CANVAS} label={`${s.location}: ${s.story}`}>
                <IllustratedPostcard spec={s} />
              </ScaledBox>
              <span className="ill-tile__meta">
                <span className="label">{s.location}</span>
                <span className="ill-tile__story">{s.story}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
