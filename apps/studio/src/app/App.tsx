import { useEffect, useState } from "react";
import { Monogram, SCHEMES, type Scheme } from "../ds";
import { Overview } from "./pages/Overview";
import { Foundations } from "./pages/Foundations";
import { MarksPage } from "./pages/MarksPage";
import { PartsPage } from "./pages/PartsPage";
import { Studio } from "./pages/Studio";
import { StockPage } from "./pages/StockPage";
import { LinkPagePreview } from "./pages/LinkPagePreview";
import { PicturePage } from "./pages/PicturePage";
import { StagePage } from "./pages/StagePage";
import { LibrariesPage } from "./pages/LibrariesPage";
import { Select } from "./components/Controls";

const ROUTES = [
  { path: "", name: "Overview", el: Overview },
  { path: "foundations", name: "Foundations", el: Foundations },
  { path: "marks", name: "Marks", el: MarksPage },
  { path: "parts", name: "Parts", el: PartsPage },
  { path: "studio", name: "Studio", el: Studio },
  { path: "stock", name: "Stock catalog", el: StockPage },
  { path: "postcards", name: "Picture postcards", el: PicturePage },
  { path: "stage", name: "Stage postcards", el: StagePage },
  { path: "libraries", name: "Library pipeline", el: LibrariesPage },
  { path: "link", name: "Link page", el: LinkPagePreview },
] as const;

export type PageProps = { scheme: Scheme; query: URLSearchParams; navigate: (to: string) => void };

/** The Archetypes, Dressing the back and Thumbnail test pages merged into the Studio (2026-10-19); their old links land there. */
function redirect(path: string, query: URLSearchParams): string | null {
  if (path === "cards") return "studio";
  if (path === "thumbnails") return "studio?see=thumbnails";
  if (path !== "backs") return null;
  const q = new URLSearchParams();
  const card = query.get("card");
  if (card) q.set("t", card);
  for (const k of ["dress", "take"]) if (query.get(k)) q.set(k, query.get(k)!);
  return `studio?${q}`;
}

function readHash() {
  const [path, qs = ""] = location.hash.replace(/^#\/?/, "").split("?");
  const to = redirect(path, new URLSearchParams(qs));
  if (to === null) return { path, query: new URLSearchParams(qs) };
  history.replaceState(null, "", `#/${to}`);
  return readHash();
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
