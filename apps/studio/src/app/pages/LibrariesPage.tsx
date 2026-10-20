import { useRef, useState } from "react";
import { getFontEmbedCSS, toPng } from "html-to-image";
import { LIBRARIES_CANVAS, LibrariesPostcard, librariesSvg, withInlineSvgPaint } from "../../ds";
import { PageHeader } from "../components/Controls";
import { ScaledBox } from "../components/ScaledCard";
import type { PageProps } from "../App";

let fontCSS: Promise<string> | undefined;

/** The library pipeline card: the four Figma files, drawn with the Architect's Notebook shapes. */
export function LibrariesPage(_: PageProps) {
  const [status, setStatus] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 2400);
  };

  const exportPng = async (pixelRatio: number) => {
    if (!cardRef.current) return;
    const { width, height } = LIBRARIES_CANVAS;
    try {
      await document.fonts.ready;
      fontCSS ??= getFontEmbedCSS(cardRef.current);
      const card = cardRef.current;
      const options = { width, height, pixelRatio, fontEmbedCSS: await fontCSS };
      const url = await withInlineSvgPaint(card, () => toPng(card, options));
      const a = document.createElement("a");
      a.href = url;
      a.download = `jkidd-libraries${pixelRatio > 1 ? `@${pixelRatio}x` : ""}.png`;
      a.click();
      flash(`Exported ${width * pixelRatio}×${height * pixelRatio} PNG`);
    } catch (e) {
      flash(`Export failed: ${(e as Error).message}`);
    }
  };

  const exportSvg = async () => {
    if (!cardRef.current) return;
    try {
      await document.fonts.ready;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([await librariesSvg(cardRef.current)], { type: "image/svg+xml" }));
      a.download = "jkidd-libraries.svg";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
      flash("Exported SVG · vector, fonts not embedded");
    } catch (e) {
      flash(`Export failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="page page--wide">
      <PageHeader eyebrow="Genre · Architect's Notebook" title="Library pipeline">
        <p>
          The four Figma files in layer order, Foundations → Primitives → Compositions → Blocks, drawn on the stage's
          graph paper with the Architect's Notebook kit's own shapes: a cylinder for the variables, a stack of parts, a
          window frame, a document. Each uses only the ones before it, so the arrow back is struck out.
        </p>
        <p>Not in Workbench yet: this is the first draft, in code.</p>
      </PageHeader>

      <div className="studio__stage">
        <ScaledBox canvas={LIBRARIES_CANVAS} label="Library pipeline card preview">
          <LibrariesPostcard ref={cardRef} />
        </ScaledBox>

        <div className="studio__bar">
          <button className="btn btn--primary" onClick={() => exportPng(1)}>
            Export PNG · {LIBRARIES_CANVAS.width}×{LIBRARIES_CANVAS.height}
          </button>
          <button className="btn" onClick={() => exportPng(2)}>
            @2x
          </button>
          <button className="btn" onClick={exportSvg}>
            SVG
          </button>
          <span className="studio__status" role="status">
            {status}
          </span>
        </div>

        <div className="studio__thumb">
          <span className="label">At 320px (Principle 4)</span>
          <ScaledBox canvas={LIBRARIES_CANVAS} width={320} label="Thumbnail preview">
            <LibrariesPostcard />
          </ScaledBox>
        </div>
      </div>
    </div>
  );
}
