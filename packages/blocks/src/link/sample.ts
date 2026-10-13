import type { LinkPageSpec } from "./LinkPage";
import portrait from "../assets/profile/jeffersonkidd-portrait.jpg";

/**
 * The link page's copy, from JKidd - Workbench (Linktrees, 102:551). Profile, nav and
 * tags: Frame 30 (120:1335). Sections and tiles: the reference mockup on the same page
 * (102:584), since Frame 30 repeats one placeholder row. No hrefs: none are recorded yet
 * (JKIDD.md §4, link-in-bio site; CONTENT-SYSTEM.md §9 handles).
 */
export const LINK_SAMPLE: LinkPageSpec = {
  wordmark: "Jefferson KIDD",
  nav: [{ label: "Blog" }, { label: "Shop" }],
  follow: { label: "Follow" },
  profile: {
    name: "Jefferson Kidd",
    avatar: portrait,
    tags: ["Monofly", "Design Systems", "Music"],
    bio: "Projects, experiments, products, music, and an ongoing exploration of what’s possible",
    socials: [{ kind: "facebook" }, { kind: "instagram" }, { kind: "youtube" }, { kind: "github" }, { kind: "message" }],
  },
  items: [
    {
      category: "studio",
      title: "Creative Work",
      description: "Projects, experiments, products, music, and an ongoing exploration of what’s possible.",
      tags: ["Monofly", "Design Systems", "Music", "Experiments"],
    },
    {
      category: "blog",
      title: "Ideas and Writing",
      description: "Articles, essays, journal entries, tutorials, and observations from the creative process.",
      tags: ["Design", "Code", "Music", "Process", "Education"],
    },
    {
      category: "shop",
      title: "Products and Releases",
      description: "Design assets, digital products, music releases, merchandise, and other things you can buy.",
      tags: ["Templates", "Music", "Tools", "Merch", "Bundles"],
    },
    {
      category: "support",
      title: "Support the Work",
      description: "Memberships, tips, and other ways to help keep the creative practice going.",
      tags: ["Membership", "Behind the Scenes", "Early Access"],
    },
  ],
  tiles: [
    { kicker: "Contact", label: "Get in touch" },
    { kicker: "About", label: "The story" },
    { kicker: "Newsletter", label: "Join the list" },
  ],
};
