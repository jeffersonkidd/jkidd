import { useState } from "react";
import { ARCHETYPES, POST_TYPES, SAMPLE_LIST, SCHEMES, type Scheme } from "../../ds";
import { PageHeader, Select, cap } from "../components/Controls";
import { ScaledCard } from "../components/ScaledCard";
import type { PageProps } from "../App";

/** Principle 4: design full size, judge at thumbnail. Every archetype × every type at 320px. */
export function Thumbnails(_: PageProps) {
  const [scheme, setScheme] = useState<Scheme>("dark");
  return (
    <div className="page page--wide">
      <PageHeader eyebrow="Principle 4" title="The thumbnail test">
        <p>
          Design full size, judge at thumbnail. This is how most of the feed sees a card: 320px wide. Each row is one
          archetype in all five post types. You should be able to name the type from the rail before you read a word.
        </p>
      </PageHeader>
      <div className="sticky-controls">
        <Select label="Card scheme" value={scheme} options={SCHEMES} onChange={setScheme} />
      </div>
      <div className="thumb-matrix">
        <div className="thumb-matrix__head" aria-hidden>
          <span />
          {POST_TYPES.map((t) => (
            <span key={t} className="label" data-post-type={t}>
              <i className="dot" /> {t}
            </span>
          ))}
        </div>
        {SAMPLE_LIST.map((s) => (
          <div key={s.archetype} className="thumb-matrix__row">
            <span className="label thumb-matrix__name">{ARCHETYPES[s.archetype].name}</span>
            {POST_TYPES.map((t) => (
              <ScaledCard
                key={t}
                width={320}
                spec={{ ...s, postType: t, scheme }}
                label={`${ARCHETYPES[s.archetype].name}, ${cap(t)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
