import EMBLEM_DATA from "../vendor/emblem/emblem.json";

/**
 * The emblem: the winged seahorse badge that has been J.F. Kidd's logo, favicon and
 * avatar (Figma ADhu9noVbgFbtapMZivOHw, Illustrations › Logo Assets 425:3522).
 * Geometry is the master's own, flattened by `pnpm emblem` into layers in paint
 * order, so each can take a token:
 *
 *   field  the disc       band  the ring, outlined in ink
 *   body   the seahorse   halo  the back feathers, in ink with a field-coloured outline
 *                        wing  the front feathers, over the halo
 *
 * The halo's outline is what parts the wing from the body and the ring. Over an
 * opaque field it paints; without one it has to knock out instead (Emblem does this
 * with a mask), or the wing runs into the ring lines.
 */
export const EMBLEM = EMBLEM_DATA;

/** What the emblem stands for, for its accessible name. */
export const EMBLEM_LABEL = "Jefferson Kidd";
