import { useEffect, useRef, useState } from "react";
import { getFontEmbedCSS, toPng } from "html-to-image";
import {
  FIGURE_DRAWINGS_PER_SECOND,
  ILLUSTRATED_SAMPLES,
  NOTEBOOK_FILE_KEY,
  NOTEBOOK_NODES,
  STAGE,
  STAGE_CANVAS,
  STAGE_DEPTHS,
  StagePostcard,
  figmaUrl,
  type FigureLine,
  type StageActor,
  type StageDepth,
  type StageSpec,
} from "../../ds";
import { PageHeader, Segmented, Select, TextField, Toggle, cap } from "../components/Controls";
import { ScaledBox } from "../components/ScaledCard";
import type { PageProps } from "../App";

/** What a depth can hold. */
const MOVES = {
  empty: null,
  "walk-right": { cycle: "walk", dir: 1 },
  "walk-left": { cycle: "walk", dir: -1 },
  "run-right": { cycle: "run", dir: 1 },
  "run-left": { cycle: "run", dir: -1 },
  wave: { cycle: "wave", dir: 1 },
} as const satisfies Record<string, Pick<StageActor, "cycle" | "dir"> | null>;
type Move = keyof typeof MOVES;
const MOVE_KEYS = Object.keys(MOVES) as Move[];
const MOVE_NAMES: Record<Move, string> = {
  empty: "Empty",
  "walk-right": "Walks right",
  "walk-left": "Walks left",
  "run-right": "Runs right",
  "run-left": "Runs left",
  wave: "Waves on the mark",
};
/** Where each depth's mark is, and how far each walker is offset so they don't step in time. */
const MARK: Record<StageDepth, number> = { up: 0.3, mid: 0.68, down: 0.5 };
const OFFSET: Record<StageDepth, number> = { up: 0, mid: 17, down: 40 };

const LINES = ["boil", "still"] as const;
/** The illustrated set's stories, as starters: the library's own copy. */
const STARTERS = ILLUSTRATED_SAMPLES.map(({ story, location }) => ({ story, location }));

let fontCSS: Promise<string> | undefined;

function useDrawing(playing: boolean) {
  const [drawing, setDrawing] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setDrawing((d) => d + 1), 1000 / FIGURE_DRAWINGS_PER_SECOND);
    return () => clearInterval(id);
  }, [playing]);
  return drawing;
}

/** The stage postcard: graph paper, a stage at three depths, and stick figures sized to the squares. */
export function StagePage(_: PageProps) {
  const [story, setStory] = useState(STARTERS[3].story);
  const [location, setLocation] = useState(STARTERS[3].location);
  const [moves, setMoves] = useState<Record<StageDepth, Move>>({ up: "walk-left", mid: "wave", down: "walk-right" });
  const [line, setLine] = useState<FigureLine>("boil");
  const [playing, setPlaying] = useState(() => !matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [status, setStatus] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const drawing = useDrawing(playing);

  const actors: StageActor[] = STAGE_DEPTHS.flatMap((depth) => {
    const m = MOVES[moves[depth]];
    return m ? [{ depth, ...m, at: MARK[depth], offset: OFFSET[depth] }] : [];
  });
  const spec: StageSpec = { story: story.toUpperCase(), location: location.toUpperCase(), actors, line };

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 2400);
  };

  const exportPng = async (pixelRatio: number) => {
    if (!cardRef.current) return;
    const { width, height } = STAGE_CANVAS;
    try {
      await document.fonts.ready;
      fontCSS ??= getFontEmbedCSS(cardRef.current);
      const url = await toPng(cardRef.current, { width, height, pixelRatio, fontEmbedCSS: await fontCSS });
      const a = document.createElement("a");
      a.href = url;
      a.download = `jkidd-stage${pixelRatio > 1 ? `@${pixelRatio}x` : ""}.png`;
      a.click();
      flash(`Exported ${width * pixelRatio}×${height * pixelRatio} PNG`);
    } catch (e) {
      flash(`Export failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="page page--wide">
      <PageHeader eyebrow="Genre · Architect's Notebook" title="Stage postcards">
        <p>
          A stage drawn on graph paper in the Architect's Notebook hand, with stick figures at three depths. The paper
          sets the sizes: a square is 32px, and a figure is 8 squares tall downstage, 6 midstage and 4 upstage, so
          anything you place lines up with the grid. Figures enter and leave behind the wings at their own depth.
        </p>
        <p>Not in Workbench yet: this is the first draft, in code.</p>
      </PageHeader>

      <div className="studio">
        <form className="studio__panel" onSubmit={(e) => e.preventDefault()}>
          <label className="field">
            <span className="label">Story</span>
            <textarea rows={2} value={story} onChange={(e) => setStory(e.target.value)} />
          </label>
          <div className="toon-starters">
            <span className="label">Starters</span>
            {STARTERS.map((s) => (
              <button
                key={s.story}
                type="button"
                className="btn btn--small btn--ghost"
                onClick={() => {
                  setStory(s.story);
                  setLocation(s.location);
                }}
              >
                {s.story.charAt(0) + s.story.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <TextField label="Location" value={location} onChange={(v) => setLocation(v.toUpperCase())} />

          {[...STAGE_DEPTHS].reverse().map((d) => (
            <Select
              key={d}
              label={`${STAGE[d].name} · ${STAGE[d].squares} squares`}
              value={moves[d]}
              options={MOVE_KEYS}
              format={(m) => MOVE_NAMES[m]}
              onChange={(m) => setMoves((s) => ({ ...s, [d]: m }))}
            />
          ))}
          <Segmented label="Line" value={line} options={LINES} format={cap} onChange={setLine} />
          <Toggle label="Play" checked={playing} onChange={setPlaying} />
        </form>

        <div className="studio__stage">
          <ScaledBox canvas={STAGE_CANVAS} label="Stage postcard preview">
            <StagePostcard ref={cardRef} spec={spec} drawing={drawing} />
          </ScaledBox>

          <div className="studio__bar">
            <button className="btn btn--primary" onClick={() => exportPng(1)}>
              Export PNG · {STAGE_CANVAS.width}×{STAGE_CANVAS.height}
            </button>
            <button className="btn" onClick={() => exportPng(2)}>
              @2x
            </button>
            <a className="btn btn--ghost" href={figmaUrl(NOTEBOOK_NODES.Figures, NOTEBOOK_FILE_KEY)} target="_blank" rel="noreferrer">
              Architect's Notebook {NOTEBOOK_NODES.Figures} ↗
            </a>
            <span className="studio__status" role="status">
              {status}
            </span>
          </div>

          <div className="studio__thumb">
            <span className="label">At 320px (Principle 4)</span>
            <ScaledBox canvas={STAGE_CANVAS} width={320} label="Thumbnail preview">
              <StagePostcard spec={spec} drawing={drawing} />
            </ScaledBox>
          </div>
        </div>
      </div>
    </div>
  );
}
