import { useEffect, useState } from "react";
import { ADDONS_BASE, GYM, PLANS } from "./data";
import type { Addon, PlanKey } from "./data";
import { SettingsNav, StateBanner, Tabs, TopBar } from "./chrome";
import {
  AddonsSection,
  BillPreview,
  CurrentPlan,
  PaymentMethodSection,
  SupportPlanSection,
} from "./overview";
import { InvoicesSection } from "./invoices";
import { PlanModal } from "./plan-modal";
import { SupportPlanModal } from "./support-modal";
import { FlowModal } from "./flow-modal";
import type { FlowMode, FlowState } from "./flow-modal";
import { E } from "./utils";
import { TWEAK_DEFAULTS, TweaksPanel } from "./tweaks";
import type { Tweaks } from "./tweaks";
import billingCss from "./styles.css?inline";

export function BillingPrototype() {
  useEffect(() => {
    const style = document.createElement("style");
    style.dataset.proto = "billing";
    style.textContent = billingCss;
    document.head.appendChild(style);
    const prevBg = document.body.style.background;
    return () => {
      style.remove();
      document.body.style.background = prevBg;
    };
  }, []);

  const [tweaks, setTweaks] = useState<Tweaks>(TWEAK_DEFAULTS);
  const setTweak = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) =>
    setTweaks((t) => ({ ...t, [k]: v }));

  const [addons, setAddons] = useState<Addon[]>(ADDONS_BASE);
  const [tab, setTab] = useState<string>("Summary");
  const [planOpen, setPlanOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [flow, setFlow] = useState<FlowState>({
    open: false,
    mode: null,
    targetTier: null,
  });

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
          <a
            href="#/"
            style={{ color: "#d8d8d8", textDecoration: "none", marginRight: 16 }}
          >
            ← All prototypes
          </a>
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
                onManage={() => setPlanOpen(true)}
                onViewAll={() => setTab("Plans")}
              />
              <div style={{ height: 26 }} />
              <BillPreview
                addons={addons}
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
                    return (
                      <div key={k} className="planopt">
                        <div className="name">{p.name}</div>
                        <div className="price">
                          {E(p.m)} <small>/month</small>
                        </div>
                        <div className="small muted">Billed monthly</div>
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
        onClose={() => setPlanOpen(false)}
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
        onOpenPlan={() => setPlanOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenUpgrade={() => openFlow("upgrade", "pro")}
        onOpenDowngrade={() => openFlow("downgrade", "starter")}
        onOpenCancel={() => openFlow("cancel", null)}
      />
    </>
  );
}
