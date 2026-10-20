import { useMemo } from "react";
import { ARCHETYPES, CANVAS, Postcard, SAMPLE_LIST, TEMPLATES, type CardSource, type CardSpec } from "../../../ds";
import { ScaledBox } from "../../components/ScaledCard";

export type Choice = { key: string; name: string; spec: CardSpec; source: CardSource | null };

const TILE = 200;

type Frame = Pick<CardSpec, "scheme" | "ratio" | "project" | "day" | "series">;

/** What picking each tile loads: a sample takes the whole frame; a template keeps its own slots and any scheme it sets. */
export function pickGroups({ scheme, ratio, project, day, series }: Frame) {
  const samples: Choice[] = SAMPLE_LIST.map((s) => ({
    key: `sample-${s.archetype}`,
    name: ARCHETYPES[s.archetype].name,
    spec: { ...s, scheme, ratio, project, day, series },
    source: null,
  }));
  const templates: Choice[] = TEMPLATES.map((t) => ({
    key: t.id,
    name: t.name,
    spec: { scheme, ratio, day: null, series: null, project: null, ...t.spec } as CardSpec,
    source: { idea: t.idea, event: t.event },
  }));
  return [
    { name: "Archetypes · the library's sample copy", picks: samples },
    { name: "Templates · recorded work, with its source", picks: templates },
  ];
}

export const findPick = (key: string, frame: Frame) => pickGroups(frame).flatMap((g) => g.picks).find((p) => p.key === key);

/** The six archetype samples and every template, drawn in the Studio's current frame. */
export function Picker({
  frame,
  selected,
  onPick,
}: {
  frame: CardSpec;
  selected: string;
  onPick: (key: string) => void;
}) {
  const { scheme, ratio, project, day, series } = frame;
  const groups = useMemo(() => pickGroups({ scheme, ratio, project, day, series }), [scheme, ratio, project, day, series]);

  const canvas = CANVAS[ratio ?? "16:9"];
  return (
    <div className="picker">
      {groups.map((g) => (
        <section key={g.name}>
          <span className="label">{g.name}</span>
          <div className="picker__strip">
            {g.picks.map((p) => (
                <button key={p.key} type="button" className="picker__tile" aria-pressed={p.key === selected} onClick={() => onPick(p.key)}>
                  <ScaledBox canvas={canvas} width={TILE}>
                    <Postcard spec={p.spec} />
                  </ScaledBox>
                  <span>
                    {p.name}
                    {p.source ? <span className="muted"> · {ARCHETYPES[p.spec.archetype].name}</span> : null}
                  </span>
                </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
