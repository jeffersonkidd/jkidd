import { ARCHETYPES, CANVAS, type CardSpec } from "../ds";

export type Finding = { level: "error" | "warn" | "info"; message: string; source: string };

/**
 * The card rules from POSTCARDS.md §1–3 and the Figma component descriptions,
 * as checks. The Studio runs them on every edit.
 */
export function lintCard(spec: CardSpec): Finding[] {
  const out: Finding[] = [];
  const meta = ARCHETYPES[spec.archetype];

  if (!meta.bestFor.includes(spec.postType)) {
    out.push({
      level: "info",
      message: `${meta.name} is best for ${meta.bestFor.join(", ")}; this card is ${spec.postType}.`,
      source: "POSTCARDS.md §3",
    });
  }
  if (Boolean(spec.day) !== Boolean(spec.series)) {
    out.push({
      level: "warn",
      message: "Series posts show both the day and the series; regular posts show neither.",
      source: "Card Frame 8:60",
    });
  }
  if (spec.ratio && spec.ratio !== "16:9" && spec.archetype !== "manifesto" && spec.archetype !== "ledger") {
    out.push({
      level: "info",
      message: `The sample layouts are drawn for 16:9. Check ${meta.name} at ${spec.ratio} (${CANVAS[spec.ratio].width}×${CANVAS[spec.ratio].height}) for clipping.`,
      source: "Card Frame ratios",
    });
  }

  switch (spec.archetype) {
    case "manifesto": {
      const n = spec.content.lines.length + 1;
      if (n > 5) out.push({ level: "error", message: `${n} lines. Manifesto takes 3–5 lines at most, payoff included.`, source: "Content/Manifesto 11:3" });
      if (n < 3) out.push({ level: "info", message: `${n} lines. The spec suggests 3–5; break lines by meaning, not width.`, source: "POSTCARDS.md §3" });
      if (!spec.content.payoff.trim()) out.push({ level: "error", message: "No payoff line. The payoff is the claim.", source: "POSTCARDS.md §3" });
      break;
    }
    case "architecture":
      if (spec.content.arrow.includes("→") || spec.content.arrow.includes(","))
        out.push({ level: "warn", message: "The annotation looks like two rules. A diagram that needs two arrows is two cards.", source: "Arrow 9:28" });
      if (spec.content.from.chips.length > 6)
        out.push({ level: "warn", message: `${spec.content.from.chips.length} chips. Keep a zone readable at 320px.`, source: "Principle 4" });
      break;
    case "pipeline": {
      const { lines, highlight } = spec.content.output;
      if (highlight < 0 || highlight >= lines.length)
        out.push({ level: "error", message: "Highlight exactly one output line; the eye needs a landing point.", source: "POSTCARDS.md §3" });
      if (!spec.content.transform.command.trim())
        out.push({ level: "error", message: "The middle stage needs one real command.", source: "Terminal 9:35" });
      break;
    }
    case "parity":
      if (!spec.content.left.image && !spec.content.right.image)
        out.push({ level: "info", message: "Replace both specimens with real screenshots at the same zoom and crop before posting.", source: "Content/Parity 11:82" });
      else if (spec.content.left.specimen !== spec.content.right.specimen)
        out.push({ level: "warn", message: "The halves describe different things. The = is the whole argument.", source: "POSTCARDS.md §3" });
      break;
    case "before-after":
      if (spec.content.before.items.length !== spec.content.after.items.length)
        out.push({ level: "warn", message: "Show the wrong thing at equal weight to the right thing: same number of rows each side.", source: "POSTCARDS.md §3" });
      break;
    case "ledger": {
      const n = spec.content.rows.length;
      if (n > 6) out.push({ level: "error", message: `${n} rows; only the first 6 render. Keep the 6 most visual.`, source: "Content/Ledger 11:123" });
      const lens = spec.content.rows.map((r) => r.text.length);
      if (n >= 3 && Math.max(...lens) - Math.min(...lens) < 6)
        out.push({ level: "info", message: "Rows are all about the same length. Real item names come at uneven lengths.", source: "POSTCARDS.md §3" });
      break;
    }
  }
  return out;
}
