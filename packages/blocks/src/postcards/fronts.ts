import { GENRE_RIBBONS } from "@jkidd/tokens";
import SPEC from "./front-spec.md?raw";
import miami from "../assets/fronts/miami.jpg";
import buildCrew from "../assets/fronts/build-crew.jpg";
import western from "../assets/fronts/western.jpg";
import spy from "../assets/fronts/spy.jpg";
import greetingsWestern from "../assets/fronts/greetings-western.jpg";
import treasure from "../assets/fronts/treasure.jpg";
import pirate from "../assets/fronts/pirate.jpg";
import greetingsBuild from "../assets/fronts/greetings-build-in-public.jpg";
import buildWestern from "../assets/fronts/build-in-public-western.jpg";
import christmas from "../assets/fronts/christmas.jpg";
import space from "../assets/fronts/space.jpg";
import desert from "../assets/fronts/desert.jpg";

/**
 * The fronts of the picture postcard (JKidd - Workbench, Postcard Image Algo 147:933), one
 * of the postcard's two types; the archetype Postcard is the other.
 *
 * Fronts come in series. A series is one press: a master, the fronts drawn from it, and
 * the inks read off them (`--jk-genre-picture-<series>-*`, sampled with `pnpm
 * front-inks`). A front's ribbons are its series' ribbons, never another's.
 * Fronts are generated images, not layouts: a series master plus the production
 * spec, with only the narrative swapped. The page is one flattened frame, so the
 * gallery here is cropped from it (≈1468×956, 3:2 like the 1536×1024 renders).
 */

/**
 * The production spec, verbatim from 147:933. It's a long ChatGPT conversation about keeping
 * the fronts consistent, distilled into one transferable document; the fronts themselves were
 * drawn by a ChatGPT image model (which one isn't recorded). Generate new fronts with the same.
 */
export const FRONT_SPEC: string = SPEC;

/** The series, in gallery order. Each has its own inks in the tokens (picture-<id>). */
export const SERIES = {
  western: { name: "Western", master: "western" },
  "build-in-public": { name: "Build in Public", master: "greetings-build-in-public" },
  miami: { name: "Miami", master: "miami" },
  spy: { name: "Heist", master: "spy" },
  treasure: { name: "Treasure", master: "treasure" },
  pirate: { name: "Pirate", master: "pirate" },
  christmas: { name: "Christmas", master: "christmas" },
  space: { name: "Space", master: "space" },
} as const;
export type SeriesId = keyof typeof SERIES;
export const SERIES_IDS = Object.keys(SERIES) as SeriesId[];

/** A series' ribbon inks, from its genre in the tokens. */
export const seriesRibbons = (series: SeriesId): readonly string[] => GENRE_RIBBONS[`picture-${series}`];

export type Front = {
  id: string;
  name: string;
  image: string;
  series: SeriesId;
  /** Same theme, different press: the inks don't match the master. Left out of the ink sample; regenerate it from the master. */
  drifted?: string;
  /** The big letters, as printed. null: an art-only front, the scene is the whole card. */
  lettering: string | null;
  /** A "Greetings from" script line over the letters. Kept from the master, never added. */
  greeting: boolean;
  /** What the card shows, for the gallery and alt text. */
  theme: string;
};

