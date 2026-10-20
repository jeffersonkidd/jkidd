# CLAUDE.md

Jefferson Kidd design system in code, built from the Figma libraries: *JKidd - Foundations* (`ADhu9noVbgFbtapMZivOHw`, formerly *JKidd - DS*) and the three split out of it (Primitives, Compositions, Blocks; keys in `packages/core/src/figma.ts`). The charter and the rules it implements live in the Workbench: `~/Desktop/Workbench/projects/jkidd/` (`JKIDD.md`, `content/POSTCARDS.md`, `content/CONTENT-SYSTEM.md`).

## Commands

- `pnpm dev`: the Studio (`apps/studio`) on :5178 and the link-in-bio site on :5179 (regenerates tokens first)
- `pnpm links`: the link-in-bio site alone on :5179
- `pnpm check`: tokens → contrast → tests → typecheck → build. Run it before calling a change done.

## Docs

- `docs/MANUAL.md`: how to run this repo, a lesson per task (outline; lessons written one at a time).
- `docs/CLIENT-GUIDES.md`: teaching clients to run what we build for them. The first guide is Tibbie X's, in `~/Desktop/tibbiex/docs/guide/`.

## Packages

A pnpm workspace, layered like the Figma libraries: `@jkidd/tokens` → `@jkidd/core` → `@jkidd/ui` (JKidd UI: the React components with their CSS) → `@jkidd/blocks` (JK Blocks), plus two apps that consume them through `workspace:*`: the Studio in `apps/studio` and the link-in-bio site in `apps/links`, which renders the Link Page block from `@jkidd/blocks/web` and keeps its live copy (hrefs) in `apps/links/src/links.ts`. A package imports only the layers before it and declares them in its `package.json`; `scripts/layers.test.mjs` enforces this. Across the layers run two lanes: **cards** (drawn at the Figma canvas size and scaled) and **web** (drawn at web size and reflowed). In `ui` they are `src/cards/` and `src/web/`, imported as `@jkidd/ui/cards` and `@jkidd/ui/web` (no bare `@jkidd/ui` or `@jkidd/blocks`); `blocks` splits the same way, `src/cards/` and `src/web/` as `@jkidd/blocks/cards` and `@jkidd/blocks/web` (each web block in its own folder, like `web/link/`), with the fronts in `src/assets/` shared by both. A lane never imports the other (`scripts/layers.test.mjs` again). The Studio makes cards and re-exports only that lane; it shows the web lane only in the link page demo. Inside each lane, folders are named for the Figma library a piece lives in (`foundations/`, `primitives/`, `compositions/`): when a component moves library in Figma, move its code to match. The fonts (`@jkidd/ui/fonts`) and the Foundations imagery (`@jkidd/ui/imagery/<file>`: the palm sky, the card stock, the portrait, the press) are shared too.

## Rules

- Tokens flow one way: `packages/tokens/sources/*.json` → `pnpm tokens` → `packages/tokens/src/tokens.css` and `src/tokens.gen.ts`. Never edit the generated files.
- `packages/tokens/sources/figma/*.json` are snapshots of the Figma libraries (checked by the tokens drift test and `packages/core/scripts/figma-nodes.test.mjs`), written by `packages/tokens/scripts/figma/export.js` (dev plugin, or run through the Figma MCP; returns over 20KB need splitting by collection). Never hand-edit them. Drift from them gets fixed in the sources, or waived in `sources/figma-waivers.json` with a reason the user agreed to.
- The emblem flows one way too: `packages/core/vendor/emblem/emblem.source.svg` (the master, as exported) → `pnpm emblem` → `emblem.json` and the apps' `public/` icons. Never edit those; replace the master and rerun.
- The card stock flows one way too: `packages/ui/vendor/stock/paper.source.jpg` (the 3:2 master) → `pnpm stock` → `packages/ui/src/imagery/stock/paper-*.jpg`, one per shape. Never edit those; replace the master and rerun.
- Components read CSS variables only. No hex values in `packages/ui` or `packages/blocks`.
- Cards keep their Figma canvas size and are scaled, not reflowed.
- A card rule from `POSTCARDS.md` belongs in `apps/studio/src/app/lint.ts`, with its source.
- New contrast failures get fixed, or waived in `packages/tokens/sources/contrast-waivers.json` with a reason the user agreed to.
- Keep `data-figma` node IDs in step with the libraries (`packages/core/src/figma.ts`).
- Sample copy is the library's own. Content never invents.
