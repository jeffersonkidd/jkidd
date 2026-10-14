import { HandleLockup, Monogram, Wordmark, FIGMA_NODES, figmaUrl, type MonogramSize, type MonogramTone } from "../../ds";
import { PageHeader } from "../components/Controls";
import type { PageProps } from "../App";

const TONES: MonogramTone[] = ["brand", "ink", "outline"];
const SIZES: MonogramSize[] = ["L", "M", "S"];
const PROJECTS = ["TIBBIE X", "HF LAB", "SDS LAB", "MONOFLY"];

export function MarksPage(_: PageProps) {
  return (
    <div className="page">
      <PageHeader eyebrow="Components · 01" title="Marks">
        <p>
          Placeholders until the real marks are designed (JKIDD.md §6, step 3): a typeset JK monogram and wordmark in the
          display face. The Handle Lockup is the top-right chrome of every card: the J.F. Kidd mark and handle fixed, the
          project in a slot you can hide (decision 3a, settled 2026-09-24).
        </p>
      </PageHeader>

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
          <Monogram />
          <Wordmark layout="stacked" />
          <HandleLockup project="TIBBIE X" />
        </div>
      </section>
    </div>
  );
}
