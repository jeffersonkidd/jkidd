import { useCallback, useMemo, useRef, useState } from "react";
import { getFontEmbedCSS, toPng } from "html-to-image";
import {
  ARCHETYPES,
  BUDGET,
  CANVAS,
  CATALOG,
  DressedPostcard,
  Postcard,
  SAMPLES,
  SERIES,
  SERIES_IDS,
  TEMPLATES,
  backVars,
  dressBack,
  type CardSource,
  type CardSpec,
  type CatalogEntry,
  type Placed,
} from "../../ds";
import { PageHeader, Select, cap } from "../components/Controls";
import { ScaledBox } from "../components/ScaledCard";
import { lintCard } from "../lint";
import { encodeSpec } from "../share";
import type { PageProps } from "../App";

/** Every card the library has to dress: the templates (real work, with a source) and the samples. */
const CARDS: { id: string; name: string; spec: CardSpec; source: CardSource | null }[] = [
  ...TEMPLATES.map((t) => ({ id: t.id, name: `${t.name} · ${ARCHETYPES[t.spec.archetype].name}`, spec: t.spec, source: { idea: t.idea, event: t.event } })),
  ...Object.values(SAMPLES).map((s) => ({ id: `sample-${s.archetype}`, name: `Sample · ${ARCHETYPES[s.archetype].name}`, spec: s, source: null })),
];
const CARD_IDS = CARDS.map((c) => c.id);
const DRESSES = ["", ...SERIES_IDS] as const;

const NODES = [
  { name: "Intake", says: "The card as JSON: frame props, one archetype, its content. A template brings its idea and journal event." },
  { name: "Lint", says: "The card rules from POSTCARDS.md. Dressing never fixes a card that fails them." },
  { name: "Read", says: "Topics, tone, figures, a verdict and the arrows' verbs, each with the JSON path it came from." },
  { name: "Pick", says: "Score the stock catalog against the reading. Seeded, budgeted, every pick with its reasons." },
  { name: "Place", says: "Measure the rendered card; put each shape in the nearest free space, or drop it and say so." },
  { name: "Check", says: "320px thumbnail, dropped shapes, and 4.5:1 on any series' cream (back.test.mjs)." },
  { name: "Export", says: "PNG at canvas size, plus the dressing as JSON: the receipt that reproduces this back." },
];

let fontCSS: Promise<string> | null = null;

