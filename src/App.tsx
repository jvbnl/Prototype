"use client";

import { useState } from "react";
import {
  ADDONS_BASE,
  CURRENT_PLAN_KEY,
  GYM,
  PLANS,
  YEARLY_DISCOUNT_PCT,
  yearlySavings,
  yearlyTotal,
} from "./billing/data";
import type { Addon, BillingCycle, PlanKey } from "./billing/data";
import { SettingsNav, StateBanner, Tabs, TopBar } from "./billing/chrome";
import {
  AddonsSection,
  BillPreview,
  CurrentPlan,
  PaymentMethodSection,
  SupportPlanSection,
} from "./billing/overview";
import { InvoicesSection } from "./billing/invoices";
import { PlanModal } from "./billing/plan-modal";
import { SupportPlanModal } from "./billing/support-modal";
import { FlowModal } from "./billing/flow-modal";
import type { FlowMode, FlowState } from "./billing/flow-modal";
import { E } from "./billing/utils";
import { TWEAK_DEFAULTS, TweaksPanel } from "./billing/tweaks";
import type { Tweaks } from "./billing/tweaks";
import { CycleToggle, FeatureMatrix } from "./billing/feature-matrix";

const PLAN_TAB_DIFFS: Record<PlanKey, { k: string; v: string }[]> = {
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

export function App() {
  const [tweaks, setTweaks] = useState<Tweaks>(TWEAK_DEFAULTS);
  const setTweak = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) =>
    setTweaks((t) => ({ ...t, [k]: v }));

  const [addons, setAddons] = useState<Addon[]>(ADDONS_BASE);
  const [tab, setTab] = useState<string>("Summary");
  // The user's current billing cycle. The PlanModal owns its own preview state
  // but defaults to (and writes back into) this on confirm. The Tweaks panel
  // lets us flip it so reviewers can see both invoice breakdowns.
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [planOpen, setPlanOpen] = useState(false);
  const [planModalInitialCycle, setPlanModalInitialCycle] =
    useState<BillingCycle | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [flow, setFlow] = useState<FlowState>({
    open: false,
    mode: null,
    targetTier: null,
  });

  const openPlanModal = (initialCycle?: BillingCycle) => {
    setPlanModalInitialCycle(initialCycle ?? null);
    setPlanOpen(true);
  };
  const openFlow = (mode: FlowMode, targetTier: PlanKey | null) => {
    setPlanOpen(false);
    setFlow({ open: true, mode, targetTier });
  };
  const closeFlow = () => setFlow({ open: false, mode: null, targetTier: null });

  return (
    <>
      <div className="wf-stamp">
        <span>
          <b>WIREFRAME</b> · Gymly Billing · Variant A — Strak/zakelijk · mid-fi greyscale
        </span>
        <span className="right">
          All four states · upsell prominence toggleable via Tweaks ↘
        </span>
      </div>
      <div className="app">
        <SettingsNav />
        <main className="main">
          <TopBar />
          <h1 className="page-title">Billing</h1>
          <p className="page-sub">
            Plan, add-ons, usage, invoices and payment method for {GYM.name}.
          </p>
          <Tabs tab={tab} setTab={setTab} />

          <div style={{ height: 22 }} />

          {tab === "Summary" && (
            <>
              <StateBanner state={tweaks.accountState} />
              <CurrentPlan
                state={tweaks.accountState}
                cycle={billingCycle}
                onManage={() => openPlanModal()}
                onViewAll={() => setTab("Plans")}
                onSwitchToYearly={() => openPlanModal("yearly")}
              />
              <div style={{ height: 26 }} />
              <BillPreview
                addons={addons}
                cycle={billingCycle}
                showAnnotations={tweaks.showAnnotations}
              />
              <SupportPlanSection
                currentKey={tweaks.supportKey}
                onOpen={() => setSupportOpen(true)}
                showAnnotations={tweaks.showAnnotations}
              />
              <AddonsSection
                addons={addons}
                setAddons={setAddons}
                upsellMode={tweaks.upsellMode}
                showAnnotations={tweaks.showAnnotations}
              />
              <PaymentMethodSection
                state={tweaks.accountState}
                showAnnotations={tweaks.showAnnotations}
              />
              <div
                className="section"
                style={{
                  borderTop: "1px solid var(--line-2)",
                  paddingTop: 20,
                  marginTop: 20,
                }}
              >
                <div className="spread">
                  <div className="stack-tight">
                    <div className="small muted">Need to step away?</div>
                    <button
                      onClick={() => openFlow("cancel", null)}
                      style={{
                        padding: 0,
                        background: "none",
                        border: "none",
                        color: "var(--ink-2)",
                        textDecoration: "underline",
                        textUnderlineOffset: 3,
                        fontSize: 13,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      Cancel subscription →
                    </button>
                  </div>
                  <span className="small muted">
                    You'll keep full access until the end of the period.
                  </span>
                </div>
              </div>
            </>
          )}

          {tab === "Invoices" && (
            <>
              <StateBanner state={tweaks.accountState} />
              <InvoicesSection state={tweaks.accountState} />
              <div style={{ height: 30 }} />
              <PaymentMethodSection
                state={tweaks.accountState}
                showAnnotations={false}
              />
            </>
          )}

          {tab === "Plans" && (
            <div className="section">
              <div className="sect-head">
                <div>
                  <h2>Plans &amp; features</h2>
                  <div className="sub">
                    Compare every Gymly plan. Switching is handled in the "Change plan"
                    modal.
                  </div>
                </div>
                <div className="gap-row">
                  <CycleToggle cycle={billingCycle} onChange={setBillingCycle} />
                  <button className="btn primary" onClick={() => openPlanModal()}>
                    Change plan
                  </button>
                </div>
              </div>

              {/* Plan cards — same vocabulary as the picker modal, but always-on
                  cards on the page itself. Current plan is highlighted in-card. */}
              <div className="plans" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {(Object.keys(PLANS) as PlanKey[]).map((k) => {
                  const p = PLANS[k];
                  const isCurrent = k === CURRENT_PLAN_KEY;
                  const price = billingCycle === "yearly" ? p.y : p.m;
                  return (
                    <div
                      key={k}
                      className={"planopt " + (isCurrent ? "selected" : "")}
                      style={{ padding: "16px 16px 14px", gap: 5, cursor: "default" }}
                    >
                      <div className="spread" style={{ alignItems: "center" }}>
                        <div className="name" style={{ fontSize: 14 }}>
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
                        style={{
                          marginTop: -2,
                          marginBottom: 4,
                          minHeight: 44,
                          lineHeight: 1.35,
                        }}
                      >
                        {p.tagline}
                      </div>
                      <div className="price" style={{ fontSize: 20, lineHeight: 1.1 }}>
                        {E(price)}
                        <small style={{ fontSize: 11 }}> /mo</small>
                      </div>
                      <div className="small muted">
                        {billingCycle === "yearly" ? (
                          <>
                            {E(yearlyTotal(k))}/yr ·{" "}
                            <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                              save {E(yearlySavings(k))}/yr
                            </span>
                          </>
                        ) : (
                          <>
                            Billed monthly ·{" "}
                            <span style={{ color: "var(--accent)" }}>
                              {E(p.y)} on yearly
                            </span>
                          </>
                        )}
                      </div>
                      <div style={{ height: 6 }} />
                      {PLAN_TAB_DIFFS[k].map((d, i) => (
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
                          <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                            {d.v}
                          </span>
                        </div>
                      ))}
                      <div style={{ height: 6 }} />
                      <button
                        className={"btn sm " + (isCurrent ? "" : "primary")}
                        disabled={isCurrent}
                        onClick={() => openPlanModal()}
                      >
                        {isCurrent ? "Current plan" : `Switch to ${p.name}`}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Full comparison matrix — always visible on this tab. */}
              <div style={{ marginTop: 28 }}>
                <div className="spread" style={{ marginBottom: 10 }}>
                  <div>
                    <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                      Compare features
                    </h2>
                    <div className="sub" style={{ color: "var(--ink-3)", fontSize: 12.5 }}>
                      Every feature, side-by-side. Differences highlighted; uniform
                      features listed in the footer.
                    </div>
                  </div>
                  <a
                    href="#"
                    className="small"
                    onClick={(e) => e.preventDefault()}
                  >
                    Full pricing page ↗
                  </a>
                </div>
                <FeatureMatrix highlightKey={CURRENT_PLAN_KEY} />
              </div>

              {/* Usage rates — applies to every plan, mirrors the picker modal. */}
              <div style={{ marginTop: 24 }}>
                <div className="spread" style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                    Usage-based charges{" "}
                    <span className="small muted" style={{ fontWeight: 400 }}>
                      apply to every plan
                    </span>
                  </div>
                  <a
                    href="#"
                    className="small"
                    onClick={(e) => e.preventDefault()}
                  >
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
              </div>

              {/* Business plan callout — sales-led, not self-serve. */}
              <div
                className="card"
                style={{
                  marginTop: 24,
                  padding: "18px 22px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 16,
                  alignItems: "center",
                  background: "var(--bg-2)",
                }}
              >
                <div className="stack-tight">
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    Business — for franchises &amp; chains
                  </div>
                  <div className="small muted" style={{ lineHeight: 1.5 }}>
                    Custom SLA, dedicated account manager, developer API &amp; webhooks,
                    custom integrations, and a custom-branded app in the App Store and
                    Play Store. Priced from € 599 / month based on scope —{" "}
                    {YEARLY_DISCOUNT_PCT}% off on yearly.
                  </div>
                </div>
                <div className="gap-row">
                  <a
                    href="#"
                    className="btn sm"
                    onClick={(e) => e.preventDefault()}
                    style={{ textDecoration: "none" }}
                  >
                    Pricing details ↗
                  </a>
                  <a
                    href="#"
                    className="btn sm primary"
                    onClick={(e) => e.preventDefault()}
                    style={{ textDecoration: "none" }}
                  >
                    Contact sales
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <PlanModal
        open={planOpen}
        cycle={billingCycle}
        initialCycle={planModalInitialCycle}
        onClose={() => setPlanOpen(false)}
        onCycleChange={(c) => setBillingCycle(c)}
        onUpgrade={(k) => openFlow("upgrade", k)}
        onDowngrade={(k) => openFlow("downgrade", k)}
      />
      <SupportPlanModal
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        currentKey={tweaks.supportKey}
      />
      <FlowModal state={flow} onClose={closeFlow} />

      <TweaksPanel
        tweaks={tweaks}
        setTweak={setTweak}
        cycle={billingCycle}
        setCycle={setBillingCycle}
        onOpenPlan={() => openPlanModal()}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenUpgrade={() => openFlow("upgrade", "pro")}
        onOpenDowngrade={() => openFlow("downgrade", "starter")}
        onOpenCancel={() => openFlow("cancel", null)}
      />
    </>
  );
}
