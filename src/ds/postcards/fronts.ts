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

/**
 * The cartoon side of the postcard, for silly days (JKidd - Workbench, Postcard Image Algo
 * 147:933). It sits beside the archetypes and illustrated postcards, never in place of them.
 * Fronts are generated images, not layouts: a series master plus the production
 * spec, with only the narrative swapped. The page is one flattened frame, so the
 * gallery here is cropped from it (≈1468×956, 3:2 like the 1536×1024 renders).
 */

/** The production spec, verbatim from 147:933. */
export const FRONT_SPEC: string = SPEC;

export type Front = {
  id: string;
  name: string;
  image: string;
  /** The big letters, as printed. */
  lettering: string;
  /** A "Greetings from" script line over the letters. Kept from the master, never added. */
  greeting: boolean;
  /** What the card shows, for the gallery and alt text. */
  theme: string;
};

/** The best-of gallery, in the order it sits on 147:933 (left column, then right). */
export const FRONTS: Front[] = [
  { id: "miami", name: "Miami", image: miami, lettering: "JEFFERSON KIDD", greeting: false, theme: "Miami: white suit, palms, flamingo, speedboat, a case of cash" },
  { id: "build-crew", name: "Build crew", image: buildCrew, lettering: "JEFFERSON KIDD", greeting: false, theme: "Building in public: laptops, a rocket, social icons over the city" },
  { id: "western", name: "Western", image: western, lettering: "JEFFERSON KIDD", greeting: false, theme: "Western: gunslinger, stagecoach, wanted poster, desert sun" },
  { id: "spy", name: "Heist", image: spy, lettering: "JEFFERSON KIDD", greeting: false, theme: "Heist: dark suit, vault, sports car, stacks of cash" },
  { id: "greetings-western", name: "Greetings, western", image: greetingsWestern, lettering: "JEFFERSON KIDD", greeting: true, theme: "Western, with the Greetings from script" },
  { id: "treasure", name: "Treasure", image: treasure, lettering: "JEFFERSON KIDD", greeting: false, theme: "Young adventurer: forest river, treasure chest" },
  { id: "pirate", name: "Pirate", image: pirate, lettering: "JEFFERSON KIDD", greeting: false, theme: "Pirate: blunderbuss, galleon, cove, a UFO" },
  { id: "greetings-build-in-public", name: "Greetings, build in public", image: greetingsBuild, lettering: "BUILD IN PUBLIC", greeting: true, theme: "Building in public, with the Greetings from script" },
  { id: "build-in-public-western", name: "#Build in public, frontier", image: buildWestern, lettering: "#BUILD IN PUBLIC", greeting: false, theme: "Frontier town: saloon, mesa, riders, a steam train in the letters" },
  { id: "christmas", name: "Christmas", image: christmas, lettering: "JEFFERSON KIDD", greeting: false, theme: "Christmas: Santa, snowman, tree, a snowy village" },
  { id: "space", name: "Space", image: space, lettering: "JEFFERSON KIDD", greeting: false, theme: "Space: astronaut, rocket, alien, flying saucer" },
];

/**
 * The default master: the orange western. Its inks are the ones the spec names
 * (orange, cream, cyan, teal, brown, black, olive, accent red).
 */
export const DEFAULT_MASTER = "western";

/** The narrative: the only things the spec lets change (Priority 3, Typography). */
export type FrontBrief = {
  lettering: string;
  theme: string;
  scenery: string;
  props: string;
  storytelling: string;
  icons: string;
};

export const BRIEF_FIELDS: { key: keyof FrontBrief; label: string }[] = [
  { key: "lettering", label: "Lettering" },
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
    return `- ${label.toUpperCase()}: ${key === "lettering" ? `"${value.toUpperCase()}"` : value}`;
  });
  const greeting = master.greeting ? ` KEEP THE "GREETINGS FROM" SCRIPT LINE EXACTLY AS IN THE MASTER.` : "";
  return [
    FRONT_SPEC.trim(),
    "---",
    "# THIS POSTCARD",
    `THE ATTACHED IMAGE IS THE SERIES MASTER. ITS LETTERING READS "${master.lettering}".${greeting}`,
    `REPLACE ONLY THE FOLLOWING:\n\n${lines.join("\n")}`,
  ].join("\n\n");
}

/** The spec's checklist, for marking a generated front off against its master. */
export const FRONT_QC = FRONT_SPEC.split("\n")
  .filter((l) => l.startsWith("- WOULD"))
  .map((l) => l.slice(2));
