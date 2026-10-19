import { useState, type CSSProperties, type ReactNode } from "react";
import {
  Facebook,
  Feather,
  Github,
  Instagram,
  LayoutGrid,
  MessageCircle,
  Wrench,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import commandSvg from "../assets/link/command.svg";
import chevronSvg from "../assets/link/chevron-right.svg";
import palmSky from "../assets/link/palm-sky.jpg";
import paper from "../assets/stock/paper-2x3.jpg";
import { LINK_NODES } from "@jkidd/core";

/**
 * The link-in-bio page: a paper sheet on the palm sky. Drawn as live layers across the
 * four libraries (LINK_NODES): Primitives (Tag, Icon Kicker, Pill Button, Icon Button,
 * Tab, Avatar), Compositions (Stage, Sheet, Link Header, Link Profile, Tab Bar, Link Row,
 * Link Tile) and the Link Page block. Figma draws it at web size, so sizes
 * here match it 1:1. First sketched in JKidd - Workbench (Linktrees, 120:1335).
 */

export type LinkCategory = "studio" | "blog" | "shop" | "support";

export type LinkSocial = "facebook" | "instagram" | "youtube" | "github" | "message";

export type LinkItem = {
  category: LinkCategory;
  title: string;
  description: string;
  tags: string[];
  href?: string;
  /** Row media. Without it the row shows the mockup's dark placeholder. */
  image?: string;
};

export type LinkTileSpec = { kicker: string; label: string; href?: string };

export type LinkPageSpec = {
  wordmark: string;
  nav: { label: string; href?: string }[];
  follow: { label: string; href?: string };
  profile: {
    name: string;
    tags: string[];
    bio: string;
    avatar?: string;
    socials: { kind: LinkSocial; href?: string }[];
  };
  items: LinkItem[];
  tiles: LinkTileSpec[];
};

const CATEGORY: Record<LinkCategory, { label: string; icon: LucideIcon }> = {
  studio: { label: "Studio", icon: Wrench },
  blog: { label: "Blog", icon: Feather },
  shop: { label: "Shop", icon: LayoutGrid },
  support: { label: "Support", icon: LayoutGrid },
};

const SOCIAL: Record<LinkSocial, { label: string; icon: LucideIcon }> = {
  facebook: { label: "Facebook", icon: Facebook },
  instagram: { label: "Instagram", icon: Instagram },
  youtube: { label: "YouTube", icon: Youtube },
  github: { label: "GitHub", icon: Github },
  message: { label: "Message", icon: MessageCircle },
};

/** Figma icon assets, drawn as masks so they take the role colour in every scheme. */
function MaskIcon({ src, size }: { src: string; size: number }) {
  const style = { "--lk-icon-src": `url("${src}")`, width: size, height: size } as CSSProperties;
  return <span className="lk-mask-icon" style={style} aria-hidden />;
}

/** An <a> when there's somewhere to go; otherwise the same box, inert. */
function Linkish({ href, className, children, label }: { href?: string; className: string; children: ReactNode; label?: string }) {
  return href ? (
    <a className={className} href={href} aria-label={label}>
      {children}
    </a>
  ) : (
    <span className={className} aria-label={label} role={label ? "img" : undefined}>
      {children}
    </span>
  );
}

export function LinkTag({ children }: { children: string }) {
  return <span className="lk-tag">{children}</span>;
}

function Kicker({ category, label }: { category?: LinkCategory; label: string }) {
  // Link Row draws Studio with the Command glyph; the other categories reuse their tab icon.
  const Icon = category && category !== "studio" ? CATEGORY[category].icon : null;
  return (
    <span className="lk-kicker">
      <span className="lk-kicker__icon">
        {Icon ? <Icon size={16} strokeWidth={2} aria-hidden /> : <MaskIcon src={commandSvg} size={16} />}
      </span>
      <span className="lk-kicker__label">{label}</span>
    </span>
  );
}

/** Link Row (Compositions, LINK_NODES.LinkRow). Wraps to a stacked card below ~560px, as the Figma flex-wrap does. */
export function LinkRow({ item }: { item: LinkItem }) {
  return (
    <Linkish href={item.href} className="lk-row">
      <span className="lk-row__media" data-empty={!item.image || undefined}>
        {item.image ? <img src={item.image} alt="" /> : null}
      </span>
      <span className="lk-row__text">
        <span className="lk-row__title-block">
          <Kicker category={item.category} label={CATEGORY[item.category].label} />
          <span className="lk-row__title">{item.title}</span>
          <span className="lk-row__desc">{item.description}</span>
        </span>
        <span className="lk-tags">
          {item.tags.map((t) => (
            <LinkTag key={t}>{t}</LinkTag>
          ))}
        </span>
      </span>
      <span className="lk-row__go" aria-hidden>
        <MaskIcon src={chevronSvg} size={20} />
      </span>
    </Linkish>
  );
}

export function LinkTile({ tile }: { tile: LinkTileSpec }) {
  return (
    <Linkish href={tile.href} className="lk-tile">
      <Kicker label={tile.kicker} />
      <span className="lk-tile__label">{tile.label}</span>
    </Linkish>
  );
}

export function LinkProfile({ profile }: { profile: LinkPageSpec["profile"] }) {
  return (
    <section className="lk-profile" aria-label="Profile">
      <span className="lk-avatar">{profile.avatar ? <img src={profile.avatar} alt="" /> : null}</span>
      <div className="lk-profile__text">
        <h1 className="lk-profile__name">{profile.name}</h1>
        <span className="lk-tags">
          {profile.tags.map((t) => (
            <LinkTag key={t}>{t}</LinkTag>
          ))}
        </span>
        <p className="lk-profile__bio">{profile.bio}</p>
        <span className="lk-socials">
          {profile.socials.map(({ kind, href }) => {
            const { label, icon: Icon } = SOCIAL[kind];
            return (
              <Linkish key={kind} href={href} className="lk-social" label={label}>
                <Icon size={18} strokeWidth={2} aria-hidden />
              </Linkish>
            );
          })}
        </span>
      </div>
    </section>
  );
}

type Filter = "all" | LinkCategory;

export function LinkTabs({ value, onChange }: { value: Filter; onChange: (f: Filter) => void }) {
  const tabs: { id: Filter; label: string; icon: LucideIcon }[] = [
    { id: "all", label: "All", icon: LayoutGrid },
    ...(Object.keys(CATEGORY) as LinkCategory[]).map((id) => ({ id, ...CATEGORY[id] })),
  ];
  return (
    <div className="lk-tabs" role="group" aria-label="Filter links">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" className="lk-tab" aria-pressed={value === id} onClick={() => onChange(id)}>
          <Icon size={16} strokeWidth={2} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * The whole page: palm-sky backdrop, paper sheet, header, profile, tabs, rows, tiles.
 * The sheet is pinned to the light scheme because the paper is a light raster.
 */
export function LinkPage({ spec }: { spec: LinkPageSpec }) {
  const [filter, setFilter] = useState<Filter>("all");
  const items = filter === "all" ? spec.items : spec.items.filter((i) => i.category === filter);
  const stage = { "--lk-backdrop": `url("${palmSky}")`, "--lk-paper": `url("${paper}")` } as CSSProperties;

  return (
    <div className="lk-stage" style={stage} data-figma={LINK_NODES.Stage[1]}>
      <div className="lk-sheet" data-scheme="light" data-figma={LINK_NODES.Sheet[1]}>
        <header className="lk-header">
          <span className="lk-header__wordmark">{spec.wordmark}</span>
          <nav className="lk-header__nav" aria-label="Site">
            {spec.nav.map((n) => (
              <Linkish key={n.label} href={n.href} className="lk-header__link">
                {n.label}
              </Linkish>
            ))}
            <Linkish href={spec.follow.href} className="lk-follow">
              {spec.follow.label}
            </Linkish>
          </nav>
        </header>

        <LinkProfile profile={spec.profile} />
        <LinkTabs value={filter} onChange={setFilter} />

        <div className="lk-rows" data-figma={LINK_NODES.LinkRow[1]}>
          {items.map((item) => (
            <LinkRow key={item.title} item={item} />
          ))}
        </div>

        <div className="lk-tiles">
          {spec.tiles.map((t) => (
            <LinkTile key={t.label} tile={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
