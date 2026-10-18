import type { CardSpec } from "../Postcard";
import type { CatalogEntry } from "./catalog";
import type { Evidence, Reading, Topic } from "./read";

/**
 * Pick from the stock catalog for one reading. Deterministic: the seed is the card's JSON plus
 * the take, so the same card always dresses the same way, and "another take" is one number.
 *
 * No runtime imports: the catalog comes in as an argument so `scripts/back.test.mjs` can run
 * this under plain Node.
 */

/** Ornament budget per card, in catalog weights. One idea per card applies to the dressing too. */
export const BUDGET = 3;
/** A shape below this score has nothing to say on this card. */
const THRESHOLD = 2;

export type CatalogPick = { id: string; score: number; why: string[] };

export type ShapePick = CatalogPick & {
  /** Canvas size before placement. */
  size: { w: number; h: number };
  /** Where it would like to sit, as a fraction of the canvas. null: fixed position (edges, corners). */
  prefer: [number, number] | null;
  /** Everything it prints, each traced to the card (a JSON path) or to catalog artwork. */
  prints: Evidence[];
  params: Record<string, string | number>;
};

export type Dressing = {
  seed: number;
  take: number;
  /** A picture postcard series whose paper and inks the back is printed in; null keeps the card's scheme. */
  dress: string | null;
  /** Every back prints on the card stock, a light raster, so it goes to the light scheme. */
  scheme: CardSpec["scheme"];
  texture: CatalogPick;
  overlays: CatalogPick[];
  shapes: ShapePick[];
  skipped: { id: string; why: string }[];
  budget: { used: number; of: number };
};

export type DressOptions = {
  /** Series to print in (picture-<series> inks), to pair the back with a picture postcard's front. */
  dress?: string | null;
  take?: number;
};

// ── Seeded randomness ────────────────────────────────────────────────────────

export function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

// ── Scoring ──────────────────────────────────────────────────────────────────

/** Score an entry's tags against the reading, with the reasons in words. */
function score(entry: CatalogEntry, reading: Reading, dress: string | null): { score: number; why: string[] } {
  let total = 0;
  const why: string[] = [];
  // The archetype is the card's form, so it outweighs any one topic; topics count as the
  // strongest plus a little for each other, so a card that touches many isn't louder for it.
  const topicScores: number[] = [];
  for (const tag of entry.tags) {
    const [kind, value] = tag.split(":");
    if (kind === "archetype" && value === reading.archetype) {
      total += 3;
      why.push(`Suits the ${value} archetype.`);
    } else if (kind === "tone" && value === reading.tone) {
      total += 1.5;
      why.push(`The card's tone is ${value} (post type ${reading.postType}${reading.struck ? `, ${reading.struck} struck` : ""}).`);
    } else if (kind === "topic") {
      const t = reading.topics.find((t) => t.topic === (value as Topic));
      if (t) {
        topicScores.push(Math.min(t.score, 3));
        const quotes = t.evidence.slice(0, 2).map((e) => `“${e.text}” (${e.path})`).join(", ");
        why.push(`Topic ${value}: ${quotes}${t.evidence.length > 2 ? ` and ${t.evidence.length - 2} more` : ""}.`);
      }
    } else if (kind === "style" && value === "series" && dress) {
      total += 3;
      why.push(`Printed in the ${dress} series, so it gets the same press as the series' fronts.`);
    }
  }
  if (topicScores.length) total += Math.max(...topicScores) + 0.5 * (topicScores.length - 1);
  return { score: total, why };
}

const best = (list: (CatalogPick & { tie: number })[]) =>
  [...list].sort((a, b) => b.score + b.tie - (a.score + a.tie))[0];

// ── The pick ─────────────────────────────────────────────────────────────────

const STAMP_ICON: Record<CardSpec["postType"], string> = {
  progress: "flag",
  decision: "signpost",
  failure: "skull",
  principle: "sun",
  teaching: "bell",
};

