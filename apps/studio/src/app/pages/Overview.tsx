import { HandleLockup, Wordmark, SAMPLES, figmaUrl, FIGMA_NODES } from "../../ds";
import { ScaledCard } from "../components/ScaledCard";
import type { PageProps } from "../App";

const STATS = [
  ["182", "Variables"],
  ["6", "Scheme modes"],
  ["5", "Post types"],
  ["26", "Text styles"],
] as const;

/** The library's Cover (484:63), as a responsive page. */
export function Overview({ navigate }: PageProps) {
  return (
    <div className="cover">
      <div className="cover__rail" aria-hidden />
      <section className="cover__title">
        <p className="label">Foundations library · v0.1 · 2026-09-24</p>
        <Wordmark layout="stacked" />
        <p className="cover__lede">
          Foundations and marks for everything J.F. Kidd publishes: one palette, five post types, one type stack and the
          emblem. The frame, card parts, archetypes and postcards build on it in four more libraries.
        </p>
        <dl className="cover__stats">
          {STATS.map(([n, l]) => (
            <div key={l}>
              <dt className="label">{l}</dt>
              <dd>{n}</dd>
            </div>
          ))}
        </dl>
        <div className="cover__actions">
          <button className="btn btn--primary" onClick={() => navigate("studio")}>
            Open the Studio
          </button>
          <button className="btn" onClick={() => navigate("studio?see=thumbnails")}>
            Run the thumbnail test
          </button>
          <a className="btn btn--ghost" href={figmaUrl(FIGMA_NODES.Cover)} target="_blank" rel="noreferrer">
            Figma ↗
          </a>
        </div>
        <footer className="cover__foot">
          <HandleLockup project={null} />
          <span className="label">Provisional: type stack · post type colours · marks</span>
        </footer>
      </section>
      <section className="cover__fan" aria-label="Three sample postcards">
        <div className="fan-card fan-card--1">
          <ScaledCard spec={SAMPLES.manifesto} label="Manifesto postcard" />
        </div>
        <div className="fan-card fan-card--2">
          <ScaledCard spec={SAMPLES.architecture} label="Architecture Diagram postcard" />
        </div>
        <div className="fan-card fan-card--3">
          <ScaledCard spec={SAMPLES.ledger} label="Ledger postcard" />
        </div>
      </section>
    </div>
  );
}
