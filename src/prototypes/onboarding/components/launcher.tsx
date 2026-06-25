import type { ChecklistItem } from "../data";
import { Icon } from "../icons";
import { Checklist, ProgressBar } from "./primitives";

type Props = {
  open: boolean;
  pulse: boolean;
  checklist: ChecklistItem[];
  onToggle: () => void;
  onRestartTour: () => void;
};

/**
 * Persistent re-entry point (bottom-right). Makes the tour repeatable and
 * surfaces the setup checklist, so staff who join later get the same soft
 * onboarding without anyone re-triggering it for them.
 */
export function Launcher({ open, pulse, checklist, onToggle, onRestartTour }: Props) {
  const done = checklist.filter((c) => c.done).length;

  return (
    <>
      {open && (
        <div className="onb-hub" role="dialog" aria-label="Hulp en rondleidingen">
          <div className="onb-hub__head">Hulp &amp; rondleidingen</div>
          <div className="onb-hub__list">
            <button className="onb-hub__item" onClick={onRestartTour}>
              <span className="onb-hub__ico onb-hub__ico--accent">
                <Icon name="chevron-right" size={15} stroke={2.4} />
              </span>
              <span style={{ flex: 1 }}>
                <span className="onb-hub__t">Rondleiding (opnieuw)</span>
                <span className="onb-hub__s">4 kernacties · ~2 min</span>
              </span>
            </button>

            <div style={{ padding: "12px 10px 6px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 8,
                }}
              >
                <span style={{ font: "700 12.5px var(--o-font)", color: "var(--o-ink)" }}>
                  Setup-voortgang
                </span>
                <span style={{ font: "600 12.5px var(--o-font)", color: "var(--o-accent)" }}>
                  {done} / {checklist.length}
                </span>
              </div>
              <ProgressBar value={done} max={checklist.length} />
              <div style={{ marginTop: 13 }}>
                <Checklist items={checklist} />
              </div>
            </div>

            <button className="onb-hub__item">
              <span className="onb-hub__ico">
                <Icon name="article" size={15} />
              </span>
              <span className="onb-hub__t" style={{ color: "var(--o-ink-2)", fontWeight: 600 }}>
                Help-artikelen
              </span>
            </button>
          </div>
        </div>
      )}

      <button
        className="onb-fab"
        onClick={onToggle}
        aria-label="Hulp en rondleidingen"
        aria-expanded={open}
        style={{ color: "#fff" }}
      >
        <Icon name="help" size={23} stroke={2.2} />
        {pulse && !open && <span className="onb-fab__pulse" aria-hidden="true" />}
      </button>
    </>
  );
}
