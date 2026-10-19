# JKidd DS · code

The Jefferson Kidd design system in code: tokens, marks, the constant card frame and the six postcard archetypes, built from the Figma library **JKidd - Foundations** (formerly JKidd - DS; [`ADhu9noVbgFbtapMZivOHw`](https://www.figma.com/design/ADhu9noVbgFbtapMZivOHw/JKidd---Foundations)), v0.1, 2026-09-24.

A card is data. Write the frame settings and one archetype's content as JSON, render it in the constant frame, check it against the card rules, and export it at canvas size for Postiz.

```
pnpm install
pnpm dev        # demo on http://localhost:5178, links on :5179 (runs pnpm tokens first)
pnpm check      # tokens → contrast audit → tests → typecheck → build
```

React 19 + Vite 8 + TypeScript, pnpm. Same stack as Tibbie X, without Tailwind: every style reads a CSS variable generated from the token JSON.

---

## What's in it

Four packages in a pnpm workspace, stacked like the Figma libraries. Each uses only the ones above it in this table, and `scripts/layers.test.mjs` fails the build if one reaches up.

| Package | What | Figma library |
|---|---|---|
| `@jkidd/tokens` · `packages/tokens/` | The variables. `sources/*.json` (the palette export, post types, layout, canvases, fonts, text styles, contrast waivers) → `pnpm tokens` → `src/tokens.css` + `src/tokens.gen.ts`. Also the contrast check and its tests | JKidd - Foundations |
| `@jkidd/core` · `packages/core/` | Framework-free: the Figma node map and library keys (`src/figma.ts`), the stick-figure rig, contrast math, the export helper. `vendor/architects-notebook/` holds what `pnpm notebook` copies from the kit, with `SOURCE.json`. Never edit it by hand | — |
| `@jkidd/ui` · `packages/ui/` | **JKidd UI**: the component library, the React components beside their CSS, in folders named for the libraries (`foundations/`, `primitives/`, `compositions/`): marks, card parts, the dressing shapes, stick figure, card frame, the six archetypes. Importing it loads the CSS (alone: `@jkidd/ui/styles.css`); the fonts are `@jkidd/ui/fonts` (`fonts/`, `src/fonts.ts`). Needs `@jkidd/tokens/tokens.css` first | Foundations, Primitives, Compositions |
| `@jkidd/blocks` · `packages/blocks/` | **JK Blocks**: finished things. Postcard (the archetypes), the picture and stage postcards, the link page, sample copy and art | JKidd - Blocks |
| `apps/site/` | The demo site and the postcard makers. `src/ds.ts` re-exports all four packages for the pages | — |

The Figma library keys are `LIBRARIES` in `packages/core/src/figma.ts`. The three libraries split out of JKidd - Foundations (Primitives, Compositions, Blocks; a fourth, Layout, was merged into Compositions on 2026-10-19) start empty and fill as components are moved across in Figma. Until a component moves, its node ID still points into JKidd - Foundations.

### Components → Figma nodes

Every component renders `data-figma="<node id>"` on its root, so you can inspect an element and jump to its source. The full map is `packages/core/src/figma.ts`.

| Component | Node | Notes |
|---|---|---|
| `Monogram` | `7:20` | tone brand / ink / outline × size L / M / S. Placeholder |
| `Wordmark` | `7:27` | inline / stacked. Placeholder |
| `HandleLockup`, `ProjectMark` | `7:30`, `7:28` | `project={null}` hides the slot (decision 3a) |
| `CardFrame` | `8:60` | ratio 16:9 / 1:1 / 4:5, `postType`, `scheme`, `day`, `series`, `project` |
| `Kicker` | `9:3` | Empty by default: reads the type's label from CSS (`content: var(--jk-type-label)`), like the Figma text bound to `type/label` |
| `CheckRow` | `9:24` | mark check / cross / dot × struck. The strike is its own layer, not `text-decoration` |
| `TokenChip`, `Arrow`, `EqualsBadge`, `Terminal`, `Zone` | `9:25`, `9:28`, `9:33`, `9:35`, `9:38` | `Arrow` uses the Figma SVG asset as a mask, so it takes `type/ink` in every mode |
| `Manifesto`, `ArchitectureDiagram`, `Pipeline`, `Parity`, `BeforeAfter`, `Ledger` | `11:3` … `11:123` | Content components; each takes plain data |
| `Postcard` + `SAMPLES` | `11:184` … `11:397` | Frame + archetype from one `CardSpec`; the six Postcard/* samples as data |

### How theming works

Two attributes on the card root do what the Figma instance's modes do:

```html
<div class="jk-card" data-scheme="dark" data-post-type="decision">
```

- `data-scheme` sets the 49 `--md-sys-color-*` roles (six modes: light, dark and their medium- and high-contrast variants).
- `data-post-type` sets `--jk-type-accent`, `--jk-type-ink`, `--jk-type-on-accent` and `--jk-type-label` as **aliases of scheme roles**, so a type recolours with the scheme. They're redeclared under any nested `[data-scheme]`, so they resolve against the nearest scheme.

Cards are drawn at their Figma canvas size (1600×900, 1080×1080, 1080×1350) and scaled with a transform, never reflowed. A card at 320px is the same card, smaller.

---

## The Studio

`#/studio` builds one card from data:

- archetype, post type, scheme, ratio, day, series, project slot, and the content as JSON
- a live preview, plus the same card at **320px** (Principle 4: design full size, judge at thumbnail)
- **card rules**: the rules from `POSTCARDS.md` and the Figma component descriptions, run as checks on every edit (`apps/site/src/app/lint.ts`). Manifesto 3–5 lines, Ledger 6 rows at most and uneven lengths, Pipeline highlights exactly one line, Before / After at equal weight, one arrow per diagram, day and series together or not at all, archetype vs. its best-for types
- **Export PNG** at canvas size (or @2x), named `jkidd-day-18-manifesto-principle-16x9.png`
- **Copy JSON** (the `CardSpec`, ready for a post file) and **Copy link** (the card encoded in the URL)

Every card on the Archetypes page has an **Edit** link that opens it in the Studio.

---

## Picture postcards

A postcard comes in two types: the archetype cards above, and the picture postcard. `#/postcards` makes the picture one: a front generated under the production spec (`packages/blocks/src/postcards/front-spec.md`, verbatim from Workbench `147:933`), set in a cream mat with an ink border, with live type on top. The type is a location ribbon, a story label tilted 2°, and a title when the front has no lettering of its own. The ribbon sits under the title, or over the label when there's no title, so it never covers the front's own letters. It replaces the illustrated and cartoon postcards: the mat, border, title and story pieces are the illustrated set's, and the fronts, inks and stick figure are the cartoon one's. The five illustrated scenes are gone. Their stories stay as starters (`STORY_STARTERS`).

### Making one

1. **Series master.** Pick a front from the gallery. Lettered fronts carry their own title. Art-only fronts (the desert) turn the live title on, and it reads "Jefferson Kidd" until you change it.
2. **Story.** Type it, or pick a starter. Turn on **Print the story on the card** to set the label and ribbon, then choose one of the series' ribbon inks and the corner the hero isn't in.
3. **Copy prompt**, then **Download master**, and send both to ChatGPT's image model, which drew the existing fronts. The spec is that ChatGPT conversation about consistency, distilled into one document; a different model is the easiest way for a front to drift. Only the narrative changes: the theme, scenery, props, the story told through the scene, and the icons inside the letters. **Use your front** loads what comes back, and **Next to the master** walks the spec's checklist.
4. **Export PNG** (1536×1024, or @2x), or **Export video** with the stick figure.

### Series

Fronts come in series. A series is one press: a master, the fronts drawn from it, and the inks read off them. The registry is `SERIES` in `packages/blocks/src/postcards/fronts.ts`, and each front names its series. The card takes its series' ink, cream and ribbons (`--jk-genre-picture-<series>-*`); the mat is the same on every series (`--jk-genre-picture-mat`). The maker shows only the series' own ribbons, and the gallery is grouped by series. A front in a series' theme but printed in other inks is marked `drifted` (Frontier Town, in Western): it's left out of the ink sample until it's regenerated from the master.

**Adding a front or a series**

1. `pnpm front <master.png> <id>` trims and crops the delivered image into `packages/blocks/src/assets/fronts/` (`front-intake.mjs`).
2. Add it to `FRONTS` with its `series`, and to `SERIES` if the series is new.
3. `pnpm front-inks <fronts…>` reads the series' inks off its on-press fronts (`front-inks.mjs`, nothing to install). It prints a proposal; copy `colors` and `ribbons` into `genres.picture-<series>` in `packages/tokens/sources/jkidd.tokens.json`, then run `pnpm check`. Every ribbon it proposes passes 4.5:1, and `pnpm contrast` checks them again.

---

## Stage postcards

`#/stage` makes a postcard of a theatre stage drawn on graph paper over the card stock, in the Architect's Notebook hand, with stick figures walking, running or waving at three depths. It's a draft in code: not in Workbench or the library yet.

### Making one

1. **Story.** Type it, or pick a starter (`STORY_STARTERS`, the library's own copy). It's set in the title strip in Special Elite Even, uppercase; past 40 characters it drops from 40px to 28px so it still fits.
2. **Location.** The middle cell of the title strip.
3. **Cast the depths.** Each depth takes one figure: *Empty*, *Walks right*, *Walks left*, *Runs right*, *Runs left* or *Waves on the mark*. Walkers and runners enter from behind the wing at their own depth and leave behind the other; a waving figure stands on a red-pen X (upstage at 30% across, midstage 68%, downstage the centre).
4. **Line.** *Boil* redraws the line every drawing, the kit's hand-drawn shimmer. *Still* keeps one line and only moves the pose.
5. **Play** runs the figures at 12 drawings a second. It starts paused if your system asks for reduced motion.
6. **Judge it at 320px** in the thumbnail under the preview, then **Export PNG** (1536×1024, or @2x). Or **SVG**: a standalone vector file for Figma or Illustrator, with every colour resolved from the tokens, the graph paper as lines over the card stock (embedded, so the file stands alone; about 1.8 MB) and the title strip as text (the fonts aren't embedded, so install Special Elite Even and JetBrains Mono to see them). Both are the frame on screen: pause on the pose you want first.

There's no video export on this page yet; the picture postcards have one.

### The squares

The paper is the measuring stick. One square is 32px, ruled heavier every 4 (128px), and every figure is a whole number of squares tall, head to feet:

| Depth | Figure | Feet on | Floor between |
|---|---|---|---|
| Downstage | 8 squares (256px) | y 832 | x 192–1344, wings are the proscenium piers |
| Midstage | 6 squares (192px) | y 704 | x 336–1200 |
| Upstage | 4 squares (128px) | y 576 | x 480–1056 |
| Back wall | 3 squares (96px) | y 512 | x 552–984 |

It all comes from one rule. The camera is two figures high, so a figure *H* px tall stands on *y = 320 + 2H*, where 320 is the horizon, and the floor narrows toward a vanishing point at x 768. Anything you add, like a prop or a new mark, sizes the same way: decide how many squares tall it is at its depth, and its feet go on that depth's line. On the card, each depth has dashed blueprint tape on its feet line, a label (`MIDSTAGE · 6 SQ`) and a blue height bar with its count.

What's drawn, back to front: paper and grid; back wall, floor boards and apron; then for each depth from upstage to downstage, that depth's figures and then its wings (so a figure is hidden until it clears its own wing); then the sheet border, the height bars and the title strip.

### In code

```tsx
import { StagePostcard, type StageSpec } from "./ds";

const spec: StageSpec = {
  story: "THE PARADE THAT TOOK A WRONG TURN",
  location: "EDO • KITES OVER NIHONBASHI",
  line: "boil",
  actors: [
    { depth: "up", cycle: "walk", dir: -1 },
    { depth: "mid", cycle: "wave", dir: 1, at: 0.68 },
    { depth: "down", cycle: "run", dir: 1, offset: 40 },
  ],
};

<StagePostcard spec={spec} drawing={drawing} />;
```

- `drawing` is the clock: a drawing number you advance 12 times a second (or hold still). Each actor's pose is a pure function of it, so the same number always draws the same frame.
- `depth` is `"up"`, `"mid"` or `"down"`. Any number of actors can share a depth.
- `cycle` is `"walk"`, `"run"` or `"wave"`; `dir` is `1` (right) or `-1` (left, drawn mirrored).
- `at` places a figure that doesn't travel, as a fraction of its depth's floor. `offset` starts an actor that many drawings ahead, so figures don't step in time.
- Geometry is exported as `STAGE` (each depth's squares, feet line, floor and wings), `STAGE_SQUARE` and `STAGE_CANVAS`, so other components can stand things on the same lines.
- Colours are the `stage` genre in `packages/tokens/sources/jkidd.tokens.json` (`--jk-genre-stage-*`): the Architect's Notebook light ink and paper. Line work is rough.js with the kit's pen settings and a fixed seed, so the stage draws identically every time.

Files: `packages/blocks/src/postcards/StagePostcard.tsx`, `stage.css`, `stageSvg.ts`, and the maker in `apps/site/src/app/pages/StagePage.tsx`.

## The stick figure

The figures are the Architect's Notebook kit's own animation loops (Figma *Architects Notebook*, Figures `37:2`), not redrawn here: walk, run and wave, 12 drawings each. The body moves by exactly what the planted foot sweeps back each drawing, so the feet never slide.

- **Where they come from.** `pnpm notebook` copies `dist/figure-frames.json` from `../architects-notebook` (or `NOTEBOOK_DIR`) into `packages/core/vendor/architects-notebook/`, rounding numbers to 2 places (357K → 121K) and recording the source's sha256 in `SOURCE.json`. To change how they move, regenerate in the kit (`npm run figures`), run `pnpm notebook` here, and review the diff. `packages/core/scripts/notebook.test.mjs` checks the shape.
- **Placing one.** `figurePose(spec, drawing, canvas, placement)` returns where a figure is and which paths to draw. Placement takes `height`, `floor` (y of the feet), `lane` (the span it crosses), `dir` and `at`. Use `figureBoxFor(px)` to make a figure *look* that many px tall head to feet, and `figureTransform(pose)` for the SVG transform.
- **Drawing one.** `<FigureStrokes pose={pose} />` inside any SVG draws a halo line under an ink line. The colours are `--figure-ink` and `--figure-halo`, which each genre sets from its own tokens. The pen is `FIGURE_PEN` (2.4, against the kit's 1.6, so it holds at postcard scale) and the halo is `FIGURE_HALO` wider.
- **On picture postcards** (`#/postcards`), one figure walks, runs or waves along the bottom of the picture, inside the ink border and behind the type, with a cream halo so it shows up on a busy picture. **5 · Export video** records one seamless take at 1536×1024, 24 fps: a full crossing for walk and run, four loops for wave. It saves MP4 where the browser can record it, otherwise WebM. Recording runs in real time, so keep the tab in front until it finishes.

---

## Contrast

`pnpm contrast` checks every post type in every scheme mode:

| Pair | Minimum | Why |
|---|---|---|
| ink / surface | 4.5 | kicker, arrow annotation, check marks are text |
| accent / surface | 3.0 | rail, tick, swatches are graphics that carry the type |
| on-accent / accent | 3.0 | Manifesto payoff and Parity specimen are large text |

**Result, 2026-09-24: 88 / 90 pass.** The two failures are the light scheme's Progress rail (`#01C6DE`, 1.97:1) and Decision rail (`#FFAE00`, 1.76:1) against the surface. Every dark and contrast mode passes, and the kicker text passes everywhere because it uses `type/ink`. The post type colours are provisional, so both are waived in `packages/tokens/sources/contrast-waivers.json` with the reason. The check fails on any new failure, and the tests fail if a waiver stops being needed.

---

## Staying in step with Figma

The token sources are written by hand, because they carry what Figma doesn't hold (font fallbacks, the reason for each choice, contrast waivers). What keeps them honest is a snapshot of Figma and a test that compares the two.

- **`packages/tokens/sources/figma/*.json`** are the snapshots, one per library (`foundations.json` is *JKidd - Foundations*; `primitives`, `layout`, `compositions`, `blocks` are the split libraries). Each holds the pages, every variable in every mode (with scopes, descriptions, IDs and keys), the text, effect, paint and grid styles with their bound variables and descriptions, every component and component set (size, properties, variant count, description), and each page's top-level frames. Committed, so `git diff` shows what changed in Figma. Don't edit them by hand.
- **`packages/tokens/scripts/figma/export.js`** writes it. It's read-only, and runs two ways: as a development plugin (in Figma, Plugins → Development → Import plugin from manifest, pick `packages/tokens/scripts/figma/manifest.json`, then run *JKidd Figma Snapshot* and download the file), or by asking Claude to refresh the snapshot through the Figma MCP. Figma's variables REST API needs an Enterprise plan, so the Plugin API is the way in.
- **`packages/tokens/scripts/figma-drift.test.mjs`** runs in `pnpm check`. It compares the snapshot with `jkidd.tokens.json` and `jkxo-tertiary.json` (palette, all scheme modes, post types, layout, fonts, text styles, shadows) and lists everything out of step. Fix the source, or waive the item in `packages/tokens/sources/figma-waivers.json` with a reason; a waiver that stops applying fails the test too.
- **`packages/core/scripts/figma-nodes.test.mjs`** checks every node ID in `packages/core/src/figma.ts` (`FIGMA_NODES`, `LINK_NODES`) is still a component, component set or top-level frame in its library's snapshot, so a deleted or moved node fails `pnpm check` instead of leaving a dead link.

So the loop is: change Figma → refresh the snapshot → `pnpm check` → fix the sources → `pnpm tokens`.

---

## Provisional, and not yet read into code

- **Type stack** (JKIDD.md decision 1): display is **Special Elite Even** (User, 2026-10-11), the repaired cut in `packages/ui/fonts/special-elite-repaired/` (its README tells the story: original outlines, fixed sidebearings and metrics). Inter is the body face for running text; JetBrains Mono remains the working mono. Two comic faces for short text: `--jk-font-lettering` is **CC Wild Words** (Comicraft, paid: it loads via `local()` where installed; **Anime Ace 2.0 BB** (Blambot, also `local()`, never bundled) letters next; after buying the webfont, put it in `packages/ui/fonts/` and add its `url()` in `packages/ui/fonts/fonts.css`), and `--jk-font-burst` is **Bangers** (OFL) for loud titles. Change `packages/tokens/sources/jkidd.tokens.json` → `fonts` and the font imports in `packages/ui/src/fonts.ts`. The Figma Type collection in JKidd - Foundations matches: `font/display` is Special Elite Even, `font/lettering` Anime Ace 2.0 BB and `font/burst` Bangers.
- **Post type colours**: provisional mapping to scheme roles, `packages/tokens/sources/jkidd.tokens.json` → `postTypes`.
- **Marks**: typeset placeholders until the real marks are designed.
- **Partly read into code:** 8 of the library's 15 text styles (`Card/Headline`, `Card/Title` and five `Doc/*` styles are missing) and 2 of its 34 Layout variables (the card rail and chrome inset; the rest are raw pixel values in `ds.css`, taken from the Figma nodes).
- **Texture** tokens: none defined in the library yet.

Sample copy on every card is the Figma library's own. Replace it with the real work before posting: content never invents.
