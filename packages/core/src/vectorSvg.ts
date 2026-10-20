import { PAINT } from "./svgPaint";

/**
 * A rendered card as a standalone, editable vector SVG, for Figma or Illustrator. It walks the
 * card as laid out on screen and writes each piece as what it is: boxes as rects, borders as
 * strokes, text as <text> (one per line, as it wraps on the card), inline drawings (icons, the
 * stamp, the postmark) as their own vectors, masked icons (the arrow) inlined and recoloured,
 * photos and the card stock as embedded images. Every colour is resolved and written on the
 * element; every element is a group named for its class, so the layers read in an editor.
 *
 * What SVG can't say is rasterised, layer by layer, through `rasterize`: CSS gradients and
 * masks (the back's textures and overlays). Fonts are named, not embedded.
 */
export type VectorSvgOptions = {
  canvas: { width: number; height: number };
  /** Render a temporary element, already in the document, to a PNG data URL. */
  rasterize: (el: HTMLElement) => Promise<string>;
};

const NS = "http://www.w3.org/2000/svg";
const SVG_PAINT = [...PAINT, "fill-opacity", "stroke-opacity", "text-anchor", "dominant-baseline", "font-style"] as const;
const TEXT_ONLY = new Set(["font-family", "font-size", "font-weight", "letter-spacing", "font-style", "text-anchor", "dominant-baseline"]);
const DEFAULTS: Record<string, string> = { opacity: "1", "stroke-dasharray": "none", "letter-spacing": "normal", "fill-opacity": "1", "stroke-opacity": "1", "font-style": "normal", "text-anchor": "start", "dominant-baseline": "auto" };
/** The CSS a rasterised layer needs to paint as it does on the card. */
const LAYER_CSS = ["background-color", "background-image", "background-size", "background-position", "background-repeat", "border-radius", "filter"];
const MASK_CSS = ["mask-image", "mask-size", "mask-position", "mask-repeat", "-webkit-mask-image", "-webkit-mask-size", "-webkit-mask-position", "-webkit-mask-repeat"];

type Box = { x: number; y: number; w: number; h: number };
type Rgba = { r: number; g: number; b: number; a: number };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const n = (v: number) => (Math.round(v * 100) / 100).toString();

export function parseColor(v: string): Rgba | null {
  if (!v || v === "transparent" || v === "none") return null;
  let m = v.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  }
  m = v.match(/^color\(srgb ([^)]+)\)$/);
  if (m) {
    const [r, g, b, a = 1] = m[1].split(/[\s/]+/).filter(Boolean).map(Number);
    return { r: r * 255, g: g * 255, b: b * 255, a };
  }
  return null;
}

const hex = (c: Rgba) => "#" + [c.r, c.g, c.b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");

/** fill="…" (or stroke) as hex plus an opacity, which every editor reads; "" when nothing paints. */
function paint(attr: "fill" | "stroke", v: string, alpha = 1): string {
  const c = parseColor(v);
  if (!c || c.a * alpha === 0) return "";
  const a = c.a * alpha;
  return ` ${attr}="${hex(c)}"${a < 1 ? ` ${attr}-opacity="${n(a)}"` : ""}`;
}

/** Split a computed list (background-image, …) at its top-level commas. */
function layers(v: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of v) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** A box with each corner's radii (CSS order: tl, tr, br, bl), as a path. */
function roundRect(b: Box, cs: CSSStyleDeclaration, inset = 0): string {
  const x = b.x + inset;
  const y = b.y + inset;
  const w = Math.max(0, b.w - inset * 2);
  const h = Math.max(0, b.h - inset * 2);
  const corner = (p: string) => {
    const [rx, ry = rx] = cs.getPropertyValue(p).split(" ");
    const res = (v: string, of: number) => (v.endsWith("%") ? (parseFloat(v) / 100) * of : parseFloat(v) || 0);
    return [Math.max(0, res(rx, b.w) - inset), Math.max(0, res(ry, b.h) - inset)];
  };
  let [tl, tr, br, bl] = ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"].map(corner);
  if (![tl, tr, br, bl].some(([a, c]) => a || c)) return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"`;
  // scale down as CSS does when the radii overrun a side
  const f = Math.min(1, w / (tl[0] + tr[0] || 1), w / (bl[0] + br[0] || 1), h / (tl[1] + bl[1] || 1), h / (tr[1] + br[1] || 1));
  [tl, tr, br, bl] = [tl, tr, br, bl].map(([a, c]) => [a * f, c * f]);
  if ([tr, br, bl].every(([a, c]) => a === tl[0] && c === tl[1]))
    return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(tl[0])}" ry="${n(tl[1])}"`;
  const d =
    `M${n(x + tl[0])} ${n(y)}H${n(x + w - tr[0])}A${n(tr[0])} ${n(tr[1])} 0 0 1 ${n(x + w)} ${n(y + tr[1])}` +
    `V${n(y + h - br[1])}A${n(br[0])} ${n(br[1])} 0 0 1 ${n(x + w - br[0])} ${n(y + h)}` +
    `H${n(x + bl[0])}A${n(bl[0])} ${n(bl[1])} 0 0 1 ${n(x)} ${n(y + h - bl[1])}` +
    `V${n(y + tl[1])}A${n(tl[0])} ${n(tl[1])} 0 0 1 ${n(x + tl[0])} ${n(y)}Z`;
  return `<path d="${d}"`;
}