function Why({ lines }: { lines: string[] }) {
  return (
    <ul className="backs__why">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

/** A texture or overlay on a strip of card, in the page's scheme. */
function Swatch({ entry, scheme }: { entry: CatalogEntry; scheme: string }) {
  const attrs = entry.kind === "texture" ? { "data-texture": entry.id } : { "data-texture": "none", "data-overlays": entry.id };
  return (
    <div className="jk-back backs__swatch" data-scheme={scheme} data-post-type="progress" style={backVars(7)} {...attrs}>
      <div className="jk-card">
        <span />
      </div>
    </div>
  );
}

export function BacksPage({ scheme: pageScheme, query, navigate }: PageProps) {
  const cardId = CARD_IDS.includes(query.get("card") ?? "") ? query.get("card")! : CARDS[0].id;
  const dress = (DRESSES as readonly string[]).includes(query.get("dress") ?? "") ? query.get("dress")! : "";
  const take = Math.max(0, Number(query.get("take")) || 0);
  const card = CARDS.find((c) => c.id === cardId)!;
  const go = (patch: Record<string, string | number>) => {
    const q = new URLSearchParams({ card: cardId, dress, take: String(take), ...Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, String(v)])) });
    if (!q.get("dress")) q.delete("dress");
    if (q.get("take") === "0") q.delete("take");
    navigate(`backs?${q}`);
  };

  const { reading, dressing } = useMemo(() => dressBack(card.spec, { source: card.source, dress: dress || null, take }), [card, dress, take]);
  const gallery = useMemo(() => CARDS.filter((c) => c.source).map((c) => ({ ...c, ...dressBack(c.spec, { source: c.source }) })), []);
  const findings = lintCard(card.spec);
  const [placed, setPlaced] = useState<Placed>({ shapes: {}, zones: [] });
  const onPlace = useCallback((p: Placed) => setPlaced(p), []);
  const [status, setStatus] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const canvas = CANVAS[card.spec.ratio ?? "16:9"];

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 2400);
  };
  const exportPng = async () => {
    if (!ref.current) return;
    try {
      await document.fonts.ready;
      fontCSS ??= getFontEmbedCSS(ref.current);
      const url = await toPng(ref.current, { ...canvas, pixelRatio: 1, fontEmbedCSS: await fontCSS });
      const a = document.createElement("a");
      a.href = url;
      a.download = `jkidd-back-${card.id}${dress ? `-${dress}` : ""}${take ? `-take${take}` : ""}.png`;
      a.click();
      flash(`Exported ${canvas.width}×${canvas.height} PNG`);
    } catch (e) {
      flash(`Export failed: ${(e as Error).message}`);
    }
  };
  const copyReceipt = async () => {
    const receipt = { card: card.id, source: card.source, spec: card.spec, dressing, placed: placed.shapes };
    try {
      await navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
      flash("Copied the dressing receipt");
    } catch {
      flash("Clipboard blocked by the browser");
    }
  };

  const shapeName = (id: string) => CATALOG.find((c) => c.id === id)?.name ?? id;
  const dropped = dressing.shapes.filter((s) => s.prefer && placed.shapes[s.id] === null);

  return (
    <div className="page page--wide">
      <PageHeader eyebrow="Creator OS" title="Dressing the back">
        <p>
          The archetype card is the message side of the postcard. This node takes its JSON, reads it for meaning, and
          dresses it from a stock catalog of textures, overlays and shapes, without moving the frame, covering the content
          or printing a word the card didn't say. Same card, same back; ask for another take to reshuffle the close calls.
        </p>
      </PageHeader>

      <ol className="backs__nodes" aria-label="The workflow">
        {NODES.map((n, i) => (
          <li key={n.name} data-here={n.name === "Read" || n.name === "Pick" || n.name === "Place" || undefined}>
            <span className="label">{String(i + 1).padStart(2, "0")}</span>
            <strong>{n.name}</strong>
            <span>{n.says}</span>
          </li>
        ))}
      </ol>

      <div className="sticky-controls backs__controls">
        <Select label="Card" value={cardId} options={CARD_IDS} onChange={(id) => go({ card: id, take: 0 })} format={(id) => CARDS.find((c) => c.id === id)!.name} />
        <Select
          label="Printed in"
          value={dress}
          options={DRESSES}
          onChange={(d) => go({ dress: d })}
          format={(d) => (d ? `${SERIES[d as keyof typeof SERIES].name} series inks` : "The card's own scheme")}
        />
        <div className="backs__take">
          <span className="label">Take {take + 1}</span>
          <div className="backs__take-btns">
            <button className="btn" onClick={() => go({ take: take + 1 })}>
              Another take
            </button>
            {take ? (
              <button className="btn btn--ghost" onClick={() => go({ take: 0 })}>
                First take
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="backs__compare">
        <figure>
          <figcaption className="label">Default rendering</figcaption>
          <ScaledBox canvas={canvas} label="The plain archetype card">
            <Postcard spec={dressing.scheme ? { ...card.spec, scheme: dressing.scheme } : card.spec} />
          </ScaledBox>
        </figure>
        <figure>
          <figcaption className="label">Dressed</figcaption>
          <ScaledBox canvas={canvas} label="The dressed back">
            <DressedPostcard ref={ref} spec={card.spec} dressing={dressing} onPlace={onPlace} />
          </ScaledBox>
        </figure>
      </div>

      <div className="studio__bar">
        <button className="btn btn--primary" onClick={exportPng}>
          Export PNG · {canvas.width}×{canvas.height}
        </button>
        <button className="btn" onClick={copyReceipt}>
          Copy dressing receipt
        </button>
        <a className="btn btn--ghost" href={`#/studio?c=${encodeSpec(card.spec)}`}>
          Edit the card
        </a>
        <span className="studio__status" role="status">
          {status}
        </span>
      </div>

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
            <dd>{reading.source ? `Idea ${reading.source.idea} · journal ${reading.source.event}` : <span className="muted">A sample: no source to cite</span>}</dd>
          </dl>
          {findings.length ? (
            <div className="lint">
              <span className="label">Card rules</span>
              <ul>
                {findings.map((f, i) => (
                  <li key={i} data-level={f.level}>
                    <strong>{f.level}</strong> {f.message} <em>{f.source}</em>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
                <Why lines={["Printed on the series' cream in its ink, so the back pairs with that series' fronts. Cream takes the light scheme."]} />
              </li>
            ) : null}
            {dressing.shapes.map((s) => (
              <li key={s.id} data-dropped={(s.prefer && placed.shapes[s.id] === null) || undefined}>
                <span className="label">Shape{s.prefer && placed.shapes[s.id] === null ? " · dropped, no room" : ""}</span>
                <strong>{shapeName(s.id)}</strong>
                <Why lines={s.why} />
              </li>
            ))}
          </ul>
          {dressing.skipped.length ? (
            <details className="backs__skipped">
              <summary className="label">Left in the catalog · {dressing.skipped.length}</summary>
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

        <section className="backs__check">
          <h2 className="jk-text-doc-h2">Check</h2>
          <span className="label">At 320px (Principle 4)</span>
          <ScaledBox canvas={canvas} width={320} label="Thumbnail of the dressed back">
            <DressedPostcard spec={card.spec} dressing={dressing} />
          </ScaledBox>
          <p className="muted">
            {dropped.length
              ? `${dropped.map((s) => shapeName(s.id)).join(", ")} found no free space and ${dropped.length > 1 ? "were" : "was"} left off.`
              : "Every shape found free space; nothing covers the content or the frame."}
          </p>
        </section>
      </div>

      <section className="backs__section">
        <h2 className="jk-text-doc-h2">Every template, dressed</h2>
        <p className="muted">First takes in the card's own scheme. Each one is read from its own JSON.</p>
        <div className="card-grid">
          {gallery.map((g) => (
            <article key={g.id} className="card-tile">
              <a href={`#/backs?card=${g.id}`} aria-label={`Open ${g.name}`}>
                <ScaledBox canvas={CANVAS[g.spec.ratio ?? "16:9"]} label={`${g.name}, dressed`}>
                  <DressedPostcard spec={g.spec} dressing={g.dressing} />
                </ScaledBox>
              </a>
              <div className="card-tile__meta">
                <div>
                  <h3 className="jk-text-doc-h2">{g.name}</h3>
                  <p className="muted">
                    {shapeName(g.dressing.texture.id)} · {g.dressing.shapes.map((s) => shapeName(s.id)).join(" · ")}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="backs__section">
        <h2 className="jk-text-doc-h2">The stock catalog</h2>
        <p className="muted">
          Everything a back can be dressed with. All of it is drawn in code on the card's own roles, or taken from a press
          this repo owns, so every piece is ours to print. Tags are what the picker matches against the reading.
        </p>
        <div className="backs__catalog">
          {CATALOG.map((c) => (
            <article key={c.id}>
              {c.kind !== "shape" ? <Swatch entry={c} scheme={pageScheme} /> : null}
              <span className="label">{c.kind}{c.weight ? ` · weight ${c.weight}` : ""}</span>
              <strong>{c.name}</strong>
              <p>{c.look}</p>
              {c.tags.length ? <p className="backs__tags">{c.tags.join("  ")}</p> : null}
              {c.needs ? <p className="muted">Needs: {c.needs.join(", ")}</p> : null}
              {c.artwork?.map((a) => (
                <p key={a.text} className="muted">
                  Prints “{a.text}”: {a.from}
                </p>
              ))}
              <p className="muted">{c.source}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
