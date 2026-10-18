import type { CardSpec } from "../Postcard";

/**
 * Read a card's JSON for meaning. Every finding carries the path it came from, so the dressing
 * can show its working, and so nothing on the back is printed that the card didn't say.
 *
 * No runtime imports: `scripts/back.test.mjs` runs this under plain Node.
 */

export type Evidence = { path: string; text: string };

export const TOPICS = ["tokens", "type", "color", "figma", "code", "weight", "layout", "ship"] as const;
export type Topic = (typeof TOPICS)[number];

export type Tone = "milestone" | "fork" | "correction" | "creed" | "lesson";

/** Where the card came from, when it came from the idea bank (templates.ts). */
export type CardSource = { idea: string; event: string };

export type Reading = {
  archetype: CardSpec["archetype"];
  postType: CardSpec["postType"];
  tone: Tone;
  /** Day and series both set: one dispatch in a run. */
  seriesPost: boolean;
  /** Strongest first. Only topics with evidence. */
  topics: { topic: Topic; score: number; evidence: Evidence[] }[];
  /** Figures with units or ratios: the card is arguing from numbers. */
  numbers: Evidence[];
  /** One word the card itself says that reads as a verdict, for the rubber stamp. */
  verdict: Evidence | null;
  /** What the arrows say. */
  verbs: Evidence[];
  /** Rows struck through or crossed out. */
  struck: number;
  source: CardSource | null;
  /** Every string on the card, with its path. */
  texts: Evidence[];
};

/** The post type sets the tone; the archetype's own marks can sharpen it. */
const TONE: Record<CardSpec["postType"], Tone> = {
  progress: "milestone",
  decision: "fork",
  failure: "correction",
  principle: "creed",
  teaching: "lesson",
};

/** What each topic sounds like on a card. Kept to words the journal actually uses. */
const LEXICON: Record<Topic, RegExp> = {
  tokens: /\btokens?\b|\bvariables?\b|\bpalette\b|--[a-z][\w-]*|\.json\b|\bscheme\b|\broles?\b/gi,
  type: /\bfonts?\b|\btype\b|\btext styles?\b|\bspecial elite\b|\binter\b|\bexcalifont\b|\bwild words\b|\bbangers\b|\bsidebearing\b|\bcap ?height\b|\bline height\b|\blettering\b|\bdisplay\b|\bheading-\w+/gi,
  color: /\bcontrast\b|#[0-9a-f]{6}\b|\bcolou?rs?\b|\baccent\b|\bswatch(es)?\b|\d(\.\d+)?:1\b|\bink\b|\brail\b/gi,
  figma: /\bfigma\b|\bcomponents?\b|\blibrar(y|ies)\b|\bvariants?\b|\bmodes?\b|\bcontent\/\*|\bpostcard\/\*/gi,
  code: /\bnpm\b|\bpnpm\b|\bpython3?\b|\.(py|mjs|ts|tsx|css)\b|\bscripts?\b|@utility\b|\bcode\b|\bcommand\b/gi,
  weight: /\b\d+(\.\d+)?\s?(MB|KB|GB)\b|\bpng\b|\bjpe?g\b/gi,
  layout: /\b\d+px\b|\bgrid(-template-columns)?\b|\b(min-)?width\b|\bratios?\b|\blayout\b|\b16:9\b|\b1:1\b|\b4:5\b|\boverflow(ing)?\b|\bfits?\b/gi,
  ship: /\bshipped\b|\bv\d+\.\d+\b|\baudit(ed)?\b|\brelease(d)?\b|\blaunch(ed)?\b/gi,
};

const NUMBER = /\b\d+(\.\d+)?\s?(MB|KB|GB|px|%)|\b\d+(\.\d+)?:1\b|\b\d+ of \d+\b|\b\d+(\.\d+)?\s?[×x]\s?\d+\b/gi;

/**
 * Verdict words, strongest first. The stamp prints the word as the card spells it (upper-cased:
 * that's typography, not new copy).
 */
const VERDICTS = ["shipped", "fixed", "fits", "waived", "audited", "pass", "passed", "cut", "decided", "merged", "again", "done"];

/** Where a verdict reads loudest: labels, titles and payoffs first. */
const LOUD = /(label|title|payoff|kicker)$/;

function walk(value: unknown, path: string, out: Evidence[]) {
  if (typeof value === "string") {
    if (value.trim()) out.push({ path, text: value });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${path}[${i}]`, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k, out);
  }
}

export function readCard(spec: CardSpec, source: CardSource | null = null): Reading {
  const texts: Evidence[] = [];
  walk(spec.content, "content", texts);
  if (source) {
    texts.push({ path: "source.idea", text: source.idea }, { path: "source.event", text: source.event });
  }

  const topics = TOPICS.map((topic) => {
    const evidence: Evidence[] = [];
    for (const t of texts) {
      for (const m of t.text.matchAll(LEXICON[topic])) evidence.push({ path: t.path, text: m[0] });
    }
    // Repeats of one word in one string count once: a card about palettes isn't five cards.
    const seen = new Set<string>();
    const unique = evidence.filter((e) => {
      const k = `${e.path}|${e.text.toLowerCase()}`;
      return seen.has(k) ? false : (seen.add(k), true);
    });
    return { topic, score: unique.length, evidence: unique };
  })
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score || TOPICS.indexOf(a.topic) - TOPICS.indexOf(b.topic));

  const numbers = texts.flatMap((t) => [...t.text.matchAll(NUMBER)].map((m) => ({ path: t.path, text: m[0] })));

  let verdict: Evidence | null = null;
  let best = Infinity;
  for (const t of texts) {
    if (t.path.startsWith("source.")) continue;
    for (const m of t.text.matchAll(/[A-Za-z]+/g)) {
      const rank = VERDICTS.indexOf(m[0].toLowerCase());
      if (rank < 0) continue;
      const score = rank - (LOUD.test(t.path) ? 100 : 0);
      if (score < best) {
        best = score;
        verdict = { path: t.path, text: m[0] };
      }
    }
  }

  const verbs: Evidence[] = [];
  if (spec.archetype === "architecture") verbs.push({ path: "content.arrow", text: spec.content.arrow });
  if (spec.archetype === "pipeline") spec.content.arrows.forEach((a, i) => verbs.push({ path: `content.arrows[${i}]`, text: a }));

  let struck = 0;
  if (spec.archetype === "ledger") struck = spec.content.rows.filter((r) => r.struck || r.mark === "cross").length;
  if (spec.archetype === "before-after") struck = spec.content.before.items.length;

  return {
    archetype: spec.archetype,
    postType: spec.postType,
    // A ledger of cuts is a correction whatever its post type says.
    tone: spec.archetype === "ledger" && struck * 2 > spec.content.rows.length ? "correction" : TONE[spec.postType],
    seriesPost: Boolean(spec.day && spec.series),
    topics,
    numbers,
    verdict,
    verbs,
    struck,
    source,
    texts,
  };
}
