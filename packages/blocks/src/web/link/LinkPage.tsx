import { useState } from "react";
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
import { CommandIcon, LinkHeader, LinkProfile, LinkRow, LinkTile, Sheet, Stage, TabBar, type TabSpec } from "@jkidd/ui/web";
import palmSky from "@jkidd/ui/imagery/stock/palm-sky-16x9.jpg";
import palmSkyTall from "@jkidd/ui/imagery/stock/palm-sky-2x3.jpg";
import paper from "@jkidd/ui/imagery/stock/paper-2x3.jpg";
import { LINK_NODES } from "@jkidd/core";

/**
 * The link-in-bio page (JKidd - Blocks, Link Page): a paper sheet on the palm sky, put
 * together from the web lane of @jkidd/ui (the controls, and the Stage, Sheet, Link
 * Header, Link Profile, Tab Bar, Link Row and Link Tile). What's the
 * block's own: the spec, the categories and socials with their icons, the filter, and
 * the art. Figma draws it at web size, so sizes match it 1:1. First sketched in JKidd -
 * Workbench (Linktrees, 120:1335).
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

type Filter = "all" | LinkCategory;

const TABS: TabSpec<Filter>[] = [
  { id: "all", label: "All", icon: <LayoutGrid size={16} strokeWidth={2} aria-hidden /> },
  ...(Object.keys(CATEGORY) as LinkCategory[]).map((id) => {
    const { label, icon: Icon } = CATEGORY[id];
    return { id, label, icon: <Icon size={16} strokeWidth={2} aria-hidden /> };
  }),
];

/** Link Row draws Studio with the Command glyph; the other categories reuse their tab icon. */
function rowKicker(category: LinkCategory) {
  const { label, icon: Icon } = CATEGORY[category];
  return { label, icon: category === "studio" ? <CommandIcon /> : <Icon size={16} strokeWidth={2} aria-hidden /> };
}

/** The whole page: palm-sky backdrop, paper sheet, header, profile, tabs, rows, tiles. */
export function LinkPage({ spec }: { spec: LinkPageSpec }) {
  const [filter, setFilter] = useState<Filter>("all");
  const items = filter === "all" ? spec.items : spec.items.filter((i) => i.category === filter);
  const { profile } = spec;

  return (
    <Stage backdrop={palmSky} narrow={palmSkyTall}>
      <Sheet paper={paper}>
        <LinkHeader wordmark={spec.wordmark} nav={spec.nav} follow={spec.follow} />
        <LinkProfile
          name={profile.name}
          tags={profile.tags}
          bio={profile.bio}
          avatar={profile.avatar}
          socials={profile.socials.map(({ kind, href }) => {
            const { label, icon: Icon } = SOCIAL[kind];
            return { label, href, icon: <Icon size={18} strokeWidth={2} aria-hidden /> };
          })}
        />
        <TabBar tabs={TABS} value={filter} onChange={setFilter} label="Filter links" />

        <div className="lk-rows" data-figma={LINK_NODES.LinkRow[1]}>
          {items.map((item) => (
            <LinkRow key={item.title} {...item} kicker={rowKicker(item.category)} />
          ))}
        </div>

        <div className="lk-tiles" data-figma={LINK_NODES.LinkTile[1]}>
          {spec.tiles.map((t) => (
            <LinkTile key={t.label} kicker={{ label: t.kicker, icon: <CommandIcon /> }} label={t.label} href={t.href} />
          ))}
        </div>
      </Sheet>
    </Stage>
  );
}
