# CLAUDE.md

Jefferson Kidd design system in code, built from the Figma libraries: *JKidd - Foundations* (`ADhu9noVbgFbtapMZivOHw`, formerly *JKidd - DS*) and the four split out of it (Primitives, Layout, Compositions, Blocks; keys in `packages/core/src/figma.ts`). The charter and the rules it implements live in the Workbench: `~/Desktop/🧰 Workbench/projects/jkidd/` (`JKIDD.md`, `content/POSTCARDS.md`, `content/CONTENT-SYSTEM.md`).

## Commands

- `pnpm dev`: demo site on :5178 (regenerates tokens first)
- `pnpm links`: the link-in-bio site on :5179
- `pnpm check`: tokens → contrast → tests → typecheck → build. Run it before calling a change done.

## Packages

A pnpm workspace, layered like the Figma libraries: `@jkidd/tokens` → `@jkidd/core` → `@jkidd/ui` (JKidd UI, CSS) → `@jkidd/react` → `@jkidd/blocks` (JK Blocks), plus two apps that consume them through `workspace:*`: the demo in `apps/site` and the link-in-bio site in `apps/links`, which renders the Link Page block from `@jkidd/blocks/link` and keeps its live copy (hrefs) in `apps/links/src/links.ts`. A package imports only the layers before it and declares them in its `package.json`; `scripts/layers.test.mjs` enforces this. Inside `ui` and `react`, folders are named for the Figma library a piece lives in (`foundations/`, `primitives/`, `layout/`, `compositions/`): when a component moves library in Figma, move its code to match.

## Rules

- Tokens flow one way: `packages/tokens/sources/*.json` → `pnpm tokens` → `packages/tokens/src/tokens.css` and `src/tokens.gen.ts`. Never edit the generated files.
- `packages/tokens/sources/figma/*.json` are snapshots of the Figma libraries (checked by the tokens drift test and `packages/core/scripts/figma-nodes.test.mjs`), written by `packages/tokens/scripts/figma/export.js` (dev plugin, or run through the Figma MCP; returns over 20KB need splitting by collection). Never hand-edit them. Drift from them gets fixed in the sources, or waived in `sources/figma-waivers.json` with a reason the user agreed to.
- The emblem flows one way too: `packages/core/vendor/emblem/emblem.source.svg` (the master, as exported) → `pnpm emblem` → `emblem.json` and the apps' `public/` icons. Never edit those; replace the master and rerun.
- Components read CSS variables only. No hex values in `packages/ui`, `packages/react` or `packages/blocks`.
- Cards keep their Figma canvas size and are scaled, not reflowed.
- A card rule from `POSTCARDS.md` belongs in `apps/site/src/app/lint.ts`, with its source.
- New contrast failures get fixed, or waived in `packages/tokens/sources/contrast-waivers.json` with a reason the user agreed to.
- Keep `data-figma` node IDs in step with the libraries (`packages/core/src/figma.ts`).
- Sample copy is the library's own. Content never invents.
