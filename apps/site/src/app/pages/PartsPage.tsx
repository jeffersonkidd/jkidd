import { useState } from "react";
import { Arrow, CheckRow, EqualsBadge, Kicker, POST_TYPES, Terminal, TokenChip, Zone, type PostType, type RowMark } from "../../ds";
import { PageHeader, Segmented, cap } from "../components/Controls";
import type { PageProps } from "../App";

const MARKS: RowMark[] = ["check", "cross", "dot"];

/** Card Parts (9:2), drawn at card scale and shrunk to fit the page. */
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
            <figcaption className="label">Kicker · 9:3 · reads type/label</figcaption>
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
            <figcaption className="label">Check Row · 9:24 · strike is its own layer</figcaption>
          </figure>

          <div className="parts-grid">
            <figure>
              <TokenChip>surface-container</TokenChip>
              <figcaption className="label">Token Chip · 9:25</figcaption>
            </figure>
            <figure>
              <Arrow>imports</Arrow>
              <figcaption className="label">Arrow · 9:28 · one per card</figcaption>
            </figure>
            <figure>
              <EqualsBadge />
              <figcaption className="label">Equals Badge · 9:33</figcaption>
            </figure>
            <figure>
              <Terminal>pnpm tokens</Terminal>
              <figcaption className="label">Terminal · 9:35 · the command that ran</figcaption>
            </figure>
            <figure>
              <Zone label="PRIMITIVES">
                <div style={{ height: 40 }} />
              </Zone>
              <figcaption className="label">Zone + Zone Label · 9:38</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
}
