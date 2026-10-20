import { CATALOG, backVars, type CatalogEntry } from "../../ds";
import { PageHeader } from "../components/Controls";
import type { PageProps } from "../App";

/** A texture or overlay on a strip of card stock, in the back's light scheme. */
function Swatch({ entry }: { entry: CatalogEntry }) {
  const attrs = entry.kind === "texture" ? { "data-texture": entry.id } : { "data-texture": "none", "data-overlays": entry.id };
  return (
    <div className="jk-back backs__swatch" data-scheme="light" data-post-type="progress" style={backVars(7)} {...attrs}>
      <div className="jk-card">
        <span />
      </div>
    </div>
  );
}

/** Everything the Studio can dress a back with. */
export function StockPage(_: PageProps) {
  return (
    <div className="page page--wide">
      <PageHeader eyebrow="Creator OS" title="The stock catalog">
        <p>
          Everything a back can be dressed with. All of it is drawn in code on the card's own roles, or taken from a press
          this repo owns, so every piece is ours to print. Tags are what the picker matches against the reading. Dress a
          card in the <a href="#/studio">Studio</a>.
        </p>
      </PageHeader>
      <div className="backs__catalog">
        {CATALOG.map((c) => (
          <article key={c.id}>
            {c.kind !== "shape" ? <Swatch entry={c} /> : null}
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
    </div>
  );
}
