# Operator's manual

**How to run this monorepo**, for J.F. and agents. (Clients learn their own
Studio instead: see [`CLIENT-GUIDES.md`](CLIENT-GUIDES.md).) The rules are in
`CLAUDE.md`. This manual teaches the tasks those rules govern, one lesson each.

Each lesson follows the client guides' shape: **Why → Do it → Check it worked
→ If something's off → The post it makes.** The last part follows
`CONTENT-SYSTEM.md` §1: every task here is real work, so every lesson ends
with what can be posted about it.

*Outline started 2026-10-14. Lessons get written one at a time and checked
against the repo as they are.*

---

| # | Lesson | Covers | Commands | The post it makes |
|---|---|---|---|---|
| 1 | Find your way around | The four packages and two apps, what each layer may import (`scripts/layers.test.mjs`), folders named for Figma libraries | `pnpm dev`, `pnpm links`, `pnpm check` | An architecture diagram card |
| 2 | Change a token | `packages/tokens/sources/*.json` → generated CSS and TS; contrast audit; `contrast-waivers.json` | `pnpm tokens`, `pnpm contrast` | A before/after card |
| 3 | Follow Figma | `sources/figma/*.json` snapshots and the export script; the drift test; `figma-waivers.json`; `data-figma` IDs; moving code when a component changes library | `pnpm test` | A parity card |
| 4 | Make a card | The Studio (`#/studio`), card rules in `apps/site/src/app/lint.ts`, PNG export at canvas size | `pnpm dev` | The card |
| 5 | Make a picture postcard | Front intake, inks, the press, series (`#/postcards`) | `pnpm front`, `pnpm front-inks` | A picture postcard |
| 6 | Replace the emblem | The master SVG → `emblem.json` and app icons | `pnpm emblem` | — |
| 7 | Ship it | Journal → idea bank → draft → Postiz → result logged (`CONTENT-SYSTEM.md` §2) | — | The post, with its result recorded |
| 8 | Run a series | The `21-DAYS.md` loop; this manual can be its subject | — | A recap thread |

## Still to build

- **`pnpm post`**: turn a Studio `CardSpec` (**Copy JSON**) into a post file in
  `Workbench/projects/jkidd/posts/` from the `POSTS.md` template. Lesson 7
  needs it to be a step rather than a copy-paste.
- **`#/learn`** in the demo site: the lessons rendered beside the live
  components they teach. Wait until three lessons are written.
