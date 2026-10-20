# Dressing the back

The archetype card is the message side of the postcard. This workflow turns its JSON into a back made for that card. The Studio dresses every card it edits, under the default rendering, with the reading and the picks under **Why this dressing**; the catalog is on `#/stock`.

| Node | Where | What it does |
|---|---|---|
| Intake | `CardSpec` (+ `CardSource` from a template) | The card as data. A template also brings its idea-bank row and journal event. The back is printed on **paper** (the card stock, light scheme) or the **palm sky** (Imagery/Palm Sky under a 75% wash of the dark surface, dark scheme, no series inks) |
| Lint | `apps/studio/src/app/lint.ts` | The POSTCARDS.md rules. Dressing never covers for a card that fails them |
| Read | `read.ts` | Tone, topics, figures, a verdict word, the arrows' verbs, each with its JSON path |
| Pick | `pick.ts` + `catalog.ts` | Scores the stock catalog against the reading. Seeded, budgeted (3), every pick with its reasons |
| Place | `place.ts`, measured in `DressedPostcard.tsx` | Finds each shape the free space nearest its spot, shrinking to 0.8 or 0.64 before dropping it |
| Check | `scripts/back.test.mjs`, the Studio | Thumbnail at 320px, dropped shapes, 4.5:1 on every series' cream |
| Export | Studio | PNG at canvas size, plus the **dressing receipt** (spec + dressing + placements) |

## Rules it holds (tested)

- **Dressing never writes.** Everything a shape prints is the card's own text, found at a JSON path, or catalog artwork with its source (the 2¢ from Entry 001-C).
- **The frame never moves.** The plain `Postcard` renders untouched. Textures lie under it, overlays sit faintly over it, and shapes go only in measured free space: inside a zone or outside it, never across a zone's edge.
- **Same card, same back.** The seed is the card's JSON plus the take number.
- **One idea per card applies to the dressing too.** The ornament budget is 3. The stamp comes first, then the card's verdict, then its citation.
- **Every catalog element has a source and a license.** Today everything is drawn in code or comes from our own press.

## Open calls

- **Which icon marks which type.** The stamps use Entry 001-C's icons in the charter's type order (progress flag, decision signpost, failure skull, principle sun, teaching bell). The charter says the pairing isn't recorded.
- **The word "back".** POSTCARDS.md §4 says neither postcard type is the other's back. This workflow calls the archetype card's message side "the back".
