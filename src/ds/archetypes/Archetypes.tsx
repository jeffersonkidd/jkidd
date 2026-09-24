import { Arrow, CheckRow, EqualsBadge, Kicker, Terminal, TokenChip, Zone, type RowMark } from "../parts/Parts";
import { FIGMA_NODES } from "../figma";

/* Six archetypes, one frame (POSTCARDS.md §3). Each takes plain data, so a card
   can be written as JSON in a post file and rendered here. */

// ── Manifesto · best for Principle ───────────────────────────────────────────

export type ManifestoContent = {
  /** Break lines by meaning, 3–5 lines at most (payoff included). */
  lines: string[];
  /** The payoff phrase, set on a type/accent highlight. */
  payoff: string;
  attribution?: string;
  /** Overrides the kicker; empty reads the post type. */
  kicker?: string;
};

export function Manifesto({ lines, payoff, attribution, kicker }: ManifestoContent) {
  return (
    <div className="jk-manifesto" data-figma={FIGMA_NODES.Manifesto}>
      <Kicker>{kicker}</Kicker>
      <div style={{ height: 12 }} />
      <p className="jk-manifesto__statement jk-text-card-statement">
        {lines.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </p>
      <span className="jk-manifesto__payoff jk-text-card-statement">{payoff}</span>
      {attribution ? (
        <>
          <div style={{ height: 20 }} />
          <span className="jk-manifesto__attribution jk-text-card-chrome">{attribution}</span>
        </>
      ) : null}
    </div>
  );
}

// ── Architecture Diagram · best for Decision, Principle ──────────────────────

export type ArchitectureContent = {
  from: { label: string; chips: string[] };
  /** The annotation carries the rule. */
  arrow: string;
  to: { label: string };
};

export function ArchitectureDiagram({ from, arrow, to }: ArchitectureContent) {
  return (
    <div className="jk-arch" data-figma={FIGMA_NODES.ArchitectureDiagram}>
      <Zone label={from.label} className="jk-arch__zone-a">
        {from.chips.map((c) => (
          <TokenChip key={c}>{c}</TokenChip>
        ))}
      </Zone>
      <Arrow>{arrow}</Arrow>
      <Zone label={to.label} className="jk-arch__zone-b">
        <div className="jk-composition" aria-hidden>
          <div className="jk-composition__title" />
          <div className="jk-composition__body" />
          <div className="jk-composition__action" />
        </div>
      </Zone>
    </div>
  );
}

// ── Pipeline · best for Teaching ─────────────────────────────────────────────

export type PipelineContent = {
  source: { label: string; chips: string[] };
  transform: { label: string; command: string };
  output: { label: string; lines: string[]; /** Highlight exactly one line. */ highlight: number };
  arrows: [string, string];
};

export function Pipeline({ source, transform, output, arrows }: PipelineContent) {
  return (
    <div className="jk-pipeline" data-figma={FIGMA_NODES.Pipeline}>
      <Zone label={source.label} className="jk-pipeline__source">
        {source.chips.map((c) => (
          <TokenChip key={c} fill>
            {c}
          </TokenChip>
        ))}
      </Zone>
      <Arrow>{arrows[0]}</Arrow>
      <Zone label={transform.label} className="jk-pipeline__transform">
        <Terminal>{transform.command}</Terminal>
      </Zone>
      <Arrow>{arrows[1]}</Arrow>
      <Zone label={output.label} className="jk-pipeline__output">
        {output.lines.map((l, i) => (
          <div key={i} className="jk-code-line" data-highlight={i === output.highlight || undefined}>
            {l}
          </div>
        ))}
      </Zone>
    </div>
  );
}

// ── Parity · best for Progress, Teaching ─────────────────────────────────────

type ParityHalf = { label: string; /** Text specimen, or an image URL of the real render. */ specimen: string; image?: string };
export type ParityContent = { left: ParityHalf; right: ParityHalf };

function ParitySide({ half }: { half: ParityHalf }) {
  return (
    <Zone label={half.label}>
      {half.image ? (
        <img className="jk-specimen-img" src={half.image} alt={half.specimen} />
      ) : (
        <span className="jk-specimen">{half.specimen}</span>
      )}
    </Zone>
  );
}

export function Parity({ left, right }: ParityContent) {
  return (
    <div className="jk-parity" data-figma={FIGMA_NODES.Parity}>
      <ParitySide half={left} />
      <div className="jk-parity__divider">
        <div className="jk-parity__hairline" />
        <EqualsBadge />
        <div className="jk-parity__hairline" />
      </div>
      <ParitySide half={right} />
    </div>
  );
}

// ── Before / After · best for Failure ────────────────────────────────────────

export type BeforeAfterContent = {
  before: { label?: string; items: string[] };
  after: { label?: string; items: string[] };
};

/** Red only on the left, primary only on the right; never mix. Equal visual weight. */
export function BeforeAfter({ before, after }: BeforeAfterContent) {
  return (
    <div className="jk-before-after" data-figma={FIGMA_NODES.BeforeAfter}>
      <Zone label={before.label ?? "BEFORE"} tone="error">
        {before.items.map((t) => (
          <CheckRow key={t} mark="cross" struck text="code">
            {t}
          </CheckRow>
        ))}
      </Zone>
      <Zone label={after.label ?? "AFTER"} tone="primary">
        {after.items.map((t) => (
          <CheckRow key={t} mark="check" markTone="primary" text="code">
            {t}
          </CheckRow>
        ))}
      </Zone>
    </div>
  );
}

// ── Ledger · best for Progress, recaps ───────────────────────────────────────

export type LedgerRow = { text: string; mark?: RowMark; struck?: boolean };
export type LedgerContent = { title: string; /** 6 rows at most. */ rows: LedgerRow[] };

export function Ledger({ title, rows }: LedgerContent) {
  return (
    <div className="jk-ledger" data-figma={FIGMA_NODES.Ledger}>
      <span className="jk-ledger__title jk-text-card-kicker">{title}</span>
      <div style={{ height: 8 }} />
      {rows.slice(0, 6).map((r, i) => (
        <CheckRow key={i} mark={r.mark ?? "check"} struck={r.struck}>
          {r.text}
        </CheckRow>
      ))}
    </div>
  );
}
