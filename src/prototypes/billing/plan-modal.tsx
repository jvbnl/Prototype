import { useEffect, useState } from "react";
import {
  CURRENT_PLAN_KEY,
  PLANS,
  YEARLY_DISCOUNT_PCT,
  planPrice,
  yearlySavings,
  yearlyTotal,
} from "./data";
import type { BillingCycle, PlanKey } from "./data";
import { E } from "./utils";
import { CycleToggle, FeatureMatrix } from "./feature-matrix";

// Reference patterns: Notion / Linear / Shopify plan pickers and Lenny's
// pricing-page write-ups — keep the cards focused on the 3 KEY differentiators
// (locations, family/org accounts, advanced reports). The full Feature Matrix
// is exposed as a collapsible block beneath the picker so people who want to
// compare can, without bloating the default view.
const DIFFS: Record<PlanKey, { k: string; v: string }[]> = {
  studio: [
    { k: "Locations", v: "1" },
    { k: "Family / org accounts", v: "—" },
    { k: "Advanced reports", v: "—" },
  ],
  starter: [
    { k: "Locations", v: "Unlimited" },
    { k: "Family accounts", v: "Included" },
    { k: "Advanced reports", v: "—" },
  ],
  pro: [
    { k: "Locations", v: "Unlimited" },
    { k: "Organizations", v: "Included" },
    { k: "Advanced reports", v: "Included" },
  ],
};

const PLAN_ORDER: PlanKey[] = ["studio", "starter", "pro"];

