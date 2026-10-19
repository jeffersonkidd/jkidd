# Client guides

**What this is:** the plan for teaching clients to run what Jefferson Kidd
builds for them, and to post well while they do it. The first guide is Tibbie
X's, in `~/Desktop/tibbiex/docs/guide/`. This file covers the parts every
client's guide shares, and how they make their way into this repo.

*Started 2026-10-14.*

---

## 1. Who learns what

| Who | What they run | Where it's taught |
|---|---|---|
| A client (Tibbie X) | Their site's Studio: Link Maker, Avatar, the modules still to come | Their repo's `docs/guide/`, later a **Guide** module in the Studio |
| J.F. and agents | This monorepo: tokens, Figma snapshots, card rules, postcards | [`MANUAL.md`](MANUAL.md) |

Clients never see pnpm. They learn the tools they're given, on a phone, in the
words on the screen.

## 2. The idea: the tool *is* the strategy

Each Studio module has a social media habit built in, and each lesson teaches
the tool and the habit together:

| Tool | Habit |
|---|---|
| Opening the Studio | Your own visits stay out of the numbers |
| Link Maker | One place, one link; never paste the bare address |
| Avatar | One face, everywhere, changed on purpose |
| Where they came from (to come) | Do more of what worked, where it worked |
| Postcards and cards from this kit (to come) | Post the work, not a pitch: `CONTENT-SYSTEM.md` §1, *content never invents; it documents*, rewritten for clients |

## 3. Lesson shape

Every lesson, for every client: **Why → Do it → Check it worked → If
something's off → The habit.** Rules (kept in each guide's README):

- Written for a phone in one hand.
- Uses the Studio's own words for buttons and messages.
- Describes only what exists. A module that isn't built gets a row in the
  table, not a lesson.
- A module and its lesson change in the same commit.

## 4. How it becomes part of the kit

Tibbie's guide is the first version, and the pattern gets pulled from it, not
designed ahead of it.

1. **Now:** Tibbie's guide as Markdown in `tibbiex/docs/guide/` (lessons 1–3
   written; 4–6 waiting on their modules).
2. **Next:** a **Guide** module in Tibbie's Studio (`/studio#guide`) that
   renders those lessons, each one linking to the module it teaches.
3. **When a second client arrives:** move what's shared into this repo:
   - the lesson layout, as a block in `@jkidd/blocks` (beside the link page);
   - the shared lessons (*Your Studio*, *Every post gets its own link*, *One
     face*), with the client's name, address and profile list as data, the way
     the link page takes `apps/links/src/links.ts`;
   - each client keeps their own lessons for their own modules.
4. **When the postcard tools reach a client:** lesson 5 gets written from the
   picture postcard and archetype makers in `apps/studio`, using
   `POSTCARDS.md` for the rules.

Before step 3, Tibbie's Studio and this repo need to share a stack. Tibbie X
uses Tailwind; this kit is CSS variables only (`CLAUDE.md`, *Components read
CSS variables only*). Settle that when the second client makes it real, not
before.

## 5. Open questions

- Does the client get Postiz, or does J.F. post on their behalf? That decides
  whether lesson 6 (*A week of posting*) teaches scheduling or handing over.
- Does a client's guide go public as a build-in-public series (`21-DAYS.md`),
  or stay private to the client?

Shut up and make more templates for content.