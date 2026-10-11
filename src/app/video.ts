import { toCanvas } from "html-to-image";
import { FIGURE_DRAWINGS_PER_SECOND, FIGURE_PEN, figurePose, figureTake, type FigureSpec } from "../ds";

/** Video is 24 fps; the figure is drawn on twos, so each drawing holds for two frames. */
const FPS = 24;

/** Best first. MP4 posts everywhere; Chrome records it natively from v126, older browsers fall back to WebM. */
const TYPES = ["video/mp4;codecs=avc1.640028", "video/mp4", "video/webm;codecs=vp9", "video/webm"];

export const videoType = () =>
  typeof MediaRecorder === "undefined" ? undefined : TYPES.find((t) => MediaRecorder.isTypeSupported(t));

const hasClass = (n: Node, ...names: string[]) => n instanceof Element && names.some((c) => n.classList.contains(c));

/**
 * Record a cartoon postcard with its stick figure, one seamless take, at canvas size.
 * The card is snapshotted twice (the picture under the figure, the story over it) and
 * the figure is stroked between them every drawing, from the same poses as the preview.
 * Records in real time, so the tab has to stay in front until it's done.
 */
export async function recordCartoon(
  card: HTMLElement,
  figure: FigureSpec,
  canvas: { width: number; height: number },
  { fontEmbedCSS, onProgress }: { fontEmbedCSS: string; onProgress?: (done: number) => void },
): Promise<{ blob: Blob; ext: "mp4" | "webm"; seconds: number }> {
  const type = videoType();
  if (!type) throw new Error("this browser can't record video");
  const { width, height } = canvas;
  const shot = { width, height, pixelRatio: 1, fontEmbedCSS };

  const under = await toCanvas(card, { ...shot, filter: (n) => !hasClass(n, "jk-toon__figure", "jk-toon__story") });
  const over = await toCanvas(card, {
    ...shot,
    style: { background: "transparent" },
    filter: (n) => !hasClass(n, "jk-toon__figure", "jk-toon__art"),
  });
  const css = getComputedStyle(card);
  const ink = css.getPropertyValue("--toon-ink").trim();
  const cream = css.getPropertyValue("--toon-cream").trim();

  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d")!;
  const paint = (drawing: number) => {
    // video has no alpha: the card's rounded corners land on its own cream, not black
    ctx.fillStyle = cream;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(under, 0, 0, width, height);
    const pose = figurePose(figure, drawing, canvas);
    ctx.save();
    ctx.translate(pose.x, pose.y);
    ctx.scale(pose.scale, pose.scale);
    ctx.strokeStyle = ink;
    ctx.lineWidth = FIGURE_PEN;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const d of pose.paths) ctx.stroke(new Path2D(d));
    ctx.restore();
    ctx.drawImage(over, 0, 0, width, height);
  };

  const take = figureTake(figure, canvas);
  const frames = take * (FPS / FIGURE_DRAWINGS_PER_SECOND);
  const recorder = new MediaRecorder(out.captureStream(FPS), { mimeType: type, videoBitsPerSecond: 12_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const stopped = new Promise((resolve) => (recorder.onstop = resolve));

  paint(0);
  recorder.start();
  const t0 = performance.now();
  await new Promise<void>((resolve) => {
    let last = -1;
    const tick = () => {
      const frame = Math.floor(((performance.now() - t0) * FPS) / 1000);
      if (frame >= frames) return resolve();
      // repaint every video frame, not only on a new drawing, so the stream is a steady 24 fps
      if (frame !== last) {
        paint(Math.floor((frame * FIGURE_DRAWINGS_PER_SECOND) / FPS));
        onProgress?.(frame / frames);
        last = frame;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  recorder.stop();
  await stopped;

  return { blob: new Blob(chunks, { type }), ext: type.startsWith("video/mp4") ? "mp4" : "webm", seconds: frames / FPS };
}
