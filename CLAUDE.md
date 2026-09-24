# CLAUDE.md

Jefferson Kidd design system in code, built from the Figma library *JKidd - DS* (`ADhu9noVbgFbtapMZivOHw`). The charter and the rules it implements live in the Workbench: `~/Desktop/🧰 Workbench/projects/jkidd/` (`JKIDD.md`, `content/POSTCARDS.md`, `content/CONTENT-SYSTEM.md`).

## Commands

- `pnpm dev`: demo site on :5178 (regenerates tokens first)
- `pnpm check`: tokens → contrast → tests → typecheck → build. Run it before calling a change done.

## Rules

- Tokens flow one way: `tokens/*.json` → `pnpm tokens` → `src/styles/tokens.css` and `src/ds/tokens.gen.ts`. Never edit the generated files.
- Components read CSS variables only. No hex values in `src/ds/`.
- Cards keep their Figma canvas size and are scaled, not reflowed.
- A card rule from `POSTCARDS.md` belongs in `src/app/lint.ts`, with its source.
- New contrast failures get fixed, or waived in `tokens/contrast-waivers.json` with a reason the user agreed to.
- Keep `data-figma` node IDs in step with the library (`src/ds/figma.ts`).
- Sample copy is the library's own. Content never invents.
