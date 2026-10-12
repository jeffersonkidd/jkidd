# Special Elite, repaired

Two derivative cuts of Special Elite v1.001 (Astigmatic, Apache-2.0).
**Outlines are byte-for-byte the original ink.** Only metrics changed.

Apache-2.0 explicitly permits modification and redistribution; keep the
NOTICE/attribution in the name table (already set) and you're clear.

| | LSB spread | RSB spread | Advance spread | lead/em | sCapHeight | USE_TYPO_METRICS |
|---|---|---|---|---|---|---|
| Original      | 147 | 110 | 415 | 1.000 | 713 (49.5% wrong) | off |
| **Even**      | **0** | 1.9 | 352 | **1.250** | **1412 (correct)** | **on** |
| **Mono**      | 176* | 176* | **0** | **1.250** | **1412 (correct)** | **on** |

\* Mono centres each glyph in a uniform 1416-unit cell, so its sidebearings
vary by design. If you need a flush optical left edge in stacked lockups,
use **Even**. Mono is for columnar / grid / tabular work. Mono also has
kerning removed, because a monospace must not kern.

## Which one

- **Even** — the fix for wrestling with lockups and wrapped type. Still
  proportional, but every glyph's ink now starts exactly 68 units from its
  origin, so a left-aligned stack has a straight optical edge.
- **Mono** — behaves like an actual typewriter. Every character occupies the
  same cell (0.691 em).

## CSS

```css
@font-face {
  font-family: 'Special Elite Even';
  src: url('SpecialEliteEven.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
  size-adjust: 102.7%;   /* cap height -> Avenir Next's 0.708 em */
}

:root {
  /* cap-height normalised against Avenir Next Regular as the anchor */
  --mf-font-display:   'Alfa Slab One', Georgia, serif;        /* size-adjust:  91.0% */
  --mf-font-secondary: 'Special Elite Even', monospace;        /* size-adjust: 102.7% */
  --mf-font-body:      'Avenir Next', -apple-system, sans-serif; /* anchor:     100.0% */
}
```

Put each `size-adjust` on that family's own `@font-face` (for Avenir Next,
a local() @font-face). Then one `font-size` gives all three the same optical
cap height, and a lockup stops drifting.

## Rebuild

`python3 rebuild.py` (needs `fonttools` + `brotli`). Reads the original from
the architectsnotebook kit and re-derives both cuts deterministically.
