import { useState } from "react";
import { ARCHETYPES, CANVAS, POST_TYPES, SAMPLE_LIST, SCHEMES, figmaUrl, type CardSpec, type PostType, type Ratio, type Scheme } from "../../ds";
import { PageHeader, Segmented, Select, TextField, cap } from "../components/Controls";
import { ScaledCard } from "../components/ScaledCard";
import { encodeSpec } from "../share";
import type { PageProps } from "../App";

type TypeChoice = "default" | PostType;
type SeriesChoice = "as designed" | "series" | "regular";

export function Cards(_: PageProps) {
  const [type, setType] = useState<TypeChoice>("default");
  const [scheme, setScheme] = useState<Scheme>("dark");
  const [ratio, setRatio] = useState<Ratio>("16:9");
  const [series, setSeries] = useState<SeriesChoice>("as designed");
  const [project, setProject] = useState("TIBBIE X");

  const apply = (s: CardSpec): CardSpec => ({
    ...s,
    postType: type === "default" ? s.postType : type,
    scheme,
    ratio,
    project: project.trim() || null,
    // Series posts show day and series; regular posts neither (Card Frame 67:72).
    ...(series === "series" && { day: s.day ?? "DAY 01", series: "21 DAYS OF DEV" }),
    ...(series === "regular" && { day: null, series: null }),
  });

  return (
    <div className="page">
      <PageHeader eyebrow="Components · 04" title="Six archetypes, one frame">
        <p>
          Each archetype swaps into the constant frame. The rail and tick read the post type, the scheme mode repaints
          everything, and the frame never moves. Cards render at {CANVAS[ratio].width}×{CANVAS[ratio].height} and scale to
          fit. Sample copy is the Figma library's own; replace it with the real work before posting.
        </p>
      </PageHeader>

      <div className="sticky-controls controls-grid">
        <Segmented label="Post type" value={type} options={["default", ...POST_TYPES] as const} onChange={setType} format={cap} />
        <Select label="Card scheme" value={scheme} options={SCHEMES} onChange={setScheme} />
        <Segmented label="Ratio" value={ratio} options={Object.keys(CANVAS) as Ratio[]} onChange={setRatio} />
        <TextField label="Project slot" value={project} onChange={setProject} placeholder="empty hides it" />
        <Segmented label="Post" value={series} options={["as designed", "series", "regular"] as const} onChange={setSeries} format={cap} />
      </div>

      <div className="card-grid" data-ratio={ratio}>
        {SAMPLE_LIST.map((s) => {
          const spec = apply(s);
          const meta = ARCHETYPES[s.archetype];
          return (
            <article key={s.archetype} className="card-tile">
              <ScaledCard spec={spec} label={`${meta.name} postcard`} />
              <div className="card-tile__meta">
                <div>
                  <h3 className="jk-text-doc-h2">{meta.name}</h3>
                  <p className="muted">
                    {meta.rule} Best for {meta.bestFor.map(cap).join(", ")}.
                  </p>
                </div>
                <div className="card-tile__links">
                  <a className="btn btn--small" href={`#/studio?c=${encodeSpec(spec)}`}>
                    Edit
                  </a>
                  <a className="btn btn--small btn--ghost" href={figmaUrl(meta.figma)} target="_blank" rel="noreferrer">
                    {meta.figma[1]} ↗
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
