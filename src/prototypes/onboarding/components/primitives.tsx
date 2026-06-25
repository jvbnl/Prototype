import type { ChecklistItem } from "../data";
import { Icon } from "../icons";

/** Segmented step indicator used in the intro-modal footer. */
export function Segments({ total, current }: { total: number; current: number }) {
  return (
    <div className="onb-seg" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <i key={i} data-on={i <= current ? 1 : 0} />
      ))}
    </div>
  );
}

/** Progress dots used in the coachmark (goal-gradient: see what's left). */
export function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div className="onb-dots" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <i key={i} data-state={i === current ? "active" : i < current ? "done" : "todo"} />
      ))}
    </div>
  );
}

/** Goal-gradient progress bar. */
export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div
      className="onb-bar"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Reusable setup checklist. The first not-done item is the "active" one. */
export function Checklist({ items }: { items: ChecklistItem[] }) {
  const activeIdx = items.findIndex((i) => !i.done);
  return (
    <div className="onb-check">
      {items.map((it, i) => {
        const state = it.done ? "done" : i === activeIdx ? "active" : "todo";
        return (
          <div className="onb-check__item" key={it.id} data-state={state}>
            <span className="onb-check__mark">
              {it.done && <Icon name="check" size={11} stroke={3.4} className="onb-check-tick" />}
            </span>
            <span className="onb-check__label">{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Success toast — confirms the win and points to what's next (peak-end). */
export function Toast({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <div className="onb-toast" role="status" aria-live="polite">
      <span className="onb-toast__icon">
        <span style={{ color: "#fff", display: "grid", placeItems: "center" }}>
          <Icon name="check" size={16} stroke={3} />
        </span>
      </span>
      <div>
        <div style={{ font: "700 14px var(--o-font)" }}>{title}</div>
        <div style={{ font: "500 12.5px var(--o-font)", color: "#aeb6c0", marginTop: 1 }}>
          {body}
        </div>
      </div>
      <button className="onb-toast__x" onClick={onClose} aria-label="Sluiten">
        ×
      </button>
    </div>
  );
}
