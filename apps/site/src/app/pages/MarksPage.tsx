import { Emblem, HandleLockup, Monogram, Wordmark, FIGMA_NODES, figmaUrl, type MonogramSize, type MonogramTone } from "../../ds";
import { PageHeader } from "../components/Controls";
import type { PageProps } from "../App";

const TONES: MonogramTone[] = ["brand", "ink", "outline"];
const SIZES: MonogramSize[] = ["L", "M", "S"];
const PROJECTS = ["TIBBIE X", "HF LAB", "SDS LAB", "MONOFLY"];
const EMBLEM_SIZES = [192, 96, 48, 32, 16];

export function MarksPage(_: PageProps) {
  return (
    <div className="page">
      <PageHeader eyebrow="Components · 01" title="Marks">
        <p>
          The emblem is the real mark. The monogram and wordmark are placeholders until they're designed (JKIDD.md §6,
          step 3): typeset in the display face. The Handle Lockup is the top-right chrome of every card: the J.F. Kidd mark and handle fixed, the
          project in a slot you can hide (decision 3a, settled 2026-09-24).
        </p>
      </PageHeader>

      <section className="section">
        <h2 className="jk-text-doc-h2">
          Emblem <a className="figma-link" href={figmaUrl(FIGMA_NODES.Emblem)} target="_blank" rel="noreferrer">{FIGMA_NODES.Emblem[1]} ↗</a>
        </h2>
        <p className="muted">
          The winged seahorse: logo, favicon and avatar, drawn from the master's own geometry. The badge keeps its black,
          grey and white on light or dark; Mono takes the text colour, and is the figure's default since it has no field
          of its own. Below 32px the detail closes up, so the favicon is as small as it goes.
        </p>
        <div className="board">
          <div className="board__row">
            <span className="label board__caption">badge</span>
            {EMBLEM_SIZES.map((size) => (
              <Emblem key={size} size={size} />
            ))}
          </div>
          <div className="board__row">
            <span className="label board__caption">figure</span>
            {EMBLEM_SIZES.map((size) => (
              <Emblem key={size} variant="figure" size={size / 2} />
            ))}
          </div>
          <div className="board__row">
            <span className="label board__caption">mono</span>
            <Emblem tone="mono" size={96} />
            <Emblem tone="mono" size={48} />
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="jk-text-doc-h2">
          Monogram <a className="figma-link" href={figmaUrl(FIGMA_NODES.Monogram)} target="_blank" rel="noreferrer">{FIGMA_NODES.Monogram[1]} ↗</a>
        </h2>
        <p className="muted">Brand on light or dark; Ink for the Principle card and print; Outline over photos.</p>
        <div className="board">
          {TONES.map((tone) => (
            <div key={tone} className="board__row">
              <span className="label board__caption">{tone}</span>
              {SIZES.map((size) => (
                <Monogram key={size} tone={tone} size={size} />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="jk-text-doc-h2">
          Wordmark <a className="figma-link" href={figmaUrl(FIGMA_NODES.Wordmark)} target="_blank" rel="noreferrer">{FIGMA_NODES.Wordmark[1]} ↗</a>
        </h2>
        <p className="muted">The surname carries the brand colour.</p>
        <div className="board board--split">
          <Wordmark layout="inline" />
          <Wordmark layout="stacked" />
        </div>
      </section>

      <section className="section">
        <h2 className="jk-text-doc-h2">
          Handle Lockup <a className="figma-link" href={figmaUrl(FIGMA_NODES.HandleLockup)} target="_blank" rel="noreferrer">{FIGMA_NODES.HandleLockup[1]} ↗</a>
        </h2>
        <p className="muted">The project slot takes the project's name, or hides for posts about J.F. Kidd himself.</p>
        <div className="board board--stack">
          {PROJECTS.map((p) => (
            <HandleLockup key={p} project={p} />
          ))}
          <HandleLockup project={null} />
        </div>
      </section>

      <section className="section">
        <h2 className="jk-text-doc-h2">On dark</h2>
        <div className="board board--split" data-scheme="dark">
          <Emblem size={96} />
          <Emblem tone="mono" size={96} />
          <Emblem variant="figure" size={60} />
          <Monogram />
          <Wordmark layout="stacked" />
          <HandleLockup project="TIBBIE X" />
        </div>
      </section>
    </div>
  );
}