/** The best-of gallery, in the order it sits on 147:933 (left column, then right). */
export const FRONTS: Front[] = [
  { id: "miami", series: "miami", name: "Miami", image: miami, lettering: "JEFFERSON KIDD", greeting: false, theme: "Miami: white suit, palms, flamingo, speedboat, a case of cash" },
  { id: "build-crew", series: "build-in-public", name: "Build crew", image: buildCrew, lettering: "JEFFERSON KIDD", greeting: false, theme: "Building in public: laptops, a rocket, social icons over the city" },
  { id: "western", series: "western", name: "Western", image: western, lettering: "JEFFERSON KIDD", greeting: false, theme: "Western: gunslinger, stagecoach, wanted poster, desert sun" },
  { id: "spy", series: "spy", name: "Heist", image: spy, lettering: "JEFFERSON KIDD", greeting: false, theme: "Heist: dark suit, vault, sports car, stacks of cash" },
  { id: "greetings-western", series: "western", name: "Greetings, western", image: greetingsWestern, lettering: "JEFFERSON KIDD", greeting: true, theme: "Western, with the Greetings from script" },
  { id: "treasure", series: "treasure", name: "Treasure", image: treasure, lettering: "JEFFERSON KIDD", greeting: false, theme: "Young adventurer: forest river, treasure chest" },
  { id: "pirate", series: "pirate", name: "Pirate", image: pirate, lettering: "JEFFERSON KIDD", greeting: false, theme: "Pirate: blunderbuss, galleon, cove, a UFO" },
  { id: "greetings-build-in-public", series: "build-in-public", name: "Greetings, build in public", image: greetingsBuild, lettering: "BUILD IN PUBLIC", greeting: true, theme: "Building in public, with the Greetings from script" },
  { id: "build-in-public-western", series: "western", name: "#Build in public, frontier", image: buildWestern, lettering: "#BUILD IN PUBLIC", greeting: false, theme: "Frontier town: saloon, mesa, riders, a steam train in the letters", drifted: "Hotter orange and a brighter teal than the western master" },
  { id: "christmas", series: "christmas", name: "Christmas", image: christmas, lettering: "JEFFERSON KIDD", greeting: false, theme: "Christmas: Santa, snowman, tree, a snowy village" },
  { id: "space", series: "space", name: "Space", image: space, lettering: "JEFFERSON KIDD", greeting: false, theme: "Space: astronaut, rocket, alien, flying saucer" },
  { id: "desert", series: "western", name: "Desert", image: desert, lettering: null, greeting: false, theme: "Desert sunset: saguaro, prickly pear, red rock, teal mountains" },
];

/**
 * The default master: the orange western. Its inks are the ones the spec names
 * (orange, cream, cyan, teal, brown, black, olive, accent red).
 */
export const DEFAULT_MASTER = "western";

/** The narrative: the only things the spec lets change (Priority 3, Typography). */
export type FrontBrief = {
  lettering: string;
  /** The one idea (Principle 5). Told in pictures on the front, and set live by PicturePostcard. */
  story: string;
  theme: string;
  scenery: string;
  props: string;
  storytelling: string;
  icons: string;
};

export const BRIEF_FIELDS: { key: keyof FrontBrief; label: string }[] = [
  { key: "lettering", label: "Lettering" },
  { key: "story", label: "Story" },
  { key: "theme", label: "Theme" },
  { key: "scenery", label: "Scenery" },
  { key: "props", label: "Props" },
  { key: "storytelling", label: "Environmental storytelling" },
  { key: "icons", label: "Icons inside lettering" },
];

/** Spec + brief, ready to paste into an image model with the master attached. Empty fields are left out. */
export function frontPrompt(master: Front, brief: FrontBrief): string {
  const lines = BRIEF_FIELDS.filter(({ key }) => brief[key].trim()).map(({ key, label }) => {
    const value = brief[key].trim();
    if (key === "lettering") return `- LETTERING: "${value.toUpperCase()}"`;
    if (key === "story") return `- STORY, TOLD IN PICTURES ONLY. DO NOT WRITE IT ON THE CARD: ${value}`;
    return `- ${label.toUpperCase()}: ${value}`;
  });
  const greeting = master.greeting ? ` KEEP THE "GREETINGS FROM" SCRIPT LINE EXACTLY AS IN THE MASTER.` : "";
  const intro = master.lettering
    ? `THE ATTACHED IMAGE IS THE SERIES MASTER. ITS LETTERING READS "${master.lettering}".${greeting}`
    : "THE ATTACHED IMAGE IS THE SERIES MASTER. IT HAS NO LETTERING: KEEP THE CARD FREE OF ANY TEXT.";
  return [
    FRONT_SPEC.trim(),
    "---",
    "# THIS POSTCARD",
    intro,
    `REPLACE ONLY THE FOLLOWING:\n\n${lines.join("\n")}`,
  ].join("\n\n");
}

/** The spec's checklist, for marking a generated front off against its master. */
export const FRONT_QC = FRONT_SPEC.split("\n")
  .filter((l) => l.startsWith("- WOULD"))
  .map((l) => l.slice(2));
