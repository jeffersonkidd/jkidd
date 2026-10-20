import { BUDGET, CATALOG, SERIES, type Dressing, type Placed, type Reading } from "../../../ds";
import { cap } from "../../components/Controls";

export const shapeName = (id: string) => CATALOG.find((c) => c.id === id)?.name ?? id;

function Why({ lines }: { lines: string[] }) {
  return (
    <ul className="backs__why">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

/** The Read and Pick nodes of the back workflow, shown: what the card says, and what that dressed it in. */
export function DressingReport({ reading, dressing, placed }: { reading: Reading; dressing: Dressing; placed: Placed }) {
  const dropped = (id: string, prefer?: unknown) => Boolean(prefer) && placed.shapes[id] === null;
  return (
    <details className="studio__report" open>
      <summary className="label">Why this dressing</summary>
      <div className="backs__report">
        <section>
          <h2 className="jk-text-doc-h2">What the card says</h2>
          <dl className="backs__reading">
            <dt>Tone</dt>
            <dd>
              {cap(reading.tone)}, from post type {reading.postType}
              {reading.struck ? `, ${reading.struck} struck` : ""}
            </dd>
            <dt>Topics</dt>
            <dd>
              {reading.topics.length ? (
                reading.topics.map((t) => (
                  <details key={t.topic}>
                    <summary>
                      {cap(t.topic)} <span className="muted">· {t.score}</span>
                    </summary>
                    <ul className="backs__evidence">
                      {t.evidence.map((e, i) => (
                        <li key={i}>
                          “{e.text}” <code>{e.path}</code>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))
              ) : (
                <span className="muted">None the reader knows.</span>
              )}
            </dd>
            <dt>Figures</dt>
            <dd>{reading.numbers.length ? reading.numbers.map((n) => n.text).join(" · ") : <span className="muted">None</span>}</dd>
            <dt>Verdict</dt>
            <dd>
              {reading.verdict ? (
                <>
                  “{reading.verdict.text}” <code>{reading.verdict.path}</code>
                </>
              ) : (
                <span className="muted">None</span>
              )}
            </dd>
            {reading.verbs.length ? (
              <>
                <dt>Arrows</dt>
                <dd>{reading.verbs.map((v) => v.text).join(", ")}</dd>
              </>
            ) : null}
            <dt>Source</dt>
            <dd>{reading.source ? `Idea ${reading.source.idea} · journal ${reading.source.event}` : <span className="muted">No template: no source to cite</span>}</dd>
          </dl>
        </section>

        <section>
          <h2 className="jk-text-doc-h2">
            What it's dressed in <span className="muted">· budget {dressing.budget.used} of {BUDGET}</span>
          </h2>
          <ul className="backs__picks">
            <li>
              <span className="label">Texture</span>
              <strong>{shapeName(dressing.texture.id)}</strong>
              <Why lines={dressing.texture.why} />
            </li>
            {dressing.overlays.map((o) => (
              <li key={o.id}>
                <span className="label">Overlay</span>
                <strong>{shapeName(o.id)}</strong>
                <Why lines={o.why} />
              </li>
            ))}
            {dressing.dress ? (
              <li>
                <span className="label">Style</span>
                <strong>{SERIES[dressing.dress as keyof typeof SERIES].name} series inks</strong>
                <Why lines={["Printed in the series' ink, so the back pairs with that series' fronts."]} />
              </li>
            ) : null}
            {dressing.shapes.map((s) => (
              <li key={s.id} data-dropped={dropped(s.id, s.prefer) || undefined}>
                <span className="label">Shape{dropped(s.id, s.prefer) ? " · dropped, no room" : ""}</span>
                <strong>{shapeName(s.id)}</strong>
                <Why lines={s.why} />
              </li>
            ))}
          </ul>
          {dressing.skipped.length ? (
            <details className="backs__skipped">
              <summary className="label">
                Left in the <a href="#/stock">catalog</a> · {dressing.skipped.length}
              </summary>
              <ul>
                {dressing.skipped.map((s) => (
                  <li key={s.id}>
                    <strong>{shapeName(s.id)}</strong> {s.why}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      </div>
    </details>
  );
}
