# CLAUDE.md

Jefferson Kidd design system in code, built from the Figma libraries: *JKidd - DS* (`ADhu9noVbgFbtapMZivOHw`, becoming *JKidd - Foundations*) and the four split out of it (Primitives, Layout, Compositions, Blocks; keys in `packages/core/src/figma.ts`). The charter and the rules it implements live in the Workbench: `~/Desktop/🧰 Workbench/projects/jkidd/` (`JKIDD.md`, `content/POSTCARDS.md`, `content/CONTENT-SYSTEM.md`).

## Commands

- `pnpm dev`: demo site on :5178 (regenerates tokens first)
- `pnpm check`: tokens → contrast → tests → typecheck → build. Run it before calling a change done.

## Packages

A pnpm workspace, layered like the Figma libraries: `@jkidd/tokens` → `@jkidd/core` → `@jkidd/ui` (JKidd UI, CSS) → `@jkidd/react` → `@jkidd/blocks` (JK Blocks), plus the demo in `apps/site`. A package imports only the layers before it and declares them in its `package.json`; `scripts/layers.test.mjs` enforces this. Inside `ui` and `react`, folders are named for the Figma library a piece lives in (`foundations/`, `primitives/`, `layout/`, `compositions/`): when a component moves library in Figma, move its code to match.

## Rules

- Tokens flow one way: `packages/tokens/sources/*.json` → `pnpm tokens` → `packages/tokens/src/tokens.css` and `src/tokens.gen.ts`. Never edit the generated files.
- Components read CSS variables only. No hex values in `packages/ui`, `packages/react` or `packages/blocks`.
- Cards keep their Figma canvas size and are scaled, not reflowed.
- A card rule from `POSTCARDS.md` belongs in `apps/site/src/app/lint.ts`, with its source.
- New contrast failures get fixed, or waived in `packages/tokens/sources/contrast-waivers.json` with a reason the user agreed to.
- Keep `data-figma` node IDs in step with the libraries (`packages/core/src/figma.ts`).
- Sample copy is the library's own. Content never invents.
