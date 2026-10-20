import type { ReactNode } from "react";
import { LINK_NODES } from "@jkidd/core";
import { Avatar, ChevronRightIcon, IconButton, IconKicker, Linkish, PillButton, Tab, Tag } from "./Controls";

/**
 * The link compositions (JKidd - Postcards, Link page), built from the web controls.
 * They take their icons and copy as props; what a category or a social is belongs to
 * the block that uses them.
 */

export type KickerSpec = { icon: ReactNode; label: string };
export type NavLink = { label: string; href?: string };

function Tags({ tags }: { tags: string[] }) {
  return (
    <span className="web-tags">
      {tags.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
    </span>
  );
}

export function LinkHeader({ wordmark, nav, follow }: { wordmark: string; nav: NavLink[]; follow: NavLink }) {
  return (
    <header className="web-link-header" data-figma={LINK_NODES.LinkHeader[1]}>
      <span className="web-link-header__wordmark">{wordmark}</span>
      <nav className="web-link-header__nav" aria-label="Site">
        {nav.map((n) => (
          <PillButton key={n.label} href={n.href}>
            {n.label}
          </PillButton>
        ))}
        <PillButton href={follow.href} variant="outlined">
          {follow.label}
        </PillButton>
      </nav>
    </header>
  );
}

export type ProfileSocial = { label: string; icon: ReactNode; href?: string };

export function LinkProfile({ name, tags, bio, avatar, socials }: { name: string; tags: string[]; bio: string; avatar?: string; socials: ProfileSocial[] }) {
  return (
    <section className="web-link-profile" aria-label="Profile" data-figma={LINK_NODES.LinkProfile[1]}>
      <Avatar src={avatar} />
      <div className="web-link-profile__text">
        <h1 className="web-link-profile__name">{name}</h1>
        <Tags tags={tags} />
        <p className="web-link-profile__bio">{bio}</p>
        <span className="web-link-profile__socials">
          {socials.map((s) => (
            <IconButton key={s.label} href={s.href} label={s.label}>
              {s.icon}
            </IconButton>
          ))}
        </span>
      </div>
    </section>
  );
}

export type TabSpec<T extends string> = { id: T; label: string; icon?: ReactNode };

export function TabBar<T extends string>({ tabs, value, onChange, label }: { tabs: TabSpec<T>[]; value: T; onChange: (id: T) => void; label: string }) {
  return (
    <div className="web-tab-bar" role="group" aria-label={label} data-figma={LINK_NODES.TabBar[1]}>
      {tabs.map((t) => (
        <Tab key={t.id} pressed={value === t.id} onClick={() => onChange(t.id)} icon={t.icon}>
          {t.label}
        </Tab>
      ))}
    </div>
  );
}

export type LinkRowSpec = { kicker: KickerSpec; title: string; description: string; tags: string[]; href?: string; image?: string };

/** Link Row. Wraps to a stacked card below ~560px, as the Figma flex-wrap does. Without an image the media shows the mockup's dark placeholder. */
export function LinkRow({ kicker, title, description, tags, href, image }: LinkRowSpec) {
  return (
    <Linkish href={href} className="web-link-row">
      <span className="web-link-row__media" data-empty={!image || undefined}>
        {image ? <img src={image} alt="" /> : null}
      </span>
      <span className="web-link-row__text">
        <span className="web-link-row__title-block">
          <IconKicker icon={kicker.icon} label={kicker.label} />
          <span className="web-link-row__title">{title}</span>
          <span className="web-link-row__desc">{description}</span>
        </span>
        <Tags tags={tags} />
      </span>
      {/* Drawn as the Icon Button, but inert: the whole row is the link. */}
      <span className="web-link-row__go" aria-hidden>
        <ChevronRightIcon />
      </span>
    </Linkish>
  );
}

export function LinkTile({ kicker, label, href }: { kicker: KickerSpec; label: string; href?: string }) {
  return (
    <Linkish href={href} className="web-link-tile">
      <IconKicker icon={kicker.icon} label={kicker.label} />
      <span className="web-link-tile__label">{label}</span>
    </Linkish>
  );
}
