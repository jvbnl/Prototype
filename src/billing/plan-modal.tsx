import { useState } from "react";
import { CURRENT_PLAN_KEY, PLANS } from "./data";
import type { PlanKey } from "./data";
import { E } from "./utils";

// Reference patterns: Notion / Linear / Shopify plan pickers and Lenny's
// pricing-page write-ups — show 2–3 KEY differentiators per plan, not a full
// feature list. Usage-based rates apply universally so they live in a shared
// "All plans" block below the cards.
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

export function PlanModal({
  open,
  onClose,
  onUpgrade,
  onDowngrade,
}: {
  open: boolean;
  onClose: () => void;
  onUpgrade: (k: PlanKey) => void;
  onDowngrade: (k: PlanKey) => void;
}) {
  const [sel, setSel] = useState<PlanKey>(CURRENT_PLAN_KEY);
  if (!open) return null;

  const currentKey = CURRENT_PLAN_KEY;
  const today = sel === currentKey ? 0 : PLANS[sel].m * 0.6; // mock prorate
  const planOrder: PlanKey[] = ["studio", "starter", "pro"];
  const isUpgrade = planOrder.indexOf(sel) > planOrder.indexOf(currentKey);

  const onSwitch = () => {
    if (sel === currentKey) return;
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
        style={{ maxWidth: 760 }}
      >
        <div className="modal-hd">
          <div>
            <h2>Change plan</h2>
            <div className="small muted">Currently on Gymly {PLANS[currentKey].name}</div>
          </div>
          <div className="gap-row">
            <span className="small muted">All plans billed monthly</span>
            <button className="x" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className="modal-body" style={{ padding: "22px 22px 18px" }}>
          <div className="plans" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {planOrder.map((k) => {
              const p = PLANS[k];
              const isCurrent = k === currentKey;
              const isSelected = sel === k;
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
                  <div className="price" style={{ fontSize: 19, lineHeight: 1.1 }}>
                    {E(p.m)}
                    <small style={{ fontSize: 11 }}> /mo</small>
                  </div>
                  <div className="small muted">Billed monthly</div>
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
                    <small
                      className="muted"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      per transaction · iDEAL, SEPA, Bancontact, card
                    </small>
                  </span>
                </div>
                <div className="stack-tight">
                  <span className="small muted">Transactional email</span>
                  <span className="mono" style={{ fontSize: 13 }}>
                    Included{" "}
                    <small
                      className="muted"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      booking confirmations, reminders, receipts
                    </small>
                  </span>
                </div>
              </div>
            </div>
            <div className="small muted" style={{ marginTop: 6 }}>
              Usage is metered as it happens and added to your monthly invoice — same on Studio,
              Starter or Pro.
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <div className="stack-tight">
            <span className="small muted">
              {sel === currentKey ? (
                "No change selected."
              ) : today > 0 && isUpgrade ? (
                <>
                  Prorated charge today:{" "}
                  <b
                    style={{
                      color: "var(--ink)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {E(today)}
                  </b>{" "}
                  · then {E(PLANS[sel].m)}/month
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
              disabled={sel === currentKey}
              onClick={onSwitch}
            >
              {sel === currentKey ? "No change" : `Switch to ${PLANS[sel].name}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
