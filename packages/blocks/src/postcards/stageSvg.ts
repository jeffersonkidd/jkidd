import { STAGE_CANVAS, STAGE_SQUARE } from "./StagePostcard";
import { PAINT } from "@jkidd/core";

const NS = "http://www.w3.org/2000/svg";
/** Values SVG already assumes, left off so the file stays small. */
const DEFAULTS: Partial<Record<(typeof PAINT)[number], string>> = {
  opacity: "1",
  "stroke-dasharray": "none",
  "letter-spacing": "normal",
};
const TEXT_ONLY = new Set(["font-family", "font-size", "font-weight", "letter-spacing"]);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "'");

/**
 * The stage postcard as a standalone vector SVG, for Figma or Illustrator: every
 * colour resolved from the tokens and written on the element, the graph paper as
 * lines over the card stock (embedded once, as a pattern the paper fills share), and
 * the title strip as text, one <text> per line as it wraps on the card.
 * It is the drawing on screen when it's called, so a walking figure is caught mid-step.
 */
export async function stageSvg(card: HTMLElement): Promise<string> {
  const { width: W, height: H } = STAGE_CANVAS;
  const live = card.querySelector<SVGSVGElement>("svg.jk-stage__drawing");
  if (!live) throw new Error("no stage drawing to export");
  const box = card.getBoundingClientRect();
  const k = box.width / W;
  const css = getComputedStyle(card);
  const token = (name: string) => css.getPropertyValue(name).trim();

  // the drawing, with each element's computed paint as attributes
  const drawing = live.cloneNode(true) as SVGSVGElement;
  const from = [...live.querySelectorAll<SVGElement>("*")];
  const to = [...drawing.querySelectorAll<SVGElement>("*")];
  from.forEach((el, i) => {
    const c = getComputedStyle(el);
    const d = to[i];
    for (const a of ["class", "data-figma", "data-cycle"]) d.removeAttribute(a);
    if (el.closest("clipPath")) return;
    for (const p of PAINT) {
      if (TEXT_ONLY.has(p) && el.tagName !== "text") continue;
      const v = c.getPropertyValue(p);
      if (v && DEFAULTS[p] !== v) d.setAttribute(p, v);
    }
  });
  // the card stock: one pattern, its raster embedded so the file stands alone
  const patterns = [...drawing.querySelectorAll("pattern")];
  const pattern = patterns[0];
  const images = patterns.flatMap((p) => [...p.querySelectorAll("image")]);
  const embedded = images.length ? await dataUrl(images[0].getAttribute("href") ?? "") : "";
  images.forEach((image) => image.setAttribute("href", embedded));
  // longest id first, so card-stock doesn't claim card-stock-plain's references
  const renames = patterns
    .map((p, i) => [p.id, i ? "card-stock-plain" : "card-stock"] as const)
    .sort((a, b) => b[0].length - a[0].length);
  patterns.forEach((p, i) => (p.id = i ? "card-stock-plain" : "card-stock"));
  // computed paint can come back with the page's address in front of the #
  for (const el of drawing.querySelectorAll<SVGElement>("[fill], [stroke]"))
    for (const a of ["fill", "stroke"]) {
      const v = el.getAttribute(a);
      const hit = v && renames.find(([old]) => v.includes(`#${old}`));
      if (hit) el.setAttribute(a, `url(#${hit[1]})`);
    }
  // useId ids have colons, which some editors won't resolve in url(#…)
  drawing.querySelectorAll("clipPath").forEach((cp, i) => {
    const old = cp.id;
    cp.id = `wings-${i}`;
    drawing.querySelectorAll(`[clip-path="url(#${CSS.escape(old)})"]`).forEach((g) => g.setAttribute("clip-path", `url(#wings-${i})`));
  });

  // graph paper: minor rules every square, major every four
  let minor = "";
  let major = "";
  const rule = STAGE_SQUARE * 4;
  for (let x = 0; x <= W; x += STAGE_SQUARE) x % rule ? (minor += `M${x - 0.5} 0V${H}`) : (major += `M${x} 0V${H}`);
  for (let y = 0; y <= H; y += STAGE_SQUARE) y % rule ? (minor += `M0 ${y - 0.5}H${W}`) : (major += `M0 ${y}H${W}`);
  const paper =
    `<rect width="${W}" height="${H}" fill="${css.backgroundColor}"/>` +
    (pattern ? `<rect width="${W}" height="${H}" fill="url(#card-stock)"/>` : "") +
    `<path d="${minor}" stroke="${token("--jk-genre-stage-grid")}" stroke-width="1" fill="none"/>` +
    `<path d="${major}" stroke="${token("--jk-genre-stage-grid-major")}" stroke-width="2" fill="none"/>`;

  // title strip: measure each word where the card laid it out, and group by line
  let title = "";
  for (const span of card.querySelectorAll<HTMLElement>(".jk-stage__title span")) {
    const c = getComputedStyle(span);
    const size = parseFloat(c.fontSize);
    const lines = new Map<number, { x: number; bottom: number; words: string[] }>();
    const walk = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
    for (let t = walk.nextNode(); t; t = walk.nextNode()) {
      for (const m of (t.textContent ?? "").matchAll(/\S+/g)) {
        const r = document.createRange();
        r.setStart(t, m.index);
        r.setEnd(t, m.index + m[0].length);
        const b = r.getBoundingClientRect();
        const key = Math.round(b.top);
        if (!lines.has(key)) lines.set(key, { x: b.left, bottom: b.bottom, words: [] });
        lines.get(key)!.words.push(m[0]);
      }
    }
    for (const { x, bottom, words } of lines.values()) {
      const s = words.join(" ");
      const text = c.textTransform === "uppercase" ? s.toUpperCase() : s;
      const spacing = c.letterSpacing === "normal" ? "0" : c.letterSpacing;
      title +=
        `<text x="${((x - box.left) / k).toFixed(1)}" y="${((bottom - box.top) / k - size * 0.22).toFixed(1)}" ` +
        `font-family="${esc(c.fontFamily)}" font-size="${size}" letter-spacing="${spacing}" fill="${c.color}">${esc(text)}</text>`;
    }
  }

  const out = document.createElementNS(NS, "svg");
  out.setAttribute("xmlns", NS);
  out.setAttribute("width", String(W));
  out.setAttribute("height", String(H));
  out.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const defs = document.createElementNS(NS, "defs");
  defs.innerHTML = `<clipPath id="card"><rect width="${W}" height="${H}" rx="18"/></clipPath>`;
  const root = document.createElementNS(NS, "g");
  root.setAttribute("clip-path", "url(#card)");
  root.innerHTML = `<g id="graph-paper">${paper}</g>`;
  const stage = document.createElementNS(NS, "g");
  stage.setAttribute("id", "stage");
  for (const n of [...drawing.childNodes]) {
    if (n instanceof SVGDefsElement) defs.append(...n.childNodes);
    else stage.append(n);
  }
  root.append(stage);
  root.insertAdjacentHTML("beforeend", `<g id="title-strip">${title}</g>`);
  out.append(defs, root);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(out)}`;
}

async function dataUrl(href: string): Promise<string> {
  const blob = await (await fetch(href)).blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