export function pickDressing(spec: CardSpec, reading: Reading, catalog: CatalogEntry[], options: DressOptions = {}): Dressing {
  const take = options.take ?? 0;
  const dress = options.dress ?? null;
  const seed = hash(JSON.stringify(spec)) ^ Math.imul(take + 1, 0x9e3779b1);
  const rand = rng(seed);
  // Ties break by the seed; a take can reorder near-ties but never beat a clear reading.
  const tie = () => round(rand() * (take ? 1.2 : 0.4));

  const of = (kind: CatalogEntry["kind"]) => catalog.filter((c) => c.kind === kind);
  const skipped: Dressing["skipped"] = [];

  // Texture: always one. Card stock is the floor, so a card the reader can't place still gets paper.
  const textures = of("texture").map((e) => ({ id: e.id, ...score(e, reading, dress), tie: tie() + (e.id === "fiber" ? 0.5 : 0) }));
  const t = best(textures);
  const texture: CatalogPick = {
    id: t.id,
    score: round(t.score),
    why: t.why.length ? t.why : ["Nothing on the card points to a paper, so it gets plain card stock."],
  };

  const overlays: CatalogPick[] = of("overlay")
    .map((e) => ({ id: e.id, ...score(e, reading, dress) }))
    .filter((o) => o.score >= 1.5)
    .map((o) => ({ ...o, score: round(o.score) }));

  // Shapes: the cachet first, then whatever has something to say, within the budget.
  const topGlyph = reading.topics[0]?.topic ?? null;
  const handle = spec.handle ?? "@JFKIDD";
  const ringTop: Evidence = spec.series ? { path: "series", text: spec.series } : { path: spec.handle ? "handle" : "frame.handle", text: handle };
  const date = reading.source?.event.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  const ringBottom: Evidence | null = spec.day ? { path: "day", text: spec.day } : date ? { path: "source.event", text: date } : null;
  const label: Evidence = { path: "postType", text: spec.postType.toUpperCase() };

  const shapes: ShapePick[] = [
    {
      id: "cachet",
      score: 10,
      why: [
        `The stamp is the post type, ${spec.postType}: its ${STAMP_ICON[spec.postType]} (Entry 001-C's stamps, in the charter's type order).`,
        ringBottom
          ? `The postmark cancels it with ${ringTop.text} and ${ringBottom.text}.`
          : `The postmark cancels it with ${ringTop.text}; a regular post has no day to date it.`,
        topGlyph ? `Its centre carries the card's strongest topic, ${topGlyph}.` : "Nothing on the card names a topic, so its centre is left plain.",
      ],
      size: catalog.find((c) => c.id === "cachet")?.size ?? { w: 400, h: 220 },
      prefer: [0.84, 0.3],
      prints: [label, ringTop, ...(ringBottom ? [ringBottom] : []), { path: "artwork", text: "2¢" }],
      params: {
        icon: STAMP_ICON[spec.postType],
        label: label.text,
        ringTop: ringTop.text,
        ringBottom: ringBottom?.text ?? "",
        glyph: topGlyph ?? "",
        stampTilt: round(rand() * 6 - 3, 1),
        markTilt: round(rand() * 24 - 12, 1),
        wavePhase: round(rand() * Math.PI * 2),
      },
    },
  ];
  let used = 1;

  const candidates = of("shape")
    .filter((e) => e.id !== "cachet")
    .map((e) => {
      const s = score(e, reading, dress);
      const missing = (e.needs ?? []).find(
        (n) =>
          (n === "verdict" && !reading.verdict) ||
          (n === "source" && !reading.source) ||
          (n === "series-post" && !reading.seriesPost),
      );
      // A requirement met is itself the reason to print: the card has something this shape says.
      // The card's own verdict ranks first, its citation next.
      if (!missing && e.needs?.length) {
        s.score += e.id === "rubber" ? 3.5 : 2.5;
        if (e.id === "rubber" && reading.verdict) s.why.unshift(`The card says “${reading.verdict.text}” (${reading.verdict.path}).`);
        if (e.id === "imprint") s.why.unshift(`The card cites idea ${reading.source!.idea} and journal ${reading.source!.event}.`);
        if (e.id === "airmail") s.why.unshift(`${spec.day} of ${spec.series}: one dispatch in a run.`);
      }
      return { entry: e, missing, ...s, tie: tie() };
    })
    .sort((a, b) => b.score + b.tie - (a.score + a.tie));

  for (const c of candidates) {
    const w = c.entry.weight ?? 1;
    if (c.missing) {
      skipped.push({ id: c.entry.id, why: `Needs a ${c.missing.replace("-", " ")}; this card has none.` });
    } else if (c.score < THRESHOLD) {
      skipped.push({ id: c.entry.id, why: c.score ? `Only a weak fit (${round(c.score)}).` : "Nothing on the card calls for it." });
    } else if (used + w > BUDGET) {
      skipped.push({ id: c.entry.id, why: `Over the ornament budget (${used} of ${BUDGET} used).` });
    } else {
      used += w;
      const prints: Evidence[] = [];
      const params: ShapePick["params"] = {};
      let size = c.entry.size ?? { w: 0, h: 0 };
      let prefer: ShapePick["prefer"] = null;
      if (c.entry.id === "rubber" && reading.verdict) {
        const word = reading.verdict.text.toUpperCase();
        prints.push({ path: reading.verdict.path, text: reading.verdict.text });
        params.word = word;
        params.tilt = round(-4 - rand() * 6, 1);
        size = { w: 64 + word.length * 34, h: size.h };
        prefer = [0.78, 0.74];
      }
      if (c.entry.id === "imprint" && reading.source) {
        prints.push({ path: "source.idea", text: reading.source.idea }, { path: "source.event", text: reading.source.event });
        params.idea = reading.source.idea;
        params.event = reading.source.event;
        prefer = [0.66, 0.5];
      }
      shapes.push({ id: c.entry.id, score: round(c.score), why: c.why, size, prefer, prints, params });
    }
  }

  return {
    seed,
    take,
    dress,
    scheme: "light",
    texture,
    overlays,
    shapes,
    skipped,
    budget: { used, of: BUDGET },
  };
}
