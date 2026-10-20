import { GENRE_RIBBONS } from "@jkidd/tokens";
import SPEC from "./front-spec.md?raw";
import miami from "../assets/fronts/miami.jpg";
import cosmopolJk from "../assets/fronts/cosmopol-jk.jpg";
import westernJk from "../assets/fronts/western-jk.jpg";
import spy from "../assets/fronts/spy.jpg";
import westernJkGreetings from "../assets/fronts/western-jk-greetings.jpg";
import treasure from "../assets/fronts/treasure.jpg";
import pirate from "../assets/fronts/pirate.jpg";
import cosmopolMaster from "../assets/fronts/cosmopol-master.jpg";
import westernBuildWarped from "../assets/fronts/western-build-in-public-warped.jpg";
import christmas from "../assets/fronts/christmas.jpg";
import space from "../assets/fronts/space.jpg";
import westernPlate from "../assets/fronts/western-plate.jpg";
import cosmopolLayer from "../assets/fronts/cosmopol-layer.jpg";
import cosmopolPlate from "../assets/fronts/cosmopol-plate.jpg";
import westernMaster from "../assets/fronts/western-master.jpg";
import westernBuildBadges from "../assets/fronts/western-build-in-public-badges.jpg";
import westernPrinted from "../assets/fronts/western-printed.jpg";

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
  western: { name: "Western", master: "western-master" },
  cosmopol: { name: "Cosmopol", master: "cosmopol-master" },
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
  /** How much of the press (PicturePostcard) to print over a front that came back too clean, 0–1.
   *  Generated fronts carry their own grain, so it's 0 for them; the plate, reduced from the
   *  western master, lost all of it. Measured against the master's sky, not eyeballed. */
  press?: number;
};

/** The best-of gallery, in the order it sits on 147:933 (left column, then right). */
export const FRONTS: Front[] = [
  { id: "miami", series: "miami", name: "Miami", image: miami, lettering: "JEFFERSON KIDD", greeting: false, theme: "Miami: white suit, palms, flamingo, speedboat, a case of cash" },
  { id: "cosmopol-jk", series: "cosmopol", name: "Build crew", image: cosmopolJk, lettering: "JEFFERSON KIDD", greeting: false, theme: "Building in public: laptops, a rocket, social icons over the city" },
  { id: "western-jk", series: "western", name: "Western", image: westernJk, lettering: "JEFFERSON KIDD", greeting: false, theme: "Western: gunslinger, stagecoach, wanted poster, desert sun" },
  { id: "spy", series: "spy", name: "Heist", image: spy, lettering: "JEFFERSON KIDD", greeting: false, theme: "Heist: dark suit, vault, sports car, stacks of cash" },
  { id: "western-jk-greetings", series: "western", name: "Greetings, western", image: westernJkGreetings, lettering: "JEFFERSON KIDD", greeting: true, theme: "Western, with the Greetings from script" },
  { id: "treasure", series: "treasure", name: "Treasure", image: treasure, lettering: "JEFFERSON KIDD", greeting: false, theme: "Young adventurer: forest river, treasure chest" },
  { id: "pirate", series: "pirate", name: "Pirate", image: pirate, lettering: "JEFFERSON KIDD", greeting: false, theme: "Pirate: blunderbuss, galleon, cove, a UFO" },
  { id: "cosmopol-master", series: "cosmopol", name: "Greetings, build in public", image: cosmopolMaster, lettering: "BUILD IN PUBLIC", greeting: true, theme: "Building in public, with the Greetings from script" },
  { id: "western-build-in-public-warped", series: "western", name: "#Build in public, frontier", image: westernBuildWarped, lettering: "#BUILD IN PUBLIC", greeting: false, theme: "Frontier town: saloon, mesa, riders, a steam train in the letters", drifted: "Hotter orange and a brighter teal than the western master" },
  { id: "christmas", series: "christmas", name: "Christmas", image: christmas, lettering: "JEFFERSON KIDD", greeting: false, theme: "Christmas: Santa, snowman, tree, a snowy village" },
  { id: "space", series: "space", name: "Space", image: space, lettering: "JEFFERSON KIDD", greeting: false, theme: "Space: astronaut, rocket, alien, flying saucer" },
  { id: "western-plate", series: "western", name: "Desert plate", image: westernPlate, lettering: null, greeting: false, theme: "Desert sunset: saguaro, prickly pear, red rock, teal mountains", press: 1 },
  { id: "cosmopol-layer", series: "cosmopol", name: "Build in public, lettered", image: cosmopolLayer, lettering: "JEFFERSON KIDD", greeting: false, theme: "Building in public: a rocket, coders at laptops, whiteboards, hearts and a lightbulb in the letters, over the dusk skyline", press: 0.75 },
  { id: "cosmopol-plate", series: "cosmopol", name: "Cosmopol plate", image: cosmopolPlate, lettering: null, greeting: false, theme: "Dusk skyline: towers, gears and smoke under pink and teal clouds", press: 1 },
  { id: "western-master", series: "western", name: "#Build in public, desert", image: westernMaster, lettering: "#BUILD IN PUBLIC", greeting: false, theme: "The desert lettered #BUILD IN PUBLIC: a steam train, saguaros, a mission and snowy peaks in the letters, over red rock, saguaro and prickly pear" },
  { id: "western-build-in-public-badges", series: "western", name: "#Build in public, desert badges", image: westernBuildBadges, lettering: "#BUILD IN PUBLIC", greeting: false, theme: "The lettered desert with build-in-public badges round the sky: Building daily, Progress not perfection, Built out loud, a 21-day build streak and a Day 01 stamp" },
  { id: "western-printed", series: "western", name: "Desert, sunlit", image: westernPrinted, lettering: null, greeting: false, theme: "Desert noon: a rayed sun, a low orange sun, saguaro, prickly pear, red rock and teal mountains" },
];

/**
 * The default master: the Western series' master, the #BUILD IN PUBLIC desert. The plate
 * (western-plate) was extracted from it: its lettering taken out (western-printed),
 * then its print. The series' inks were first read from the gunslinger card (western-jk) and
 * match this one's ink, cream and orange within a few points.
 */
export const DEFAULT_MASTER = "western-master";

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
