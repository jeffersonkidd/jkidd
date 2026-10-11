# JKidd DS · code

The Jefferson Kidd design system in code: tokens, marks, the constant card frame and the six postcard archetypes, built from the Figma library **JKidd - DS** ([`ADhu9noVbgFbtapMZivOHw`](https://www.figma.com/design/ADhu9noVbgFbtapMZivOHw/JKidd---DS)), v0.1, 2026-09-24.

A card is data. Write the frame settings and one archetype's content as JSON, render it in the constant frame, check it against the card rules, and export it at canvas size for Postiz.

```
pnpm install
pnpm dev        # http://localhost:5178 (runs pnpm tokens first)
pnpm check      # tokens → contrast audit → tests → typecheck → build
```

React 19 + Vite 8 + TypeScript, pnpm. Same stack as Tibbie X, without Tailwind: every style reads a CSS variable generated from the token JSON.

---

## What's in it

| Path | What | From Figma |
|---|---|---|
| `tokens/jkxo-tertiary.json` | The palette: Material Theme Builder export, seed `#01C6DE`, amber `#FFAE00` tertiary. 5 tonal palettes, 6 scheme modes × 49 roles | Palette, Scheme collections |
| `tokens/jkidd.tokens.json` | Post types (→ scheme roles), layout, canvas sizes, fonts, text styles | Post Type, Layout, Type collections; text styles |
| `tokens/contrast-waivers.json` | Known contrast failures, each with a reason. See *Contrast* below | — |
| `scripts/build-tokens.mjs` | `pnpm tokens`: JSON → `src/styles/tokens.css` + `src/ds/tokens.gen.ts` | — |
| `scripts/check-contrast.mjs` | `pnpm contrast`: every post type × every scheme mode against WCAG | — |
| `scripts/tokens.test.mjs` | `pnpm test`: counts match the library, roles exist, CSS is in step, waivers aren't stale | — |
| `src/ds/` | The library. `import { Postcard, SAMPLES } from "./ds"` | Pages Marks, Frame, Card Parts, Archetypes |
| `src/app/` | The demo site: Overview, Foundations, Marks, Card parts, Archetypes, Thumbnail test, Studio | Cover page |

### Components → Figma nodes

Every component renders `data-figma="<node id>"` on its root, so you can inspect an element and jump to its source. The full map is `src/ds/figma.ts`.

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
- **card rules**: the rules from `POSTCARDS.md` and the Figma component descriptions, run as checks on every edit (`src/app/lint.ts`). Manifesto 3–5 lines, Ledger 6 rows at most and uneven lengths, Pipeline highlights exactly one line, Before / After at equal weight, one arrow per diagram, day and series together or not at all, archetype vs. its best-for types
- **Export PNG** at canvas size (or @2x), named `jkidd-day-18-manifesto-principle-16x9.png`
- **Copy JSON** (the `CardSpec`, ready for a post file) and **Copy link** (the card encoded in the URL)

Every card on the Archetypes page has an **Edit** link that opens it in the Studio.

---

## Contrast

`pnpm contrast` checks every post type in every scheme mode:

| Pair | Minimum | Why |
|---|---|---|
| ink / surface | 4.5 | kicker, arrow annotation, check marks are text |
| accent / surface | 3.0 | rail, tick, swatches are graphics that carry the type |
| on-accent / accent | 3.0 | Manifesto payoff and Parity specimen are large text |

**Result, 2026-09-24: 88 / 90 pass.** The two failures are the light scheme's Progress rail (`#01C6DE`, 1.97:1) and Decision rail (`#FFAE00`, 1.76:1) against the surface. Every dark and contrast mode passes, and the kicker text passes everywhere because it uses `type/ink`. The post type colours are provisional, so both are waived in `tokens/contrast-waivers.json` with the reason. The check fails on any new failure, and the tests fail if a waiver stops being needed.

---

## Provisional, and not yet read into code

- **Type stack** (JKIDD.md decision 1): display is **Special Elite Even** (User, 2026-10-11), the repaired cut in `fonts/special-elite-repaired/` (its README tells the story: original outlines, fixed sidebearings and metrics). Inter is the body face for running text; JetBrains Mono remains the working mono. Two comic faces for short text: `--jk-font-lettering` is **CC Wild Words** (Comicraft, paid: it loads via `local()` where installed; **Anime Ace 2.0 BB** (Blambot, also `local()`, never bundled) letters next, and **Comic Neue** stands in where neither is installed; after buying the webfont, put it in `fonts/` and add its `url()` in `fonts/fonts.css`), and `--jk-font-burst` is **Bangers** (OFL) for loud titles. Change `tokens/jkidd.tokens.json` → `fonts` and the font imports in `src/main.tsx`. The JKidd - DS Figma library still uses Space Grotesk; the Workbench file already uses Special Elite Even.
- **Post type colours**: provisional mapping to scheme roles, `tokens/jkidd.tokens.json` → `postTypes`.
- **Marks**: typeset placeholders until the real marks are designed.
- **Partly read into code:** 8 of the library's 15 text styles (`Card/Headline`, `Card/Title` and five `Doc/*` styles are missing) and 2 of its 34 Layout variables (the card rail and chrome inset; the rest are raw pixel values in `ds.css`, taken from the Figma nodes).
- **Texture** tokens: none defined in the library yet.

Sample copy on every card is the Figma library's own. Replace it with the real work before posting: content never invents.
