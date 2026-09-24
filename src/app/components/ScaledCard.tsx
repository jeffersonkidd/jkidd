import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { CANVAS, Postcard, type CardSpec } from "../../ds";

/**
 * Renders a card at its Figma canvas size and scales it down to fit. Cards are
 * never reflowed: a 1600px card at 320px is the same card, smaller (Principle 4).
 * Pass width for a fixed size; omit it to fill the container.
 */
export const ScaledCard = forwardRef<HTMLDivElement, { spec: CardSpec; width?: number; label?: string }>(
  function ScaledCard({ spec, width, label }, ref) {
    const box = useRef<HTMLDivElement>(null);
    const [fit, setFit] = useState(width ?? 0);
    const canvas = CANVAS[spec.ratio ?? "16:9"];

    useLayoutEffect(() => {
      if (width) return setFit(width);
      const el = box.current;
      if (!el) return;
      const ro = new ResizeObserver(([e]) => setFit(e.contentRect.width));
      ro.observe(el);
      return () => ro.disconnect();
    }, [width]);

    const scale = fit / canvas.width;
    return (
      <div
        ref={box}
        className="scaled-card"
        style={{ width: width ?? "100%", height: canvas.height * scale }}
        role="img"
        aria-label={label}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: canvas.width }}>
          {fit > 0 ? <Postcard ref={ref} spec={spec} /> : null}
        </div>
      </div>
    );
  },
);
