import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Placement, TourStep } from "../data";
import { Coachmark } from "./coachmark";

type Props = {
  /** The positioned frame the tour lives inside; geometry is relative to it. */
  frameRef: React.RefObject<HTMLElement>;
  steps: TourStep[];
  index: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
};

type Geo = {
  spot: { top: number; left: number; w: number; h: number };
  coach: { top: number; left: number };
  arrow: { side: Placement; offset: number };
};

const PAD = 6; // breathing room around the highlighted target
const GAP = 14; // distance from target to coachmark
const MARGIN = 12; // keep coachmark this far inside the frame
const COACH_W = 320;
const OPPOSITE: Record<Placement, Placement> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/**
 * Spotlight coachmark tour. Anchors to real DOM nodes (data-tour-id), measures
 * with getBoundingClientRect at runtime, flips placement to stay in-frame, and
 * repositions on resize/scroll. Coordinates are throwaway — only the hooks are
 * stable, so the same engine drives any feature (POS, rooster, financiën…).
 */
export function SpotlightTour({ frameRef, steps, index, onNext, onPrev, onClose }: Props) {
  const step = steps[index];
  const coachRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  const measure = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const targetEl = frame.querySelector<HTMLElement>(`[data-tour-id="${step.target}"]`);
    if (!targetEl) {
      setGeo(null);
      return;
    }
    const f = frame.getBoundingClientRect();
    const t = targetEl.getBoundingClientRect();

    const spot = {
      top: t.top - f.top - PAD,
      left: t.left - f.left - PAD,
      w: t.width + PAD * 2,
      h: t.height + PAD * 2,
    };

    const cw = coachRef.current?.offsetWidth || COACH_W;
    const ch = coachRef.current?.offsetHeight || 150;
    const cx = spot.left + spot.w / 2;
    const cy = spot.top + spot.h / 2;

    // candidate coach position per side (relative to frame)
    const cand = (p: Placement) => {
      switch (p) {
        case "top":
          return { top: spot.top - ch - GAP, left: cx - cw / 2 };
        case "bottom":
          return { top: spot.top + spot.h + GAP, left: cx - cw / 2 };
        case "left":
          return { top: cy - ch / 2, left: spot.left - cw - GAP };
        case "right":
          return { top: cy - ch / 2, left: spot.left + spot.w + GAP };
      }
    };
    const fits = (p: Placement) => {
      const c = cand(p);
      return (
        c.left >= MARGIN &&
        c.left + cw <= f.width - MARGIN &&
        c.top >= MARGIN &&
        c.top + ch <= f.height - MARGIN
      );
    };

    // preferred → opposite → the remaining sides; fall back to preferred + clamp
    const order: Placement[] = [step.place, OPPOSITE[step.place], "bottom", "top", "right", "left"];
    const chosen = order.find(fits) ?? step.place;

    const raw = cand(chosen);
    const left = Math.max(MARGIN, Math.min(f.width - cw - MARGIN, raw.left));
    const top = Math.max(MARGIN, Math.min(f.height - ch - MARGIN, raw.top));

    const side = OPPOSITE[chosen]; // arrow points back toward the target
    const offset =
      side === "top" || side === "bottom"
        ? Math.max(14, Math.min(cw - 28, cx - left - 7))
        : Math.max(14, Math.min(ch - 28, cy - top - 7));

    setGeo({ spot, coach: { top, left }, arrow: { side, offset } });
  }, [frameRef, step.target, step.place]);

  // re-measure on step change, then again next frame once the coach has size
  useLayoutEffect(() => {
    measure();
    const r = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(r);
  }, [measure]);

  // re-measure on resize/scroll (positions are runtime, never hardcoded)
  useEffect(() => {
    const onMove = () => measure();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    const ro = new ResizeObserver(onMove);
    if (frameRef.current) ro.observe(frameRef.current);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
      ro.disconnect();
    };
  }, [measure, frameRef]);

  // move focus to the coach each step → keyboard + screen-reader friendly
  useEffect(() => {
    coachRef.current?.focus();
  }, [index]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowRight" || e.key === "Enter") onNext();
    else if (e.key === "ArrowLeft") onPrev();
  };

  return (
    <div onKeyDown={onKey}>
      {/* blocker: dimmed UI behind the spotlight is not interactive */}
      <div style={{ position: "absolute", inset: 0, zIndex: 42 }} aria-hidden="true" />
      {geo && (
        <>
          <div
            className="onb-spot"
            style={{ top: geo.spot.top, left: geo.spot.left, width: geo.spot.w, height: geo.spot.h }}
          />
          <Coachmark
            ref={coachRef}
            eyebrow={step.eyebrow}
            title={step.title}
            body={step.body}
            total={steps.length}
            current={index}
            arrow={geo.arrow}
            onPrev={onPrev}
            onClose={onClose}
            onNext={onNext}
            style={{
              position: "absolute",
              zIndex: 48,
              top: geo.coach.top,
              left: geo.coach.left,
              transition: "top .35s var(--o-ease), left .35s var(--o-ease)",
            }}
          />
        </>
      )}
    </div>
  );
}
