import { forwardRef } from "react";
import { Dots } from "./primitives";

export type CoachmarkProps = {
  eyebrow: string;
  title: string;
  body: string;
  total: number;
  current: number;
  onPrev?: () => void;
  onClose?: () => void;
  onNext?: () => void;
  /** Arrow rendered by the tour (omitted in the static gallery sample). */
  arrow?: { side: "top" | "bottom" | "left" | "right"; offset: number };
  style?: React.CSSProperties;
};

const arrowStyle = (a: NonNullable<CoachmarkProps["arrow"]>): React.CSSProperties => {
  switch (a.side) {
    case "top":
      return { top: -7, left: a.offset };
    case "bottom":
      return { bottom: -7, left: a.offset };
    case "left":
      return { left: -7, top: a.offset };
    case "right":
      return { right: -7, top: a.offset };
  }
};

/** One tour step. Leads with the action, shows progress, always offers an exit. */
export const Coachmark = forwardRef<HTMLDivElement, CoachmarkProps>(function Coachmark(
  { eyebrow, title, body, total, current, onPrev, onClose, onNext, arrow, style },
  ref,
) {
  const isLast = current === total - 1;
  return (
    <div
      ref={ref}
      className="onb-coach"
      role="dialog"
      aria-label={`${eyebrow}: ${title}`}
      tabIndex={-1}
      style={style}
    >
      {arrow && <div className="onb-coach__arrow" style={arrowStyle(arrow)} />}
      <div className="onb-coach__eyebrow">{eyebrow}</div>
      <div className="onb-coach__title">{title}</div>
      <div className="onb-coach__body">{body}</div>
      <div className="onb-coach__foot">
        <Dots total={total} current={current} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {current > 0 && onPrev && (
            <button className="onb-btn--plain" onClick={onPrev}>
              Vorige
            </button>
          )}
          {onClose && (
            <button className="onb-btn--plain" onClick={onClose}>
              Sluiten
            </button>
          )}
          {onNext && (
            <button
              className={`onb-btn ${isLast ? "onb-btn--success" : "onb-btn--primary"}`}
              style={{ minHeight: 34, padding: "0 16px", borderRadius: 9, fontSize: 13 }}
              onClick={onNext}
            >
              {isLast ? "Afronden" : "Volgende"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
