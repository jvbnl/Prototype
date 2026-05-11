"use client";

import { useState } from "react";
import { ADDONS_BASE, GYM, PLANS } from "./billing/data";
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
                  <h2>Plans</h2>
                  <div className="sub">
                    Compare base plans. Switching is handled in the "Change plan" modal.
                  </div>
                </div>
                <div className="right">
                  <button
                    className="btn primary"
                    onClick={() => setPlanOpen(true)}
                  >
                    Open change-plan flow
                  </button>
                </div>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div
                  className="plans"
                  style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
                >
                  {(Object.keys(PLANS) as PlanKey[]).map((k) => {
                    const p = PLANS[k];
                    const price = billingCycle === "yearly" ? p.y : p.m;
                    return (
                      <div key={k} className="planopt">
                        <div className="name">{p.name}</div>
                        <div className="price">
                          {E(price)} <small>/month</small>
                        </div>
                        <div className="small muted">
                          {billingCycle === "yearly"
                            ? `Billed yearly · ${E(p.y * 12)}/year`
                            : "Billed monthly"}
                        </div>
                        <ul>
                          <li>Locations: {p.locations}</li>
                          <li className="muted">{p.tagline}</li>
                        </ul>
                      </div>
                    );
                  })}
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
