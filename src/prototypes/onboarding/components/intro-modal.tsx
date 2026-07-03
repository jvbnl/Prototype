import type { ReactNode } from "react";
import type { ModalStep } from "../data";
import { Icon } from "../icons";
import { Segments } from "./primitives";
import { useFocusTrap } from "./useFocusTrap";

type Media = { welcome: ReactNode; preference: (value: string) => ReactNode };

type Props = {
  steps: ModalStep[];
  index: number;
  pref: string;
  media: Media;
  onPref: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onChoose: (value: "tour" | "discover" | "later") => void;
};

/**
 * Config-driven intro-modal. Renders welcome / preference / choice steps from
 * data. Focus-trapped, Esc-closable, Enter activates the primary action.
 * Feature-agnostic: the live preview is injected via `media`.
 */
export function IntroModal(props: Props) {
  const { steps, index, onSkip } = props;
  const step = steps[index];
  const ref = useFocusTrap<HTMLDivElement>(true, onSkip);
  const total = steps.length;

  return (
    <div className="onb-scrim" role="presentation">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onb-modal-title"
        style={{ width: step.kind === "choice" ? 560 : 720, maxWidth: "100%" }}
      >
        {step.kind === "welcome" && <Welcome {...props} step={step} total={total} />}
        {step.kind === "preference" && <Preference {...props} step={step} total={total} />}
        {step.kind === "choice" && <Choice {...props} step={step} total={total} />}
      </div>
    </div>
  );
}

function FooterNav({
  total,
  index,
  onPrev,
  onNext,
  onSkip,
}: {
  total: number;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="onb-modal__foot">
      <Segments total={total} current={index} />
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {index === 0 ? (
          <button className="onb-link" onClick={onSkip}>
            Overslaan
          </button>
        ) : (
          <button className="onb-link" onClick={onPrev}>
            Vorige
          </button>
        )}
        <button className="onb-btn onb-btn--primary" data-autofocus onClick={onNext}>
          Volgende
        </button>
      </div>
    </div>
  );
}

function Welcome({
  step,
  total,
  index,
  media,
  onPrev,
  onNext,
  onSkip,
}: Props & { step: Extract<ModalStep, { kind: "welcome" }>; total: number }) {
  return (
    <div className="onb-modal" style={{ minHeight: 430 }}>
      <div className="onb-modal__main" style={{ flex: 1.45 }}>
        <button className="onb-modal__x" onClick={onSkip} aria-label="Sluiten">
          ×
        </button>
        <div style={{ marginTop: "auto" }}>
          <div className="onb-eyebrow">{step.eyebrow}</div>
          <h2 id="onb-modal-title" className="onb-modal__title" style={{ fontSize: 29 }}>
            {step.title}
          </h2>
          <p className="onb-modal__body">{step.body}</p>
        </div>
        <FooterNav total={total} index={index} onPrev={onPrev} onNext={onNext} onSkip={onSkip} />
      </div>
      <div className="onb-modal__media" style={{ flex: 1, padding: 0 }}>
        {media.welcome}
      </div>
    </div>
  );
}

function Preference({
  step,
  total,
  index,
  pref,
  media,
  onPref,
  onPrev,
  onNext,
  onSkip,
}: Props & { step: Extract<ModalStep, { kind: "preference" }>; total: number }) {
  return (
    <div className="onb-modal" style={{ minHeight: 430 }}>
      <div className="onb-modal__main" style={{ flex: 1.5, paddingBottom: 24 }}>
        <div className="onb-eyebrow">{step.eyebrow}</div>
        <h2 id="onb-modal-title" className="onb-modal__title" style={{ fontSize: 25 }}>
          {step.title}
        </h2>
        <p className="onb-modal__body" style={{ fontSize: 14.5, marginTop: 10 }}>
          {step.body}
        </p>
        <div role="radiogroup" aria-label={step.title} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 11 }}>
          {step.options.map((o) => {
            const selected = pref === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className="onb-choice"
                data-selected={selected ? 1 : 0}
                data-autofocus={selected ? "" : undefined}
                onClick={() => onPref(o.value)}
              >
                <span className="onb-choice__radio" />
                <span>
                  <span className="onb-choice__title">{o.title}</span>
                  <span className="onb-choice__desc">{o.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
        <FooterNav total={total} index={index} onPrev={onPrev} onNext={onNext} onSkip={onSkip} />
      </div>
      <div className="onb-modal__media" style={{ background: "var(--o-surface-2)" }}>
        <div className="onb-eyebrow" style={{ fontSize: 11, marginBottom: 12 }}>
          Voorbeeld
        </div>
        {media.preference(pref)}
      </div>
    </div>
  );
}

function Choice({
  step,
  total,
  onChoose,
  onSkip,
}: Props & { step: Extract<ModalStep, { kind: "choice" }>; total: number }) {
  return (
    <div
      className="onb-modal"
      style={{ flexDirection: "column", padding: "32px 32px 26px", position: "relative" }}
    >
      <button
        className="onb-modal__x"
        onClick={onSkip}
        aria-label="Sluiten"
        style={{ position: "absolute", top: 18, right: 18 }}
      >
        ×
      </button>
      <div className="onb-eyebrow">{step.eyebrow}</div>
      <h2 id="onb-modal-title" className="onb-modal__title">
        {step.title}
      </h2>
      <p className="onb-modal__body" style={{ fontSize: 14.5 }}>
        {step.body}
      </p>
      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 11 }}>
        {step.options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="onb-choice"
            data-recommended={o.recommended ? 1 : 0}
            data-autofocus={o.recommended ? "" : undefined}
            onClick={() => onChoose(o.value)}
          >
            {o.recommended && <span className="onb-badge-rec">Aanrader</span>}
            <span className="onb-choice__icon">
              <Icon name={o.icon} size={20} />
            </span>
            <span style={{ flex: 1 }}>
              <span className="onb-choice__title" style={{ fontSize: 15.5 }}>
                {o.title}
              </span>
              <span className="onb-choice__desc">{o.desc}</span>
            </span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <Segments total={total} current={total - 1} />
      </div>
    </div>
  );
}
