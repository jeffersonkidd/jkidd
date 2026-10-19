import { useState } from "react";
import { Arrow, CheckRow, EqualsBadge, Kicker, POST_TYPES, Terminal, TokenChip, Zone, type PostType, type RowMark } from "../../ds";
import { PageHeader, Segmented, cap } from "../components/Controls";
import type { PageProps } from "../App";

const MARKS: RowMark[] = ["check", "cross", "dot"];

/** Card Parts (Primitives 1:11), drawn at card scale and shrunk to fit the page. */
export function PartsPage(_: PageProps) {
  const [type, setType] = useState<PostType>("progress");
  return (
    <div className="page">
      <PageHeader eyebrow="Components · 03" title="Card parts">
        <p>
          The atoms the archetypes are built from, sized for the 1600px canvas. Colours read the Post Type tokens:{" "}
          <code>--jk-type-accent</code> for fills, <code>--jk-type-ink</code> for text and thin marks, so parts recolour
          with the card. Switch the type and watch them follow.
        </p>
      </PageHeader>
      <div className="sticky-controls">
        <Segmented label="Post type" value={type} options={POST_TYPES} onChange={setType} format={cap} />
      </div>

      <div className="parts-canvas" data-scheme="dark" data-post-type={type}>
        <div className="parts-canvas__inner">
          <figure>
            <Kicker />
            <figcaption className="label">Kicker · 65:62 · reads type/label</figcaption>
          </figure>

          <figure>
            <div className="parts-rows">
              {MARKS.flatMap((m) =>
                [false, true].map((s) => (
                  <CheckRow key={`${m}${s}`} mark={m} struck={s}>
                    {`Mark=${cap(m)}, Struck=${s ? "Yes" : "No"}`}
                  </CheckRow>
                )),
              )}
            </div>
            <figcaption className="label">Check Row · 65:65 · strike is its own layer</figcaption>
          </figure>

          <div className="parts-grid">
            <figure>
              <TokenChip>surface-container</TokenChip>
              <figcaption className="label">Token Chip · 65:86</figcaption>
            </figure>
            <figure>
              <Arrow>imports</Arrow>
              <figcaption className="label">Arrow · 65:89 · one per card</figcaption>
            </figure>
            <figure>
              <EqualsBadge />
              <figcaption className="label">Equals Badge · 65:94</figcaption>
            </figure>
            <figure>
              <Terminal>pnpm tokens</Terminal>
              <figcaption className="label">Terminal · 65:96 · the command that ran</figcaption>
            </figure>
            <figure>
              <Zone label="PRIMITIVES">
                <div style={{ height: 40 }} />
              </Zone>
              <figcaption className="label">Zone + Zone Label · 65:99</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
}