export function PlanModal({
  open,
  cycle,
  initialCycle,
  onClose,
  onCycleChange,
  onUpgrade,
  onDowngrade,
}: {
  open: boolean;
  cycle: BillingCycle;
  initialCycle: BillingCycle | null;
  onClose: () => void;
  onCycleChange: (c: BillingCycle) => void;
  onUpgrade: (k: PlanKey) => void;
  onDowngrade: (k: PlanKey) => void;
}) {
  const [sel, setSel] = useState<PlanKey>(CURRENT_PLAN_KEY);
  // Local preview cycle: the user can compare prices in the modal without
  // committing. Confirming bubbles it back up via onCycleChange.
  const [pickerCycle, setPickerCycle] = useState<BillingCycle>(cycle);
  const [showMatrix, setShowMatrix] = useState(false);

  useEffect(() => {
    if (open) {
      setSel(CURRENT_PLAN_KEY);
      setPickerCycle(initialCycle ?? cycle);
      setShowMatrix(false);
    }
  }, [open, initialCycle, cycle]);

  if (!open) return null;

  const currentKey = CURRENT_PLAN_KEY;
  const cycleChanged = pickerCycle !== cycle;
  const planChanged = sel !== currentKey;
  const isUpgrade = PLAN_ORDER.indexOf(sel) > PLAN_ORDER.indexOf(currentKey);
  const today = planChanged ? planPrice(sel, pickerCycle) * 0.6 : 0; // mock prorate
  const savings = yearlySavings(sel);

  const onConfirm = () => {
    if (!planChanged) {
      if (cycleChanged) onCycleChange(pickerCycle);
      onClose();
      return;
    }
    onCycleChange(pickerCycle);
    if (isUpgrade) onUpgrade(sel);
    else onDowngrade(sel);
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: 820 }}
      >
        <div className="modal-hd">
          <div>
            <h2>Change plan</h2>
            <div className="small muted">
              Currently on Gymly {PLANS[currentKey].name} ·{" "}
              {cycle === "yearly" ? "billed yearly" : "billed monthly"}
            </div>
          </div>
          <div className="gap-row">
            <CycleToggle cycle={pickerCycle} onChange={setPickerCycle} />
            <button className="x" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className="modal-body" style={{ padding: "22px 22px 18px" }}>
          {pickerCycle === "yearly" && (
            <div
              className="banner info"
              style={{ marginBottom: 18, padding: "10px 14px" }}
            >
              <span className="dot" />
              <div className="body">
                <p style={{ fontSize: 12.5 }}>
                  Save {YEARLY_DISCOUNT_PCT}% by paying yearly. You'll be charged once
                  up front and your monthly invoice drops to add-ons + usage only.
                </p>
              </div>
            </div>
          )}

          <div className="plans" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {PLAN_ORDER.map((k) => {
              const p = PLANS[k];
              const isCurrent = k === currentKey;
              const isSelected = sel === k;
              const price = planPrice(k, pickerCycle);
              return (
                <div
                  key={k}
                  className={"planopt " + (isSelected ? "selected" : "")}
                  onClick={() => setSel(k)}
                  style={{ padding: "14px 14px 12px", gap: 5 }}
                >
                  <div className="spread" style={{ alignItems: "center" }}>
                    <div className="name" style={{ fontSize: 13.5 }}>
                      {p.name}
                      {p.badge && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 10,
                            color: "var(--accent)",
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                          }}
                        >
                          {p.badge}
                        </span>
                      )}
                    </div>
                    {isCurrent && (
                      <span className="badge" style={{ color: "var(--ink-3)" }}>
                        Current
                      </span>
                    )}
                  </div>
                  <div
                    className="small muted"
                    style={{ marginTop: -2, marginBottom: 4, minHeight: 44, lineHeight: 1.35 }}
                  >
                    {p.tagline}
                  </div>
                  <div
                    className="price"
                    style={{ fontSize: 19, lineHeight: 1.1 }}
                  >
                    {E(price)}
                    <small style={{ fontSize: 11 }}> /mo</small>
                  </div>
                  <div className="small muted">
                    {pickerCycle === "yearly" ? (
                      <>
                        {E(yearlyTotal(k))}/yr ·{" "}
                        <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                          save {E(yearlySavings(k))}/yr
                        </span>
                      </>
                    ) : (
                      <>
                        Billed monthly ·{" "}
                        <span className="strike">{E(p.m)}</span>{" "}
                        <span style={{ color: "var(--accent)" }}>
                          {E(p.y)} on yearly
                        </span>
                      </>
                    )}
                  </div>
                  <div style={{ height: 6 }} />
                  {DIFFS[k].map((d, i) => (
                    <div
                      key={i}
                      className="spread small"
                      style={{
                        padding: "4px 0",
                        borderTop: "1px solid var(--line-2)",
                        gap: 8,
                      }}
                    >
                      <span className="muted" style={{ flex: "0 0 auto" }}>
                        {d.k}
                      </span>
                      <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{d.v}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              onClick={() => setShowMatrix((v) => !v)}
              className="btn ghost"
              style={{
                padding: "6px 8px",
                fontSize: 12.5,
                color: "var(--ink-2)",
              }}
            >
              {showMatrix ? "Hide" : "Compare"} all features {showMatrix ? "↑" : "↓"}
            </button>
            {showMatrix && (
              <div style={{ marginTop: 10 }}>
                <FeatureMatrix highlightKey={currentKey} />
                <div
                  className="small muted"
                  style={{ marginTop: 8, lineHeight: 1.5 }}
                >
                  Looking for the Business plan? It's a high-touch tier with custom SLA,
                  dedicated account manager and developer API.{" "}
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Contact sales ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Usage rates — applies to all plans */}
          <div style={{ marginTop: 22 }}>
            <div className="spread" style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                Usage-based charges{" "}
                <span className="small muted" style={{ fontWeight: 400 }}>
                  apply to every plan
                </span>
              </div>
              <a href="#" className="small" onClick={(e) => e.preventDefault()}>
                How usage is billed ↗
              </a>
            </div>
            <div className="card" style={{ padding: "10px 14px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 14,
                }}
              >
                <div className="stack-tight">
                  <span className="small muted">Payment processing</span>
                  <span className="mono" style={{ fontSize: 13 }}>
                    € 0,29{" "}
                    <small className="muted" style={{ fontFamily: "var(--font-sans)" }}>
                      per transaction · iDEAL, SEPA, Bancontact, card
                    </small>
                  </span>
                </div>
                <div className="stack-tight">
                  <span className="small muted">Transactional email</span>
                  <span className="mono" style={{ fontSize: 13 }}>
                    Included{" "}
                    <small className="muted" style={{ fontFamily: "var(--font-sans)" }}>
                      booking confirmations, reminders, receipts
                    </small>
                  </span>
                </div>
              </div>
            </div>
            <div className="small muted" style={{ marginTop: 6 }}>
              Usage is metered as it happens and added to your monthly invoice — same on
              Studio, Starter or Pro.
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <div className="stack-tight">
            <span className="small muted">
              {!planChanged && !cycleChanged ? (
                "No change selected."
              ) : !planChanged && cycleChanged ? (
                pickerCycle === "yearly" ? (
                  <>
                    Switch to yearly · charged{" "}
                    <b style={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}>
                      {E(yearlyTotal(currentKey))}
                    </b>{" "}
                    today · saves {E(savings)}/year
                  </>
                ) : (
                  <>Switch to monthly · takes effect on next renewal</>
                )
              ) : isUpgrade ? (
                <>
                  Prorated charge today:{" "}
                  <b style={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}>
                    {E(today)}
                  </b>{" "}
                  · then {E(planPrice(sel, pickerCycle))}/month
                </>
              ) : (
                <>Takes effect end of period · Jun 1, 2026</>
              )}
            </span>
            <a href="#" className="small" onClick={(e) => e.preventDefault()}>
              See what changes in your add-ons
            </a>
          </div>
          <div className="gap-row">
            <button className="btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn primary"
              disabled={!planChanged && !cycleChanged}
              onClick={onConfirm}
            >
              {!planChanged && !cycleChanged
                ? "No change"
                : !planChanged
                  ? `Switch to ${pickerCycle === "yearly" ? "yearly" : "monthly"}`
                  : `Switch to ${PLANS[sel].name}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
