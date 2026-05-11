import { useEffect, useState } from "react";
import {
  CANCEL_DELTA,
  CURRENT_PLAN_KEY,
  PLANS,
  REASONS,
  SAVE_OFFERS,
  TIER_DELTAS,
} from "./data";
import type { Plan, PlanKey, ReasonId } from "./data";
import { E } from "./utils";

export type FlowMode = "cancel" | "downgrade" | "upgrade";

export type FlowState = {
  open: boolean;
  mode: FlowMode | null;
  targetTier: PlanKey | null;
};

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 16 : 6,
              height: 6,
              borderRadius: 3,
              background:
                i === step
                  ? "var(--ink)"
                  : i < step
                    ? "var(--ink-3)"
                    : "var(--line-2)",
              transition: "all 0.18s",
            }}
          />
        ))}
      </div>
      <span
        className="small muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Step {step + 1} of {total}
      </span>
    </div>
  );
}

export function FlowModal({
  state,
  onClose,
}: {
  state: FlowState;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<ReasonId | null>(null);
  const [otherText, setOtherText] = useState("");

  useEffect(() => {
    if (state.open) {
      setStep(0);
      setReason(null);
      setOtherText("");
    }
  }, [state.open, state.mode, state.targetTier]);

  if (!state.open || !state.mode) return null;

  const { mode, targetTier } = state;
  const isCancel = mode === "cancel";
  const isUpgrade = mode === "upgrade";
  const fromTier = PLANS[CURRENT_PLAN_KEY];
  const toTier = targetTier ? PLANS[targetTier] : null;
  const effectiveDate = "Jun 1, 2026";
  const TOTAL = isUpgrade ? 2 : 4;

  const eyebrow = isCancel ? "Cancellation" : isUpgrade ? "Upgrade" : "Downgrade";
  const title = isCancel
    ? "Cancel subscription"
    : isUpgrade
      ? `Upgrade to ${toTier!.name}`
      : `Switch to ${toTier!.name}`;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const complete = () => onClose();

  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: 760 }}
      >
        <div className="modal-hd">
          <div className="stack-tight">
            <div
              className="small muted"
              style={{
                textTransform: "uppercase",
                letterSpacing: ".08em",
                fontSize: 10.5,
              }}
            >
              {eyebrow}
            </div>
            <h2 style={{ margin: 0 }}>{title}</h2>
          </div>
          <div className="gap-row">
            <StepDots step={step} total={TOTAL} />
            <button className="x" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className="modal-body" style={{ padding: "22px 22px 18px", minHeight: 320 }}>
          {!isUpgrade && step === 0 && (
            <FlowStepChanges
              isCancel={isCancel}
              fromTier={fromTier}
              toTier={toTier}
              effectiveDate={effectiveDate}
            />
          )}
          {!isUpgrade && step === 1 && (
            <FlowStepReason
              reason={reason}
              setReason={setReason}
              otherText={otherText}
              setOtherText={setOtherText}
              isCancel={isCancel}
            />
          )}
          {!isUpgrade && step === 2 && (
            <FlowStepSave reason={reason} onAccept={onClose} />
          )}
          {!isUpgrade && step === 3 && (
            <FlowStepConfirm
              isCancel={isCancel}
              fromTier={fromTier}
              toTier={toTier}
              effectiveDate={effectiveDate}
            />
          )}
          {isUpgrade && step === 0 && (
            <UpgradeStepReview fromTier={fromTier} toTier={toTier!} />
          )}
          {isUpgrade && step === 1 && (
            <UpgradeStepSuccess fromTier={fromTier} toTier={toTier!} />
          )}
        </div>
        <div className="modal-ft">
          <div className="stack-tight">
            <span className="small muted">
              {isUpgrade && step === 0 && (
                <>
                  Payment method on file:{" "}
                  <b style={{ color: "var(--ink)" }}>Visa •••• 4242</b>
                </>
              )}
              {!isUpgrade && step === 3 && (
                <>
                  Nothing is charged today. You can change your mind any time before{" "}
                  {effectiveDate}.
                </>
              )}
              {!isUpgrade && step < 3 && (
                <>Nothing happens until you confirm on step {TOTAL}.</>
              )}
            </span>
          </div>
          <div className="gap-row">
            {step > 0 && !(isUpgrade && step === 1) && (
              <button className="btn ghost" onClick={prev}>
                Back
              </button>
            )}
            {step === 0 && !isUpgrade && (
              <button className="btn ghost" onClick={onClose}>
                Keep my plan
              </button>
            )}
            {!isUpgrade && step < 2 && (
              <button
                className="btn primary"
                onClick={next}
                disabled={step === 1 && !reason}
              >
                Continue →
              </button>
            )}
            {!isUpgrade && step === 2 && (
              <button className="btn ghost" onClick={next}>
                No thanks, continue {isCancel ? "cancelling" : "downgrading"} →
              </button>
            )}
            {!isUpgrade && step === 3 && (
              <button className="btn primary" onClick={complete}>
                {isCancel
                  ? `Cancel on ${effectiveDate}`
                  : `Confirm switch on ${effectiveDate}`}
              </button>
            )}
            {isUpgrade && step === 0 && (
              <button className="btn primary" onClick={next}>
                Pay {E(toTier!.m * 0.6)} &amp; upgrade now
              </button>
            )}
            {isUpgrade && step === 1 && (
              <button className="btn primary" onClick={complete}>
                Back to Billing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStepChanges({
  isCancel,
  fromTier,
  toTier,
  effectiveDate,
}: {
  isCancel: boolean;
  fromTier: Plan;
  toTier: Plan | null;
  effectiveDate: string;
}) {
  const targetKey =
    toTier && (Object.keys(PLANS) as PlanKey[]).find((k) => PLANS[k] === toTier);
  const deltaKey = `${CURRENT_PLAN_KEY}_to_${targetKey ?? "starter"}`;
  const delta = isCancel
    ? CANCEL_DELTA
    : TIER_DELTAS[deltaKey] || TIER_DELTAS.pro_to_starter;
  const title = isCancel
    ? "Here's what changes when you cancel"
    : `Move to ${toTier!.name} — here's what changes`;
  const sub = isCancel
    ? `Your subscription stops at the end of the period. Until then you keep full ${fromTier.name} access — after that the workspace becomes read-only for 30 days, then archived.`
    : `Effective ${effectiveDate} unless you choose otherwise on the next step. Nothing happens yet.`;
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600 }}>{title}</h3>
      <p
        className="small muted"
        style={{ margin: "0 0 18px", lineHeight: 1.5 }}
      >
        {sub}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div className="spread" style={{ marginBottom: 10 }}>
            <div
              className="small muted"
              style={{
                textTransform: "uppercase",
                letterSpacing: ".06em",
                fontSize: 10.5,
                fontWeight: 600,
              }}
            >
              Stays the same
            </div>
            <span className="pill ok" style={{ fontSize: 9.5 }}>
              KEEP
            </span>
          </div>
          {delta.stays.map((s, i) => (
            <div
              key={i}
              className="small"
              style={{
                padding: "6px 0",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span style={{ color: "var(--ink-3)", flex: "0 0 auto" }}>✓</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div className="spread" style={{ marginBottom: 10 }}>
            <div
              className="small muted"
              style={{
                textTransform: "uppercase",
                letterSpacing: ".06em",
                fontSize: 10.5,
                fontWeight: 600,
              }}
            >
              No longer included
            </div>
            <span className="pill warn" style={{ fontSize: 9.5 }}>
              {isCancel ? "STOPS" : "REMOVED"}
            </span>
          </div>
          {delta.goes.map((s, i) => (
            <div
              key={i}
              className="small"
              style={{
                padding: "6px 0",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span style={{ color: "var(--ink-3)", flex: "0 0 auto" }}>–</span>
              <span
                style={{ textDecoration: "line-through", color: "var(--ink-2)" }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlowStepReason({
  reason,
  setReason,
  otherText,
  setOtherText,
  isCancel,
}: {
  reason: ReasonId | null;
  setReason: (r: ReasonId) => void;
  otherText: string;
  setOtherText: (s: string) => void;
  isCancel: boolean;
}) {
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600 }}>
        Help us understand why
      </h3>
      <p
        className="small muted"
        style={{ margin: "0 0 18px", lineHeight: 1.5 }}
      >
        We read every answer.{" "}
        {isCancel
          ? "It won't change today's outcome — it changes what we build next."
          : "It helps us not lose another customer for the same reason."}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {REASONS.map((r) => (
          <button
            key={r.id}
            className={"planopt " + (reason === r.id ? "selected" : "")}
            onClick={() => setReason(r.id)}
            style={{
              padding: "12px 14px",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              textAlign: "left",
              border:
                "1px solid " + (reason === r.id ? "var(--ink)" : "var(--line-2)"),
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border:
                  "1.5px solid " + (reason === r.id ? "var(--ink)" : "var(--line)"),
                background:
                  reason === r.id
                    ? "radial-gradient(circle, var(--ink) 35%, transparent 40%)"
                    : "transparent",
                flex: "0 0 auto",
              }}
            />
            <span style={{ fontSize: 13 }}>{r.label}</span>
          </button>
        ))}
      </div>
      {reason === "other" && (
        <textarea
          placeholder="Tell us more…"
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "10px 12px",
            border: "1px solid var(--line-2)",
            borderRadius: 6,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            resize: "vertical",
            minHeight: 80,
          }}
        />
      )}
    </div>
  );
}

function FlowStepSave({
  reason,
  onAccept,
}: {
  reason: ReasonId | null;
  onAccept: () => void;
}) {
  const offer = (reason && SAVE_OFFERS[reason]) || SAVE_OFFERS.other;
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600 }}>
        Before you go — could we offer this?
      </h3>
      <p
        className="small muted"
        style={{ margin: "0 0 18px", lineHeight: 1.5 }}
      >
        Targeted to your reason. One click to accept; nothing else changes if you skip.
      </p>
      <div className="card" style={{ padding: "20px 22px" }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
          {offer.title}
        </div>
        <div
          className="small"
          style={{ lineHeight: 1.55, color: "var(--ink-2)", marginBottom: 16 }}
        >
          {offer.body}
        </div>
        <div className="gap-row">
          <button className="btn primary" onClick={onAccept}>
            {offer.cta}
          </button>
          <span className="small muted">
            Applied instantly · no payment changes
          </span>
        </div>
      </div>
    </div>
  );
}

function FlowStepConfirm({
  isCancel,
  fromTier,
  toTier,
  effectiveDate,
}: {
  isCancel: boolean;
  fromTier: Plan;
  toTier: Plan | null;
  effectiveDate: string;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1.5px solid var(--ink-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flex: "0 0 auto",
            color: "var(--ink-2)",
          }}
        >
          {isCancel ? "✕" : "↓"}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
            {isCancel
              ? `Cancel on ${effectiveDate}`
              : `Switch to ${toTier!.name} on ${effectiveDate}`}
          </div>
          <div className="small muted" style={{ lineHeight: 1.5 }}>
            You'll keep full {fromTier.name} access until {effectiveDate}. No charge today.
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: "14px 18px" }}>
        <div className="spread" style={{ padding: "6px 0" }}>
          <span className="small muted">Plan</span>
          <span className="small" style={{ fontWeight: 500 }}>
            {fromTier.name} {isCancel ? "→ ends" : `→ ${toTier!.name}`}
          </span>
        </div>
        <div
          className="spread"
          style={{ padding: "6px 0", borderTop: "1px solid var(--line-2)" }}
        >
          <span className="small muted">Billing</span>
          <span className="small" style={{ fontWeight: 500 }}>
            Monthly
          </span>
        </div>
        <div
          className="spread"
          style={{ padding: "6px 0", borderTop: "1px solid var(--line-2)" }}
        >
          <span className="small muted">Effective</span>
          <span className="small mono" style={{ fontWeight: 500 }}>
            {effectiveDate}
          </span>
        </div>
        <div
          className="spread"
          style={{
            padding: "8px 0 4px",
            borderTop: "1px solid var(--line)",
            marginTop: 4,
          }}
        >
          <span className="small muted">Charge today</span>
          <span className="mono" style={{ fontWeight: 600 }}>
            € 0,00
          </span>
        </div>
        {!isCancel && toTier && (
          <div className="spread" style={{ padding: "4px 0" }}>
            <span className="small muted">From {effectiveDate}</span>
            <span className="small mono" style={{ fontWeight: 500 }}>
              {E(toTier.m)} / mo
            </span>
          </div>
        )}
      </div>
      <div
        className="note block"
        style={{ marginTop: 14, background: "var(--bg-2)" }}
      >
        <b>Heads up:</b> you can change your mind any time before {effectiveDate} from this
        Billing page.
      </div>
    </div>
  );
}

function UpgradeStepReview({
  fromTier,
  toTier,
}: {
  fromTier: Plan;
  toTier: Plan;
}) {
  const subtotal = toTier.m;
  const prorate = -8.4;
  const total = subtotal + prorate;
  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600 }}>
        Upgrade to {toTier.name}
      </h3>
      <p
        className="small muted"
        style={{ margin: "0 0 18px", lineHeight: 1.5 }}
      >
        New features unlock immediately. We'll prorate your current period and charge the
        difference today.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div
            className="small muted"
            style={{
              textTransform: "uppercase",
              letterSpacing: ".06em",
              fontSize: 10.5,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            What unlocks
          </div>
          <div
            className="small"
            style={{ padding: "6px 0", display: "flex", gap: 8 }}
          >
            <span style={{ color: "var(--ink-3)" }}>✓</span>
            <span>
              {toTier.locations === "Unlimited"
                ? "Unlimited locations"
                : `${toTier.locations} location`}
            </span>
          </div>
          <div
            className="small"
            style={{ padding: "6px 0", display: "flex", gap: 8 }}
          >
            <span style={{ color: "var(--ink-3)" }}>✓</span>
            <span>Organizations &amp; family accounts</span>
          </div>
          <div
            className="small"
            style={{ padding: "6px 0", display: "flex", gap: 8 }}
          >
            <span style={{ color: "var(--ink-3)" }}>✓</span>
            <span>Advanced reports</span>
          </div>
          <div
            className="small"
            style={{ padding: "6px 0", display: "flex", gap: 8 }}
          >
            <span style={{ color: "var(--ink-3)" }}>✓</span>
            <span>Add-on access (resume any paused add-ons)</span>
          </div>
        </div>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div
            className="small muted"
            style={{
              textTransform: "uppercase",
              letterSpacing: ".06em",
              fontSize: 10.5,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Today's charge
          </div>
          <div className="spread" style={{ padding: "5px 0" }}>
            <span className="small muted">{toTier.name} · monthly</span>
            <span className="small mono">{E(subtotal)}</span>
          </div>
          <div className="spread" style={{ padding: "5px 0" }}>
            <span className="small muted">
              Prorated credit from {fromTier.name}
            </span>
            <span className="small mono">−€ 8,40</span>
          </div>
          <div
            className="spread"
            style={{
              padding: "8px 0 4px",
              borderTop: "1px solid var(--line)",
              marginTop: 4,
            }}
          >
            <span className="small" style={{ fontWeight: 600 }}>
              Total today
            </span>
            <span className="mono" style={{ fontWeight: 600, fontSize: 15 }}>
              {E(total)}
            </span>
          </div>
          <div className="small muted" style={{ marginTop: 6 }}>
            Then {E(toTier.m)} on Jun 1, 2026
          </div>
        </div>
      </div>
    </div>
  );
}

function UpgradeStepSuccess({
  fromTier,
  toTier,
}: {
  fromTier: Plan;
  toTier: Plan;
}) {
  return (
    <div style={{ textAlign: "center", padding: "20px 20px 8px" }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "1.5px solid var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
          fontSize: 24,
        }}
      >
        ✓
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
        You're on {toTier.name}
      </div>
      <div
        className="small muted"
        style={{ lineHeight: 1.5, maxWidth: 380, margin: "0 auto 18px" }}
      >
        New features unlock immediately. Receipt sent to finance@crossfit-ams.nl.
      </div>
      <div
        className="card"
        style={{
          padding: "14px 18px",
          textAlign: "left",
          maxWidth: 420,
          margin: "0 auto",
        }}
      >
        <div className="spread" style={{ padding: "5px 0" }}>
          <span className="small muted">Plan</span>
          <span className="small" style={{ fontWeight: 500 }}>
            {fromTier.name} → {toTier.name}
          </span>
        </div>
        <div
          className="spread"
          style={{ padding: "5px 0", borderTop: "1px solid var(--line-2)" }}
        >
          <span className="small muted">Charged today</span>
          <span className="small mono" style={{ fontWeight: 500 }}>
            {E(toTier.m - 8.4)}
          </span>
        </div>
        <div
          className="spread"
          style={{ padding: "5px 0", borderTop: "1px solid var(--line-2)" }}
        >
          <span className="small muted">Next renewal</span>
          <span className="small mono" style={{ fontWeight: 500 }}>
            Jun 1, 2026
          </span>
        </div>
      </div>
    </div>
  );
}
