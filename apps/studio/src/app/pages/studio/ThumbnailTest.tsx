import { useEffect, useRef } from "react";
import { ARCHETYPES, POST_TYPES, SAMPLE_LIST, type CardSpec, type PostType } from "../../../ds";
import { cap } from "../../components/Controls";
import { ScaledCard } from "../../components/ScaledCard";

/** The card being edited in all five post types at 320px; picking one sets the card's type. */
export function TypeRow({ spec, onPick }: { spec: CardSpec; onPick: (postType: PostType) => void }) {
  return (
    <div className="studio__types">
      <span className="label">In every post type, at 320px · can you name the type from the rail?</span>
      <div className="picker__strip">
        {POST_TYPES.map((t) => (
          <button key={t} type="button" className="picker__tile picker__tile--320" aria-pressed={t === spec.postType} onClick={() => onPick(t)}>
            <ScaledCard spec={{ ...spec, postType: t }} width={320} label={`${ARCHETYPES[spec.archetype].name}, ${cap(t)}`} />
            <span>{cap(t)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Principle 4: design full size, judge at thumbnail. Every archetype × every post type at 320px,
 * in the Studio's scheme and ratio. `#/thumbnails` lands here, open.
 */
export function ThumbnailTest({ frame, open }: { frame: CardSpec; open: boolean }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    // Wait for the fonts and the scaled cards above to take their height, or the scroll lands short.
    if (open) document.fonts.ready.then(() => requestAnimationFrame(() => ref.current?.scrollIntoView({ block: "start" })));
  }, [open]);
  const { scheme, ratio } = frame;
  return (
    <details ref={ref} id="thumbnails" className="studio__thumbtest" open={open || undefined}>
      <summary>
        <h2 className="jk-text-doc-h2">The thumbnail test</h2>
        <span className="muted">
          Design full size, judge at thumbnail. This is how most of the feed sees a card: 320px wide. Each row is one
          archetype in all five post types, in the scheme and ratio above. You should be able to name the type from the
          rail before you read a word.
        </span>
      </summary>
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
              <ScaledCard key={t} width={320} spec={{ ...s, postType: t, scheme, ratio }} label={`${ARCHETYPES[s.archetype].name}, ${cap(t)}`} />
            ))}
          </div>
        ))}
      </div>
    </details>
  );
}
