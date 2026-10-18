/**
 * Find room for the shapes. The frame never moves and the content is never covered, so a shape
 * goes only where the measured card is empty; if there's no room, it's dropped and says so.
 *
 * Pure: the browser measures the card (DressedPostcard), this decides. No runtime imports.
 */

export type Rect = { x: number; y: number; w: number; h: number };
export type Box = { id: string; w: number; h: number; prefer: [number, number] };
export type Placement = { x: number; y: number; scale: number } | null;

/** Sizes a shape may shrink to before it gives up, largest first. */
export const SCALES = [1, 0.8, 0.64];

const hits = (a: Rect, b: Rect, gap: number) =>
  a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;

/**
 * Place boxes in order, each at the free spot nearest its preferred point (a fraction of the
 * canvas). Placed boxes become obstacles for the next.
 */
export function place(
  boxes: Box[],
  obstacles: Rect[],
  canvas: { width: number; height: number },
  bounds: Rect,
  { gap = 28, step = 12 } = {},
): Record<string, Placement> {
  const taken = [...obstacles];
  const out: Record<string, Placement> = {};
  for (const b of boxes) {
    const px = b.prefer[0] * canvas.width;
    const py = b.prefer[1] * canvas.height;
    let bestAt = null as Placement;
    // Full size anywhere beats a smaller one nearer the preferred spot.
    for (const scale of SCALES) {
      const [w, h] = [b.w * scale, b.h * scale];
      let bestD = Infinity;
      for (let y = bounds.y; y + h <= bounds.y + bounds.h; y += step) {
        for (let x = bounds.x; x + w <= bounds.x + bounds.w; x += step) {
          const d = (x + w / 2 - px) ** 2 + (y + h / 2 - py) ** 2;
          if (d >= bestD) continue;
          if (taken.some((o) => hits({ x, y, w, h }, o, gap))) continue;
          bestD = d;
          bestAt = { x, y, scale };
        }
      }
      if (bestAt) break;
    }
    out[b.id] = bestAt;
    if (bestAt) taken.push({ x: bestAt.x, y: bestAt.y, w: b.w * bestAt.scale, h: b.h * bestAt.scale });
  }
  return out;
}
