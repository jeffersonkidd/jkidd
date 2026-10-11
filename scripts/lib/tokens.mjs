import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));

export const palette = JSON.parse(readFileSync(`${root}tokens/jkxo-tertiary.json`, "utf8"));
export const tokens = JSON.parse(readFileSync(`${root}tokens/jkidd.tokens.json`, "utf8"));

/** The six Scheme modes, in Figma's order. */
export const SCHEMES = Object.keys(palette.schemes);

/** The five post types, without the $description key. */
export const POST_TYPES = Object.fromEntries(
  Object.entries(tokens.postTypes).filter(([k]) => !k.startsWith("$")),
);

/** Genres (POSTCARDS.md §4), without the $description key. */
export const GENRES = Object.fromEntries(
  Object.entries(tokens.genres ?? {}).filter(([k]) => !k.startsWith("$")),
);

export { root };
