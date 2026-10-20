import { STAGE_CANVAS, STAGE_SQUARE } from "./StagePostcard";
import { LIBRARIES_CANVAS } from "./LibrariesPostcard";
import { sheetSvg } from "./sheetSvg";

/** The stage postcard as a standalone vector SVG (see sheetSvg). */
export const stageSvg = (card: HTMLElement) =>
  sheetSvg(card, { canvas: STAGE_CANVAS, square: STAGE_SQUARE, drawing: "svg.jk-stage__drawing", strip: ".jk-stage__title span", id: "stage" });

/** The library pipeline card as a standalone vector SVG, on the stage's paper. */
export const librariesSvg = (card: HTMLElement) =>
  sheetSvg(card, { canvas: LIBRARIES_CANVAS, square: STAGE_SQUARE, drawing: "svg.jk-libraries__drawing", strip: ".jk-libraries__strip span", id: "libraries" });
