import { forwardRef, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CANVAS, Postcard, type CardSpec } from "../../ds";

/**
 * Renders anything drawn on a fixed canvas and scales it down to fit. Cards are
 * never reflowed: a 1600px card at 320px is the same card, smaller (Principle 4).
 * Pass width for a fixed size; omit it to fill the container.
 */
export function ScaledBox({
  canvas,
  width,
  label,
  children,
}: {
  canvas: { width: number; height: number };
  width?: number;
  label?: string;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(width ?? 0);

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
        {fit > 0 ? children : null}
      </div>
    </div>
  );
}

export const ScaledCard = forwardRef<HTMLDivElement, { spec: CardSpec; width?: number; label?: string }>(
  function ScaledCard({ spec, width, label }, ref) {
    return (
      <ScaledBox canvas={CANVAS[spec.ratio ?? "16:9"]} width={width} label={label}>
        <Postcard ref={ref} spec={spec} />
      </ScaledBox>
    );
  },
);
