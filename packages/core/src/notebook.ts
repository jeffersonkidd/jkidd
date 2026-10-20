import SHAPES from "../vendor/architects-notebook/shapes.json";

/**
 * Shapes from the Architect's Notebook kit (Figma gWBVp3oNqUv7ymJXNORuM0), as the kit
 * drew them: rough.js line work in each shape's own box, stroked with currentColor.
 * Vendored by `pnpm notebook`; only the ones a card uses are taken.
 */
export type NotebookPath = {
  d: string;
  /** The kit's stroke width: 1.6 is its pen, 1.1 its thin pen, 0 a solid fill. */
  pen: number;
  dash?: string;
  /** Filled with the ink, not stroked. */
  solid?: boolean;
};
export type NotebookShape = { w: number; h: number; paths: NotebookPath[] };
export type NotebookShapeName = keyof typeof SHAPES;

export const NOTEBOOK_SHAPES = SHAPES as Record<NotebookShapeName, NotebookShape>;