async function dataUrl(href: string, cache: Map<string, Promise<string>>): Promise<string> {
  if (href.startsWith("data:")) return href;
  if (!cache.has(href))
    cache.set(
      href,
      fetch(href)
        .then((r) => r.blob())
        .then(
          (blob) =>
            new Promise<string>((resolve, reject) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result as string);
              r.onerror = () => reject(r.error);
              r.readAsDataURL(blob);
            }),
        ),
    );
  return cache.get(href)!;
}

const naturalSize = (src: string) =>
  new Promise<{ w: number; h: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });

export async function vectorSvg(card: HTMLElement, { canvas, rasterize }: VectorSvgOptions): Promise<string> {
  await document.fonts.ready;
  const { width: W, height: H } = canvas;
  const images = new Map<string, Promise<string>>();
  const ids = new Map<string, number>();
  const defs: string[] = [];
  const uid = (base: string) => {
    const k = (base || "layer").replace(/[^a-zA-Z0-9_-]/g, "-");
    const i = (ids.get(k) ?? 0) + 1;
    ids.set(k, i);
    return i > 1 ? `${k}-${i}` : k;
  };
  const metrics = document.createElement("canvas").getContext("2d")!;
  const stage = document.createElement("div");
  stage.style.cssText = "position:fixed;left:-100000px;top:0;pointer-events:none";
  document.body.append(stage);

  // Text a stylesheet writes (the kicker's label is the post type's token) has no node to
  // measure: stand a span in for it, styled as the pseudo-element, while the card is read.
  const standIns: HTMLElement[] = [];
  const marked: [HTMLElement, string][] = [];
  const quiet = document.createElement("style");
  quiet.textContent = "[data-vector-svg-before]::before,[data-vector-svg-after]::after{content:none!important}";
  document.head.append(quiet);
  for (const el of [card, ...card.querySelectorAll<HTMLElement>("*")]) {
    if (!(el instanceof HTMLElement)) continue;
    for (const which of ["before", "after"] as const) {
      const cs = getComputedStyle(el, `::${which}`);
      const m = cs.content.match(/^"((?:[^"\\]|\\.)*)"$/);
      if (!m?.[1]) continue;
      const span = document.createElement("span");
      for (const p of cs) span.style.setProperty(p, cs.getPropertyValue(p));
      span.style.removeProperty("content");
      span.textContent = m[1].replace(/\\(.)/g, "$1");
      if (which === "before") el.prepend(span);
      else el.append(span);
      el.setAttribute(`data-vector-svg-${which}`, "");
      standIns.push(span);
      marked.push([el, `data-vector-svg-${which}`]);
    }
  }

  // Measure everything untransformed; each transform goes back on as a group's matrix.
  const turned = new Map<Element, { matrix: DOMMatrix; origin: [number, number]; style: string | null }>();
  for (const el of [card, ...card.querySelectorAll<HTMLElement>("*")]) {
    if (!(el instanceof HTMLElement)) continue;
    const t = getComputedStyle(el).transform;
    if (!t || t === "none") continue;
    const [ox, oy] = getComputedStyle(el).transformOrigin.split(" ").map(parseFloat);
    turned.set(el, { matrix: new DOMMatrix(t), origin: [ox, oy], style: el.getAttribute("style") });
  }
  for (const el of turned.keys()) (el as HTMLElement).style.transform = "none";

  try {
    const frame = card.getBoundingClientRect();
    const k = frame.width / W;
    const rel = (r: DOMRect | { left: number; top: number; width: number; height: number }): Box => ({
      x: (r.left - frame.left) / k,
      y: (r.top - frame.top) / k,
      w: r.width / k,
      h: r.height / k,
    });

    /** One background layer, a pseudo-element's paint, or a masked box, as an image. */
    const raster = async (b: Box, cs: CSSStyleDeclaration, only?: { image: string; size: string; position: string; repeat: string }) => {
      const el = document.createElement("div");
      el.style.width = `${b.w}px`;
      el.style.height = `${b.h}px`;
      for (const p of LAYER_CSS) el.style.setProperty(p, cs.getPropertyValue(p));
      for (const p of MASK_CSS) el.style.setProperty(p, cs.getPropertyValue(p));
      if (only) {
        el.style.backgroundColor = "transparent";
        el.style.backgroundImage = only.image;
        el.style.backgroundSize = only.size;
        el.style.backgroundPosition = only.position;
        el.style.backgroundRepeat = only.repeat;
        for (const p of MASK_CSS) el.style.removeProperty(p);
      }
      stage.append(el);
      try {
        return await rasterize(el);
      } finally {
        el.remove();
      }
    };

    /** An element's own paint: background colour, background layers, border. */
    const ownPaint = async (b: Box, cs: CSSStyleDeclaration, name: string): Promise<string> => {
      let out = "";
      const masked = (cs.getPropertyValue("-webkit-mask-image") || cs.getPropertyValue("mask-image")) !== "none";
      if (masked) {
        const src = cs.getPropertyValue("-webkit-mask-image") || cs.getPropertyValue("mask-image");
        const url = src.match(/^url\("?(.+?)"?\)$/)?.[1];
        const isSvg = url && (/\.svg(\?|$)/.test(url) || url.startsWith("data:image/svg+xml"));
        // A drawing used as a mask (the arrow): inline it, painted in the box's colour.
        if (url && isSvg && cs.backgroundImage === "none" && parseColor(cs.backgroundColor)) {
          const svg = new DOMParser().parseFromString(await (await fetch(url)).text(), "image/svg+xml").documentElement;
          const ink = parseColor(cs.backgroundColor)!;
          for (const el of svg.querySelectorAll("[fill]:not(clipPath *):not(mask *)"))
            if (el.getAttribute("fill") !== "none") {
              el.setAttribute("fill", hex(ink));
              if (ink.a < 1) el.setAttribute("fill-opacity", n(ink.a));
            }
          svg.removeAttribute("style");
          svg.setAttribute("x", n(b.x));
          svg.setAttribute("y", n(b.y));
          svg.setAttribute("width", n(b.w));
          svg.setAttribute("height", n(b.h));
          svg.setAttribute("id", uid(`${name}-drawing`));
          for (const el of svg.querySelectorAll("[id]")) if (el !== svg) el.id = uid(el.id);
          return new XMLSerializer().serializeToString(svg).replace(/ xmlns="[^"]+"/g, "");
        }
        return `<image x="${n(b.x)}" y="${n(b.y)}" width="${n(b.w)}" height="${n(b.h)}" href="${await raster(b, cs)}"/>`;
      }
      const bg = paint("fill", cs.backgroundColor);
      if (bg) out += `${roundRect(b, cs)}${bg}/>`;
      if (cs.backgroundImage !== "none") {
        const imgs = layers(cs.backgroundImage);
        const sizes = layers(cs.backgroundSize);
        const positions = layers(cs.backgroundPosition);
        const repeats = layers(cs.backgroundRepeat);
        const at = <T,>(list: T[], i: number) => list[i % list.length];
        const flatOf = (image: string) => {
          const m = image.match(/^linear-gradient\(([^]*) 0px 0px\)$/);
          return m && parseColor(m[1]) ? m[1] : null;
        };
        const vector = imgs.every((image, i) => flatOf(image) || (/^url\(/.test(image) && at(repeats, i).startsWith("no-repeat")));
        // Patterns made of gradients (the textures) go as one image, all their layers together.
        if (!vector) {
          const only = { image: cs.backgroundImage, size: cs.backgroundSize, position: cs.backgroundPosition, repeat: cs.backgroundRepeat };
          out += `<image x="${n(b.x)}" y="${n(b.y)}" width="${n(b.w)}" height="${n(b.h)}" href="${await raster(b, cs, only)}"/>`;
        } else for (let i = imgs.length - 1; i >= 0; i--) {
          const layer = { image: imgs[i], size: at(sizes, i), position: at(positions, i), repeat: at(repeats, i) };
          const flat = flatOf(layer.image);
          const url = layer.image.match(/^url\("?(.+?)"?\)$/)?.[1];
          if (flat) out += `${roundRect(b, cs)}${paint("fill", flat)}/>`;
          else if (url) {
            const href = await dataUrl(url, images);
            const nat = await naturalSize(href);
            const [sw, sh = "auto"] = layer.size.split(" ");
            let w = nat.w;
            let h = nat.h;
            if (sw === "cover" || sw === "contain") {
              const f = (sw === "cover" ? Math.max : Math.min)(b.w / nat.w, b.h / nat.h);
              [w, h] = [nat.w * f, nat.h * f];
            } else {
              const len = (v: string, of: number) => (v.endsWith("%") ? (parseFloat(v) / 100) * of : parseFloat(v));
              w = sw === "auto" ? nat.w : len(sw, b.w);
              h = sh === "auto" ? (w / nat.w) * nat.h : len(sh, b.h);
            }
            const [px, py] = layer.position.split(" ").map((v, j) => (v.endsWith("%") ? (parseFloat(v) / 100) * ((j ? b.h : b.w) - (j ? h : w)) : parseFloat(v)));
            const clip = uid(`${name}-clip`);
            defs.push(`<clipPath id="${clip}">${roundRect(b, cs)}/></clipPath>`);
            out += `<image clip-path="url(#${clip})" x="${n(b.x + px)}" y="${n(b.y + py)}" width="${n(w)}" height="${n(h)}" preserveAspectRatio="none" href="${href}"/>`;
          }
        }
      }
      // borders: one stroke when the four sides agree, a rect per side when they don't
      const sides = ["top", "right", "bottom", "left"].map((s) => ({
        w: parseFloat(cs.getPropertyValue(`border-${s}-width`)) || 0,
        style: cs.getPropertyValue(`border-${s}-style`),
        color: cs.getPropertyValue(`border-${s}-color`),
      }));
      const drawn = sides.filter((s) => s.w && s.style !== "none" && s.style !== "hidden" && parseColor(s.color)?.a);
      if (drawn.length === 4 && sides.every((s) => s.w === sides[0].w && s.color === sides[0].color && s.style === sides[0].style)) {
        const s = sides[0];
        const dash = s.style === "dashed" ? ` stroke-dasharray="${n(s.w * 3)} ${n(s.w * 2)}"` : s.style === "dotted" ? ` stroke-dasharray="${n(s.w)} ${n(s.w)}"` : "";
        out += `${roundRect(b, cs, s.w / 2)} fill="none"${paint("stroke", s.color)} stroke-width="${n(s.w)}"${dash}/>`;
      } else
        sides.forEach((s, i) => {
          if (!drawn.includes(s)) return;
          const r = [
            { x: b.x, y: b.y, w: b.w, h: s.w },
            { x: b.x + b.w - s.w, y: b.y, w: s.w, h: b.h },
            { x: b.x, y: b.y + b.h - s.w, w: b.w, h: s.w },
            { x: b.x, y: b.y, w: s.w, h: b.h },
          ][i];
          out += `<rect x="${n(r.x)}" y="${n(r.y)}" width="${n(r.w)}" height="${n(r.h)}"${paint("fill", s.color)}/>`;
        });
      return out;
    };

    /** A ::before or ::after, painted where it lies in its element. */
    const pseudo = async (el: HTMLElement, which: "::before" | "::after", b: Box, name: string) => {
      const cs = getComputedStyle(el, which);
      if (!cs.content || cs.content === "none" || cs.content === "normal" || cs.display === "none") return "";
      const own = getComputedStyle(el);
      const bl = parseFloat(own.borderLeftWidth) || 0;
      const bt = parseFloat(own.borderTopWidth) || 0;
      const pad = { x: b.x + bl, y: b.y + bt, w: b.w - bl - (parseFloat(own.borderRightWidth) || 0), h: b.h - bt - (parseFloat(own.borderBottomWidth) || 0) };
      const len = (v: string) => (v === "auto" ? null : parseFloat(v));
      let box = pad;
      if (cs.position === "absolute") {
        const [l, t, r, bo, w, h] = [cs.left, cs.top, cs.right, cs.bottom, cs.width, cs.height].map(len);
        const width = w ?? pad.w - (l ?? 0) - (r ?? 0);
        const height = h ?? pad.h - (t ?? 0) - (bo ?? 0);
        box = { x: pad.x + (l ?? pad.w - (r ?? 0) - width), y: pad.y + (t ?? pad.h - (bo ?? 0) - height), w: width, h: height };
      }
      if (box.w <= 0 || box.h <= 0) return "";
      const body = await ownPaint(box, cs, `${name}${which.replace("::", "-")}`);
      return body ? group(`${name}${which.replace("::", "-")}`, cs, body) : "";
    };

    const group = (name: string, cs: CSSStyleDeclaration, body: string, extra = "") => {
      const op = parseFloat(cs.opacity);
      const blend = cs.mixBlendMode && cs.mixBlendMode !== "normal" ? ` style="mix-blend-mode:${cs.mixBlendMode}"` : "";
      return `<g id="${uid(name)}"${op < 1 ? ` opacity="${n(op)}"` : ""}${blend}${extra}>${body}</g>`;
    };

    /** A text node, one <text> per line as it wraps, on the font's own baseline. */
    const text = (node: Text, cs: CSSStyleDeclaration) => {
      const raw = node.textContent ?? "";
      if (!raw.trim() || cs.visibility === "hidden") return "";
      const pre = cs.whiteSpace.startsWith("pre") || cs.whiteSpace === "break-spaces";
      const lines = new Map<number, { x: number; top: number; from: number; to: number }>();
      for (const m of raw.matchAll(/\S+/g)) {
        const r = document.createRange();
        r.setStart(node, m.index!);
        r.setEnd(node, m.index! + m[0].length);
        for (const rect of r.getClientRects()) {
          if (!rect.width) continue;
          const key = Math.round(rect.top / k / 4);
          const line = lines.get(key);
          if (!line) lines.set(key, { x: rect.left, top: rect.top, from: m.index!, to: m.index! + m[0].length });
          else {
            line.x = Math.min(line.x, rect.left);
            line.to = m.index! + m[0].length;
          }
          break;
        }
      }
      const size = parseFloat(cs.fontSize);
      metrics.font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      // A text range's box is the font's ascent over its descent, so the baseline sits one ascent down.
      const ascent = metrics.measureText("Hg").fontBoundingBoxAscent;
      const transform = (s: string) =>
        cs.textTransform === "uppercase" ? s.toUpperCase() : cs.textTransform === "lowercase" ? s.toLowerCase() : cs.textTransform === "capitalize" ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : s;
      const spacing = cs.letterSpacing === "normal" ? "" : ` letter-spacing="${n(parseFloat(cs.letterSpacing))}"`;
      const style = cs.fontStyle !== "normal" ? ` font-style="${cs.fontStyle}"` : "";
      const deco = cs.textDecorationLine.includes("line-through") ? ` text-decoration="line-through"` : "";
      let out = "";
      for (const line of lines.values()) {
        let s = raw.slice(line.from, line.to);
        if (!pre) s = s.replace(/\s+/g, " ");
        const p = rel({ left: line.x, top: line.top, width: 0, height: 0 });
        out +=
          `<text x="${n(p.x)}" y="${n(p.y + ascent)}" font-family="${esc(cs.fontFamily)}" font-size="${n(size)}" font-weight="${cs.fontWeight}"` +
          `${style}${spacing}${deco}${paint("fill", cs.color)}${pre ? ` xml:space="preserve"` : ""}>${esc(transform(s))}</text>`;
      }
      return out;
    };

    /** An inline <svg> drawing, kept as vectors with its computed paint written on. */
    const drawing = (live: SVGSVGElement, b: Box, name: string) => {
      const copy = live.cloneNode(true) as SVGSVGElement;
      const from = [live, ...live.querySelectorAll<SVGElement>("*")];
      const to = [copy, ...copy.querySelectorAll<SVGElement>("*")];
      const renamed = new Map<string, string>();
      for (const el of to) if (el.id) renamed.set(el.id, uid(`${name}-${el.id}`));
      from.forEach((el, i) => {
        const c = getComputedStyle(el);
        const d = to[i];
        for (const a of d.getAttributeNames()) if (a === "class" || a === "style" || a.startsWith("data-") || a.startsWith("aria-")) d.removeAttribute(a);
        if (el.closest("clipPath") || el.closest("mask")) {
          for (const a of ["fill", "stroke"]) {
            const v = parseColor(el.getAttribute(a) ?? c.getPropertyValue(a));
            if (v) d.setAttribute(a, hex(v));
          }
          return;
        }
        if (i === 0) return;
        for (const p of SVG_PAINT) {
          if (TEXT_ONLY.has(p) && el.tagName !== "text" && el.tagName !== "textPath" && el.tagName !== "tspan") continue;
          const v = c.getPropertyValue(p);
          if (!v || DEFAULTS[p] === v) continue;
          if (p === "fill" || p === "stroke") {
            const ref = v.match(/url\("?[^#)]*#([^")]+)"?\)/);
            if (ref) d.setAttribute(p, `url(#${renamed.get(ref[1]) ?? ref[1]})`);
            else if (v === "none") d.setAttribute(p, "none");
            else {
              const c2 = parseColor(v);
              if (!c2) continue;
              d.setAttribute(p, hex(c2));
              if (c2.a < 1) d.setAttribute(`${p}-opacity`, n(c2.a));
            }
          } else d.setAttribute(p, v);
        }
        if ((el.tagName === "text" || el.tagName === "textPath") && c.textTransform === "uppercase")
          for (const t of d.childNodes) if (t.nodeType === Node.TEXT_NODE) t.textContent = (t.textContent ?? "").toUpperCase();
      });
      for (const el of to)
        for (const a of ["id", "href", "mask", "filter", "clip-path"]) {
          const v = el.getAttribute(a);
          if (!v) continue;
          if (a === "id") el.id = renamed.get(v) ?? v;
          else el.setAttribute(a, v.replace(/#([^)"]+)/, (_, id) => `#${renamed.get(id) ?? id}`));
        }
      copy.setAttribute("x", n(b.x));
      copy.setAttribute("y", n(b.y));
      copy.setAttribute("width", n(b.w));
      copy.setAttribute("height", n(b.h));
      copy.setAttribute("id", uid(name));
      copy.setAttribute("overflow", "visible");
      return new XMLSerializer().serializeToString(copy).replace(/ xmlns="[^"]+"/g, "");
    };

    /** Layers are named for their class, so they read in an editor's layer list. */
    const nameOf = (el: Element) => el.classList[0] ?? el.tagName.toLowerCase();

    const walk = async (el: HTMLElement): Promise<string> => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return "";
      const b = rel(el.getBoundingClientRect());
      const name = nameOf(el);
      let body = await ownPaint(b, cs, name);
      body += await pseudo(el, "::before", b, name);
      for (const child of el.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) body += text(child as Text, cs);
        else if (child instanceof SVGSVGElement) {
          const c = getComputedStyle(child);
          if (c.display !== "none") body += drawing(child, rel(child.getBoundingClientRect()), nameOf(child));
        } else if (child instanceof HTMLImageElement && child.currentSrc) {
          const ib = rel(child.getBoundingClientRect());
          const fit = getComputedStyle(child).objectFit;
          const aspect = fit === "cover" ? "xMidYMid slice" : fit === "contain" ? "xMidYMid meet" : "none";
          body += `<image x="${n(ib.x)}" y="${n(ib.y)}" width="${n(ib.w)}" height="${n(ib.h)}" preserveAspectRatio="${aspect}" href="${await dataUrl(child.currentSrc, images)}"/>`;
        } else if (child instanceof HTMLElement) body += await walk(child);
      }
      body += await pseudo(el, "::after", b, name);
      if (!body) return "";
      let extra = "";
      if (cs.overflow !== "visible" && el !== card) {
        const clip = uid(`${name}-clip`);
        defs.push(`<clipPath id="${clip}">${roundRect(b, cs)}/></clipPath>`);
        body = `<g clip-path="url(#${clip})">${body}</g>`;
      }
      const t = turned.get(el);
      if (t) {
        const [ox, oy] = [b.x + t.origin[0], b.y + t.origin[1]];
        const { a, b: mb, c, d, e, f } = t.matrix;
        extra = ` transform="translate(${n(ox)} ${n(oy)}) matrix(${[a, mb, c, d, e, f].map((v) => n(v)).join(" ")}) translate(${n(-ox)} ${n(-oy)})"`;
      }
      return group(name, cs, body, extra);
    };

    const body = await walk(card);
    defs.unshift(`<clipPath id="canvas"><rect width="${W}" height="${H}"/></clipPath>`);
    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<svg xmlns="${NS}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      `<defs>${defs.join("")}</defs><g clip-path="url(#canvas)">${body}</g></svg>`
    );
  } finally {
    for (const [el, { style }] of turned) style === null ? el.removeAttribute("style") : el.setAttribute("style", style);
    for (const span of standIns) span.remove();
    for (const [el, attr] of marked) el.removeAttribute(attr);
    quiet.remove();
    stage.remove();
  }
}
