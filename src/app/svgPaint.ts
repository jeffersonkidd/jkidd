/** The SVG properties a card's stylesheet sets on drawings. */
const PAINT = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-linecap",
  "stroke-linejoin",
  "opacity",
  "font-family",
  "font-size",
  "font-weight",
  "letter-spacing",
] as const;

/**
 * Run an export with every SVG drawing's paint written inline. html-to-image copies
 * an <svg> whole and only inlines styles on the <svg> itself, so anything its
 * children get from a class falls back to SVG defaults: a black fill on every shape.
 * The inline styles are taken off again when the export is done.
 */
export async function withInlineSvgPaint<T>(root: HTMLElement, run: () => Promise<T>): Promise<T> {
  const saved = new Map<SVGElement, string | null>();
  for (const svg of root.querySelectorAll("svg")) {
    for (const el of svg.querySelectorAll<SVGElement>("*")) {
      const css = getComputedStyle(el);
      saved.set(el, el.getAttribute("style"));
      for (const p of PAINT) el.style.setProperty(p, css.getPropertyValue(p));
    }
  }
  try {
    return await run();
  } finally {
    for (const [el, style] of saved) {
      if (style === null) el.removeAttribute("style");
      else el.setAttribute("style", style);
    }
  }
}
