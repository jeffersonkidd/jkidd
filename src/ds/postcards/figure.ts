import FRAMES from "../../../vendor/architects-notebook/figure-frames.json";

/**
 * The Architect's Notebook stick figure (Figma gWBVp3oNqUv7ymJXNORuM0, Figures 37:2),
 * for the cartoon postcard. Frames are the kit's own, vendored by `pnpm notebook`:
 * 12 drawings a loop, shown on twos at 24 fps (12 drawings a second), and the body
 * moves by what the planted foot swept back (dx), so the feet never skate.
 *
 * Everything here is a pure function of the drawing number, so the live preview
 * and the video export land on the same pose at the same moment.
 */

export const FIGURE_CYCLES = ["walk", "run", "wave"] as const;
export type FigureCycle = (typeof FIGURE_CYCLES)[number];
/** boil: the line redraws every drawing (the kit's hand-drawn shimmer). still: one line, only the pose moves. */
export type FigureLine = "boil" | "still";
export type FigureSpec = { cycle: FigureCycle; line: FigureLine };

export const FIGURE_DRAWINGS_PER_SECOND = 12;

const [, , VB_W, VB_H] = FRAMES.viewBox.split(" ").map(Number);
/** Feet rest on this line of the kit's viewBox (GROUND_Y in gen-figure-anim.js). */
const VB_GROUND = 104;
/** Kit pen is 1.6; heavier here so the figure holds next to the front's thick ink and survives the 320px thumbnail. */
export const FIGURE_PEN = 2.4;

type Frame = { boil: string[]; still: string[]; dx: number };
const LOOPS = FRAMES.frames as Record<FigureCycle, Frame[]>;

export type FigurePose = {
  /** Path data in the kit's viewBox. */
  paths: string[];
  /** Top-left of the figure on the canvas, in canvas px. */
  x: number;
  y: number;
  /** Canvas px per viewBox unit. */
  scale: number;
  width: number;
  height: number;
};

/** Where the figure is and what it looks like at a given drawing, on a canvas of the given size. */
export function figurePose(
  spec: FigureSpec,
  drawing: number,
  canvas: { width: number; height: number },
  { height = 290, ground = 56 }: { height?: number; ground?: number } = {},
): FigurePose {
  const loop = LOOPS[spec.cycle];
  const n = loop.length;
  const i = ((drawing % n) + n) % n;
  const scale = height / VB_H;
  const width = VB_W * scale;
  const y = canvas.height - ground - VB_GROUND * scale;

  const travel = loop.reduce((s, f) => s + f.dx, 0);
  let x: number;
  if (!travel) {
    x = (canvas.width - width) / 2;
  } else {
    // whole loops so far, plus this loop's steps; exit right, re-enter from the left
    const sweep = (Math.floor(drawing / n) * travel + loop.slice(0, i + 1).reduce((s, f) => s + f.dx, 0)) * scale;
    x = (sweep % (canvas.width + width)) - width;
  }
  return { paths: loop[i][spec.line], x, y, scale, width, height: VB_H * scale };
}

/**
 * Drawings in one seamless take: one crossing for a cycle that travels (off the left
 * edge to off the right), four loops for one that stands still.
 */
export function figureTake(spec: FigureSpec, canvas: { width: number; height: number }, opts?: { height?: number }): number {
  const loop = LOOPS[spec.cycle];
  const travel = loop.reduce((s, f) => s + f.dx, 0);
  if (!travel) return loop.length * 4;
  const scale = (opts?.height ?? 290) / VB_H;
  const distance = canvas.width + VB_W * scale;
  let drawing = 0;
  let swept = 0;
  while (swept < distance) swept += loop[drawing++ % loop.length].dx * scale;
  return drawing;
}
