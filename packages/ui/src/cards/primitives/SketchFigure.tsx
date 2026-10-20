import { FIGURE_HALO, FIGURE_PEN, type FigurePose } from "@jkidd/core";

/**
 * One Architect's Notebook figure drawing, for inside any SVG: a halo line under the
 * ink line, both from the same paths. Colours come from --figure-ink and
 * --figure-halo, which each postcard genre sets from its own tokens.
 */
export function FigureStrokes({ pose }: { pose: FigurePose }) {
  return (
    <g className="jk-figure">
      <g className="jk-figure__halo" strokeWidth={FIGURE_PEN + FIGURE_HALO}>
        {pose.paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className="jk-figure__ink" strokeWidth={FIGURE_PEN}>
        {pose.paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
  );
}
