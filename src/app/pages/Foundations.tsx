import { useState } from "react";
import { PALETTES, POST_TYPES, POST_TYPE_TOKENS, SCHEME_COLORS, SCHEMES, Kicker, type Scheme } from "../../ds";
import { PageHeader, Segmented, cap } from "../components/Controls";
import { contrast } from "../color";
import type { PageProps } from "../App";

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

const ROLE_GROUPS: [string, string[]][] = [
  ["Primary", ["primary", "onPrimary", "primaryContainer", "onPrimaryContainer"]],
  ["Secondary", ["secondary", "onSecondary", "secondaryContainer", "onSecondaryContainer"]],
  ["Tertiary", ["tertiary", "onTertiary", "tertiaryContainer", "onTertiaryContainer"]],
  ["Error", ["error", "onError", "errorContainer", "onErrorContainer"]],
  ["Surface", ["surface", "onSurface", "surfaceVariant", "onSurfaceVariant", "surfaceContainerLowest", "surfaceContainerLow", "surfaceContainer", "surfaceContainerHigh", "surfaceContainerHighest"]],
  ["Outline & inverse", ["outline", "outlineVariant", "inverseSurface", "inverseOnSurface", "inversePrimary"]],
];

const TEXT_STYLES = [
  ["Card/Statement", "jk-text-card-statement", "One idea per card."],
  ["Card/Body", "jk-text-card-body", "Six archetypes as components"],
  ["Card/Code", "jk-text-card-code", "npm run tokens"],
  ["Card/Kicker", "jk-text-card-kicker", "Library v0.1 shipped"],
  ["Card/Chrome", "jk-text-card-chrome", "21 days of dev"],
  ["Doc/H1", "jk-text-doc-h1", "Foundations"],
  ["Doc/H2", "jk-text-doc-h2", "The constant frame"],
  ["Doc/Label", "jk-text-doc-label", "Components · 01"],
] as const;

function Ratio({ value, min }: { value: number; min: number }) {
  return (
    <span className="ratio" data-pass={value >= min}>
      {value.toFixed(2)}
      {value >= min ? "" : " ✕"}
    </span>
  );
}

export function Foundations({ scheme: pageScheme }: PageProps) {
  const [scheme, setScheme] = useState<Scheme>(pageScheme);
  const c = SCHEME_COLORS[scheme];

  return (
    <div className="page">
      <PageHeader eyebrow="Foundations" title="Palette, scheme, post types, type">
        <p>
          Every value comes from <code>tokens/jkxo-tertiary.json</code> (seed <code>#01C6DE</code>, amber tertiary) and{" "}
          <code>tokens/jkidd.tokens.json</code>, compiled by <code>pnpm tokens</code>. The names match the Figma variables'
          code syntax, so <code>var(--md-sys-color-primary)</code> means the same thing in both.
        </p>
      </PageHeader>

      <div className="sticky-controls">
        <Segmented label="Scheme mode" value={scheme} options={SCHEMES} onChange={setScheme} />
      </div>

      <section className="section">
        <h2 className="jk-text-doc-h2">Post types</h2>
        <p className="muted">
          One Post Type mode per type. <strong>accent</strong> fills the rail, tick and highlights; <strong>ink</strong> is for
          text and thin marks. The two are separate because the Progress and Decision accents can't be read as text on the
          light surface. Ratios are live WCAG contrast for the selected mode. Provisional.
        </p>
        <div className="table-wrap">
          <table className="types-table" data-scheme={scheme}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Kicker</th>
                <th>accent</th>
                <th>ink</th>
                <th>on-accent</th>
                <th>ink / surface ≥ 4.5</th>
                <th>accent / surface ≥ 3</th>
              </tr>
            </thead>
            <tbody>
              {POST_TYPES.map((t) => {
                const tk = POST_TYPE_TOKENS[t];
                return (
                  <tr key={t} data-post-type={t}>
                    <th scope="row">{cap(t)}</th>
                    <td>
                      <Kicker />
                    </td>
                    <td>
                      <span className="chip-swatch" style={{ background: c[tk.accent] }} /> <code>{kebab(tk.accent)}</code>
                    </td>
                    <td>
                      <span className="chip-swatch" style={{ background: c[tk.ink] }} /> <code>{kebab(tk.ink)}</code>
                    </td>
                    <td>
                      <span className="chip-swatch" style={{ background: c[tk.onAccent] }} /> <code>{kebab(tk.onAccent)}</code>
                    </td>
                    <td>
                      <Ratio value={contrast(c[tk.ink], c.surface)} min={4.5} />
                    </td>
                    <td>
                      <Ratio value={contrast(c[tk.accent], c.surface)} min={3} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2 className="jk-text-doc-h2">Scheme roles · {scheme}</h2>
        <p className="muted">49 roles × 6 modes. Six of the groups are shown; the fixed and dim roles are in the CSS.</p>
        <div className="role-groups">
          {ROLE_GROUPS.map(([name, roles]) => (
            <div key={name} className="role-group">
              <h3 className="label">{name}</h3>
              {roles.map((r) => (
                <div key={r} className="role">
                  <span className="role__swatch" style={{ background: c[r] }} />
                  <code>--md-sys-color-{kebab(r)}</code>
                  <span className="role__hex">{c[r]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="jk-text-doc-h2">Palette</h2>
        <p className="muted">5 tonal palettes × 18 tones = 90 variables, as <code>--jk-palette-&lt;name&gt;-&lt;tone&gt;</code>.</p>
        <div className="palettes">
          {Object.entries(PALETTES).map(([name, tones]) => (
            <div key={name} className="palette">
              <span className="label">{name}</span>
              <div className="palette__strip">
                {Object.entries(tones).map(([tone, hex]) => (
                  <span key={tone} title={`${name}-${tone} ${hex}`} style={{ background: hex }}>
                    <em>{tone}</em>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="jk-text-doc-h2">Type</h2>
        <p className="muted">
          <strong>Special Elite Even</strong> display (the repaired cut in <code>fonts/</code>), <strong>Inter</strong> body,{" "}
          <strong>JetBrains Mono</strong> chrome and code. Body and mono are still provisional (decision 1). Card styles are sized for the 1600px canvas.
        </p>
        <div className="type-specimens">
          {TEXT_STYLES.map(([name, cls, sample]) => (
            <div key={name} className="specimen">
              <span className="label">{name}</span>
              <div className="specimen__sample">
                <span className={cls}>{sample}</span>
              </div>
              <code>.{cls}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
