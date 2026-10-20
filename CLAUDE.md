# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Jefferson Kidd design system in code, built from the Figma libraries: *JKidd - Foundations* (`ADhu9noVbgFbtapMZivOHw`, formerly *JKidd - DS*) and one file per lane over it, *JKidd - Postcards* (formerly Compositions) and *JKidd - Web* (keys in `packages/core/src/figma.ts`). *JKidd - Blocks* was emptied into them and deleted 2026-10-20; *JKidd - Primitives* is being emptied (Icons into Foundations) and goes once it is. The charter and the rules it implements live in the Workbench: `~/Desktop/Workbench/projects/jkidd/` (`JKIDD.md`, `content/POSTCARDS.md`, `content/CONTENT-SYSTEM.md`).

## Commands

- `pnpm dev`: the Studio (`apps/studio`) on :5178 and the link-in-bio site on :5179 (regenerates tokens first)
- `pnpm links`: the link-in-bio site alone on :5179
- `pnpm check`: tokens → contrast → tests → typecheck → both builds. Run it before calling a change done.
- `pnpm test`: every `scripts/*.test.mjs` and `packages/*/scripts/*.test.mjs` (plain `node --test`, no runner). One file: `node --test packages/core/scripts/figma-nodes.test.mjs`; one test: add `--test-name-pattern "<name>"`.
- `pnpm tokens`, `pnpm contrast`, `pnpm typecheck`: the steps of `check` on their own.
- Asset pipelines (each one-way, see Rules): `pnpm emblem`, `pnpm stock`, `pnpm notebook` (copies the stick-figure loops and shapes from `../architects-notebook` or `NOTEBOOK_DIR`), `pnpm front <master.png> <id>` (a new picture postcard front) and `pnpm front-inks <fronts…>` (proposes a series' inks for `jkidd.tokens.json`).

## Docs

- `docs/MANUAL.md`: how to run this repo, a lesson per task (outline; lessons written one at a time).
- `docs/CLIENT-GUIDES.md`: teaching clients to run what we build for them. The first guide is Tibbie X's, in `~/Desktop/tibbiex/docs/guide/`.

## Packages

A pnpm workspace, in layers: `@jkidd/tokens` → `@jkidd/core` → `@jkidd/ui` (JKidd UI: the React components with their CSS) → `@jkidd/blocks` (JK Blocks), plus two apps that consume them through `workspace:*`: the Studio in `apps/studio` and the link-in-bio site in `apps/links`, which renders the Link Page block from `@jkidd/blocks/web` and keeps its live copy (hrefs) in `apps/links/src/links.ts`. A package imports only the layers before it and declares them in its `package.json`; `scripts/layers.test.mjs` enforces this. Across the layers run two lanes: **postcards** (drawn at the Figma canvas size and scaled) and **web** (drawn at web size and reflowed). In `ui` they are `src/postcards/` and `src/web/`, imported as `@jkidd/ui/postcards` and `@jkidd/ui/web` (no bare `@jkidd/ui` or `@jkidd/blocks`); `blocks` splits the same way, `src/postcards/` and `src/web/` as `@jkidd/blocks/postcards` and `@jkidd/blocks/web` (each web block in its own folder, like `web/link/`), with the fronts in `src/assets/` shared by both. A lane never imports the other (`scripts/layers.test.mjs` again). The Studio makes cards and re-exports only that lane; it shows the web lane only in the link page demo. The lanes are the Figma files: postcards in *JKidd - Postcards*, web in *JKidd - Web*, both using *JKidd - Foundations* and never each other. Inside a `ui` lane the components sit flat, one file each beside its CSS. The fonts (`@jkidd/ui/fonts`) and the Foundations imagery (`@jkidd/ui/imagery/<file>`: the card stocks, paper and palm sky, the portrait, the press) are shared too.

## How a card works

- **A card is data.** A `CardSpec` (frame settings plus one archetype's content) renders as `Postcard` in the constant `CardFrame`; the samples and templates are `packages/blocks/src/postcards/samples.ts` and `templates.ts`. The Studio (`#/studio`, routes in `apps/studio/src/app/App.tsx`, pages in `app/pages/`) edits the spec, lints it (`lint.ts`), and exports PNG or editable SVG (`vectorSvg` in `@jkidd/core`).
- **Theming is two attributes on the card root**, mirroring the Figma modes: `data-scheme` sets the `--md-sys-color-*` roles, and `data-post-type` sets `--jk-type-accent`, `-ink`, `-on-accent` and `-label` as aliases of those roles (the Post Type collection in Foundations), so a type recolours with its scheme.
- **The back is dressed** by `packages/blocks/src/postcards/back/` (read → pick from the stock catalog → place; `WORKFLOW.md` there).
- **Picture postcards** take their inks from their series (`SERIES` in `packages/blocks/src/postcards/fronts.ts`, tokens `--jk-genre-picture-<series>-*`); the image spec is `front-spec.md` beside it.
- **Staying in step with Figma**: change Figma → refresh the snapshot (`export.js`, below) → `pnpm check` → fix the sources → `pnpm tokens`.

## Rules

- Tokens flow one way: `packages/tokens/sources/*.json` → `pnpm tokens` → `packages/tokens/src/tokens.css` and `src/tokens.gen.ts`. Never edit the generated files.
- `packages/tokens/sources/figma/*.json` are snapshots of the Figma libraries (checked by the tokens drift test and `packages/core/scripts/figma-nodes.test.mjs`), written by `packages/tokens/scripts/figma/export.js` (dev plugin, or run through the Figma MCP; returns over 20KB need splitting by collection). Never hand-edit them. Drift from them gets fixed in the sources, or waived in `sources/figma-waivers.json` with a reason the user agreed to.
- The emblem flows one way too: `packages/core/vendor/emblem/emblem.source.svg` (the master, as exported) → `pnpm emblem` → `emblem.json` and the apps' `public/` icons. Never edit those; replace the master and rerun.
- The card stocks flow one way too: `packages/ui/vendor/stock/paper.source.jpg` (the 3:2 master) and `palm-sky.source.png` (16:9) → `pnpm stock` → `packages/ui/src/imagery/stock/paper-*.jpg` and `palm-sky-*.jpg`, one per shape. Never edit those; replace the master and rerun.
- Components read CSS variables only. No hex values in `packages/ui` or `packages/blocks`.
- Postcards keep their Figma canvas size and are scaled, not reflowed.
- A card rule from `POSTCARDS.md` belongs in `apps/studio/src/app/lint.ts`, with its source.
- New contrast failures get fixed, or waived in `packages/tokens/sources/contrast-waivers.json` with a reason the user agreed to.
- Keep `data-figma` node IDs in step with the libraries (`packages/core/src/figma.ts`).
- Sample copy is the library's own. Content never invents.
