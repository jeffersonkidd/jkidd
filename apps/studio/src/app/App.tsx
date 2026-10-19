import { useEffect, useState } from "react";
import { Monogram, SCHEMES, type Scheme } from "../ds";
import { Overview } from "./pages/Overview";
import { Foundations } from "./pages/Foundations";
import { MarksPage } from "./pages/MarksPage";
import { PartsPage } from "./pages/PartsPage";
import { Cards } from "./pages/Cards";
import { Thumbnails } from "./pages/Thumbnails";
import { Studio } from "./pages/Studio";
import { BacksPage } from "./pages/BacksPage";
import { LinkPagePreview } from "./pages/LinkPagePreview";
import { PicturePage } from "./pages/PicturePage";
import { StagePage } from "./pages/StagePage";
import { Select } from "./components/Controls";

const ROUTES = [
  { path: "", name: "Overview", el: Overview },
  { path: "foundations", name: "Foundations", el: Foundations },
  { path: "marks", name: "Marks", el: MarksPage },
  { path: "parts", name: "Card parts", el: PartsPage },
  { path: "cards", name: "Archetypes", el: Cards },
  { path: "thumbnails", name: "Thumbnail test", el: Thumbnails },
  { path: "studio", name: "Studio", el: Studio },
  { path: "backs", name: "Dressing the back", el: BacksPage },
  { path: "postcards", name: "Picture postcards", el: PicturePage },
  { path: "stage", name: "Stage postcards", el: StagePage },
  { path: "link", name: "Link page", el: LinkPagePreview },
] as const;

export type PageProps = { scheme: Scheme; query: URLSearchParams; navigate: (to: string) => void };

function readHash() {
  const [path, qs = ""] = location.hash.replace(/^#\/?/, "").split("?");
  return { path, query: new URLSearchParams(qs) };
}

function initialScheme(): Scheme {
  try {
    const saved = localStorage.getItem("jk-scheme") as Scheme | null;
    if (saved && (SCHEMES as readonly string[]).includes(saved)) return saved;
  } catch {
    /* storage blocked: fall through */
  }
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function App() {
  const [{ path, query }, setRoute] = useState(readHash);
  const [scheme, setScheme] = useState<Scheme>(initialScheme);

  useEffect(() => {
    const on = () => {
      setRoute(readHash());
      window.scrollTo(0, 0);
    };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.scheme = scheme;
    try {
      localStorage.setItem("jk-scheme", scheme);
    } catch {
      /* ignore */
    }
  }, [scheme]);

  const route = ROUTES.find((r) => r.path === path) ?? ROUTES[0];
  const Page = route.el;
  const navigate = (to: string) => (location.hash = `#/${to}`);

  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#/">
          <Monogram size="M" />
          <span>
            <strong>JKidd DS</strong>
            <span className="label">v0.1 · code</span>
          </span>
        </a>
        <nav aria-label="Pages">
          {ROUTES.map((r) => (
            <a key={r.path} href={`#/${r.path}`} aria-current={r === route ? "page" : undefined}>
              {r.name}
            </a>
          ))}
        </nav>
        <div className="sidebar__foot">
          <Select label="Page scheme" value={scheme} options={SCHEMES} onChange={setScheme} />
        </div>
      </aside>
      <main className="main" id="main">
        <Page scheme={scheme} query={query} navigate={navigate} />
      </main>
    </div>
  );
}
