import {
  CURRENT_PLAN_KEY,
  PLANS,
  SUPPORT_PLANS,
  USAGE,
  GYM,
  YEARLY_DISCOUNT_PCT,
  yearlySavings,
  yearlyTotal,
} from "./data";
import type {
  AccountState,
  Addon,
  BillingCycle,
  SupportKey,
  UpsellMode,
} from "./data";
import { E } from "./utils";

// Yearly invoices are paid up front; the next time the plan line shows up on
// an invoice is the renewal date. Monthly bundles plan + usage every period.
const NEXT_PLAN_RENEWAL_YEARLY = "Dec 31, 2026";
const NEXT_INVOICE_MONTHLY = "Jun 1, 2026";

export function CurrentPlan({
  state,
  cycle,
  onManage,
  onViewAll,
  onSwitchToYearly,
}: {
  state: AccountState;
  cycle: BillingCycle;
  onManage: () => void;
  onViewAll: () => void;
  onSwitchToYearly: () => void;
}) {
  const plan = PLANS[CURRENT_PLAN_KEY];
  const isYearly = cycle === "yearly";
  const price = isYearly ? plan.y : plan.m;
  const renew = isYearly ? NEXT_PLAN_RENEWAL_YEARLY : NEXT_INVOICE_MONTHLY;
  const savings = yearlySavings(CURRENT_PLAN_KEY);

  let pill = <span className="pill ok">● Active</span>;
  if (state === "trial") pill = <span className="pill warn">● Trial — 6 days left</span>;
  if (state === "past-due") pill = <span className="pill danger">● Past due</span>;
  if (state === "downgrade-pending")
    pill = <span className="pill warn">● Downgrade pending</span>;

  return (
    <div className="plan-card">
      <div className="cell">
        <div className="label">Current plan</div>
        <div className="value">Gymly {plan.name}</div>
        <div style={{ marginTop: 6 }}>{pill}</div>
      </div>
      <div className="cell price">
        <div className="label">Plan price</div>
        <div className="value">
          {E(price)} <span className="small muted">/month</span>
        </div>
        <div className="small muted">
          {isYearly
            ? `Billed yearly · ${E(yearlyTotal(CURRENT_PLAN_KEY))}/year`
            : "Billed monthly · cancel any time"}
        </div>
        {!isYearly && state === "active" && (
          <button
            type="button"
            onClick={onSwitchToYearly}
            className="save"
            style={{
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              textDecoration: "underline",
              textUnderlineOffset: 2,
              textDecorationColor: "var(--line)",
              marginTop: 4,
            }}
          >
            Switch to yearly · save {E(savings)}/year ({YEARLY_DISCOUNT_PCT}% off) →
          </button>
        )}
      </div>
      <div className="cell">
        <div className="label">
          {state === "downgrade-pending"
            ? "Plan changes on"
            : isYearly
              ? "Plan renews"
              : "Next invoice"}
        </div>
        <div className="value mono" style={{ fontWeight: 500 }}>
          {renew}
        </div>
        <div className="small muted">
          {isYearly ? (
            <>
              Add-ons & usage billed monthly{" "}
              <span
                className="info-i"
                title="On the yearly cycle the plan is paid up front. Add-ons and payment-processing fees are still invoiced at the start of each month."
              >
                i
              </span>
            </>
          ) : (
            <>
              One invoice per month{" "}
              <span
                className="info-i"
                title="Plan, add-ons and payment-processing fees are bundled into one invoice on the 1st of every month."
              >
                i
              </span>
            </>
          )}
        </div>
      </div>
      <div className="actions">
        <button className="btn primary" onClick={onManage}>
          Manage plan
        </button>
        <button className="btn ghost" onClick={onViewAll}>
          View all plans
        </button>
      </div>
    </div>
  );
}

// Monthly: plan + add-ons + usage are bundled into a single invoice on the 1st.
// Yearly:  plan was paid up front, so the monthly invoice covers add-ons + usage
// only — the plan line still appears as €0 with a "prepaid through" sub-copy
// so the breakdown stays familiar.
export function BillPreview({
  addons,
  cycle,
  showAnnotations,
}: {
  addons: Addon[];
  cycle: BillingCycle;
  showAnnotations: boolean;
}) {
  const plan = PLANS[CURRENT_PLAN_KEY];
  const isYearly = cycle === "yearly";
  const planThisMonth = isYearly ? 0 : plan.m;

  const activeAddons = addons.filter((a) => a.active);
  const addonTotal = activeAddons.reduce((s, a) => s + a.price * (a.qty || 1), 0);
  const usageTotal = USAGE.reduce((s, u) => s + (u.forecast || 0), 0);

  const subtotal = planThisMonth + addonTotal + usageTotal;
  const vat = subtotal * 0.21;
  const total = subtotal + vat;

  return (
    <div>
      <div className="sect-head">
        <div>
          <h2>This month's bill — preview</h2>
          <div className="sub">
            Estimated total for the period May 1 — May 31, 2026 · invoiced June 1
            {isYearly ? " (add-ons & usage only)" : " (single invoice)"}
          </div>
        </div>
        <div className="right">
          <span className="kbd">i</span> Updated live as add-ons &amp; usage change
        </div>
      </div>

      <div className="bill">
        <div className="head">
          <div>
            <h3>Estimated total — May 2026</h3>
            <div className="sub">
              {isYearly
                ? `Add-ons and usage only · plan prepaid through ${NEXT_PLAN_RENEWAL_YEARLY}`
                : "Plan, add-ons and usage on one invoice · charged Jun 1"}
            </div>
          </div>
          <div className="total">
            {E(total)}
            <small>incl. 21% VAT</small>
          </div>
        </div>
        <div className="why">
          <span className="ico">ⓘ</span>
          <div>
            {isYearly ? (
              <>
                <b>Plan prepaid for the year.</b> Your plan is paid through{" "}
                {NEXT_PLAN_RENEWAL_YEARLY}. This month's invoice covers add-ons and
                payment-processing fees only — same monthly billing date, smaller amount.
              </>
            ) : (
              <>
                <b>One invoice per month.</b> Plan, add-ons and payment-processing fees are
                bundled together and charged on the 1st of every month.
              </>
            )}
          </div>
        </div>
        <div className="grp">
          <div className="ghead">
            <span>Plan</span>
            <span className="cycle">
              {isYearly ? "prepaid yearly" : "billed monthly"}
            </span>
          </div>
          <div className="line">
            <div className="name">
              Gymly {plan.name}{" "}
              <small>
                {isYearly
                  ? `Prepaid through ${NEXT_PLAN_RENEWAL_YEARLY}`
                  : "Monthly subscription"}
              </small>
            </div>
            <div className="qty">
              {isYearly ? `${E(plan.y)} × 12 paid up front` : `1 × ${E(plan.m)}`}
            </div>
            <div className="amt">
              {isYearly ? (
                <>
                  {E(0)}
                  <small>this period</small>
                </>
              ) : (
                E(plan.m)
              )}
            </div>
          </div>
        </div>
        <div className="grp">
          <div className="ghead">
            <span>Add-ons</span>
            <span className="cycle">
              {activeAddons.length} active · recurring monthly
            </span>
          </div>
          {activeAddons.map((a) => (
            <div className="line" key={a.id}>
              <div className="name">
                {a.name}
                {a.qty && a.qty > 1 ? ` × ${a.qty}` : ""}
              </div>
              <div className="qty">
                {a.qty && a.qty > 1 ? `${a.qty} × ${E(a.price)}` : `1 × ${E(a.price)}`}
              </div>
              <div className="amt">{E(a.price * (a.qty || 1))}</div>
            </div>
          ))}
        </div>
        <div className="grp">
          <div className="ghead">
            <span>Usage so far</span>
            <span className="cycle">may 1 — today · billed in arrears</span>
          </div>
          {USAGE.filter((u) => u.forecast > 0).map((u) => (
            <div className="line" key={u.id}>
              <div className="name">
                {u.name}{" "}
                <small>
                  {u.used} {u.unit}
                  {u.included ? ` · ${u.included} included` : ""}
                </small>
              </div>
              <div className="qty">@ {E(u.rate)}</div>
              <div className="amt">
                {E(u.forecast)}
                <small>forecast</small>
              </div>
            </div>
          ))}
        </div>
        <div className="totals">
          <div className="lbl">Subtotal</div>
          <div className="amt">{E(subtotal)}</div>
          <div className="lbl">VAT (21%)</div>
          <div className="amt">{E(vat)}</div>
          <div
            className="lbl grand"
            style={{
              borderTop: "1px solid var(--line-2)",
              paddingTop: 8,
              marginTop: 4,
            }}
          >
            Total
          </div>
          <div
            className="amt grand"
            style={{
              borderTop: "1px solid var(--line-2)",
              paddingTop: 8,
              marginTop: 4,
            }}
          >
            {E(total)}
          </div>
        </div>
      </div>

      {showAnnotations && (
        <div className="note block">
          {isYearly
            ? "⚑ Yearly cycle view: plan line still shown for continuity but the period charge is € 0,00 (prepaid up front). Only add-ons + payment-processing fees roll into this month's invoice."
            : "⚑ Monthly cycle view: plan + add-ons + payment-processing fees on one invoice each month. No SMS or storage charges (Gymly doesn't bill these)."}
        </div>
      )}
    </div>
  );
}

export function AddonsSection({
  addons,
  setAddons,
  upsellMode,
  showAnnotations,
}: {
  addons: Addon[];
  setAddons: (a: Addon[]) => void;
  upsellMode: UpsellMode;
  showAnnotations: boolean;
}) {
  const toggle = (id: string) =>
    setAddons(addons.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  const setQty = (id: string, d: number) =>
    setAddons(
      addons.map((a) =>
        a.id === id ? { ...a, qty: Math.max(1, (a.qty || 1) + d) } : a,
      ),
    );

  const recommended = addons.filter((a) => a.recommend && !a.active);
  const active = addons.filter((a) => a.active);
  const available = addons.filter((a) => !a.active && !a.recommend);

  return (
    <div className="section">
      <div className="sect-head">
        <div>
          <h2>Add-ons</h2>
          <div className="sub">
            Recurring monthly · cancel any time · prorated on changes{" "}
            <span
              className="info-i"
              title="When you add an add-on mid-month, you're charged a prorated amount until the 1st. When you remove one, you keep access until end of period."
            >
              i
            </span>
          </div>
        </div>
        <div className="right">
          {active.length} active ·{" "}
          {E(active.reduce((s, a) => s + a.price * (a.qty || 1), 0))}/month
        </div>
      </div>

      {upsellMode !== "subtle" && recommended.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div className="small muted" style={{ margin: "4px 0 8px" }}>
            {upsellMode === "aggressive"
              ? "▲ Recommended based on your usage"
              : "Recommended for you"}
          </div>
          <div className="addons">
            {recommended.map((a) => (
              <div className="addon recommended" key={a.id}>
                <div className="top">
                  <div className="name">{a.name}</div>
                  <span className="status upsell">
                    {upsellMode === "aggressive" ? "Boost +23%" : "Recommended"}
                  </span>
                </div>
                <div className="desc">{a.desc}</div>
                {upsellMode === "aggressive" && (
                  <div className="small" style={{ color: "var(--accent)" }}>
                    {a.id === "ai" &&
                      "Gyms with AI Coach reduce support time by ~6h/week."}
                    {a.id === "nutri" &&
                      "Members who track nutrition retain 2× longer on average."}
                  </div>
                )}
                <div className="foot">
                  <div className="price">
                    {E(a.price)} <small>/month</small>
                  </div>
                  <button className="btn primary sm" onClick={() => toggle(a.id)}>
                    ＋ Add
                  </button>
                </div>
              </div>
            ))}
          </div>
          {showAnnotations && upsellMode === "aggressive" && (
            <div className="note block">
              ⚑ Aggressive upsell mode: usage-based copy + outcome-claim subtitle. Pull these stats
              from CRM later.
            </div>
          )}
          <hr className="div" />
        </div>
      )}

      <div className="small muted" style={{ margin: "4px 0 8px" }}>
        Active
      </div>
      <div className="addons">
        {active.map((a) => (
          <div className="addon" key={a.id}>
            <div className="top">
              <div className="name">{a.name}</div>
              <span className="status active">● Active</span>
            </div>
            <div className="desc">{a.desc}</div>
            <div className="foot">
              <div className="gap-row">
                <div className="price">
                  {E(a.price)}{" "}
                  <small>
                    /month
                    {a.qty && a.qty > 1 ? ` × ${a.qty}` : ""}
                  </small>
                </div>
                {a.id.startsWith("terminal") && (
                  <div className="stepper" title="Number of terminals">
                    <button onClick={() => setQty(a.id, -1)}>−</button>
                    <span className="v">{a.qty || 1}</span>
                    <button onClick={() => setQty(a.id, +1)}>＋</button>
                  </div>
                )}
              </div>
              <button
                className="swtch"
                data-on="1"
                onClick={() => toggle(a.id)}
                aria-label={`Disable ${a.name}`}
              >
                <i />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="small muted" style={{ margin: "18px 0 8px" }}>
        Available
      </div>
      <div className="addons">
        {available.map((a) => {
          // Leads are included on Pro (the current plan) — surface that.
          const isLeadsIncluded = a.id === "leads";
          return (
            <div className="addon" key={a.id}>
              <div className="top">
                <div className="name">{a.name}</div>
                <span className={"status " + (isLeadsIncluded ? "included" : "")}>
                  {isLeadsIncluded ? "Included on Pro" : "Available"}
                </span>
              </div>
              <div className="desc">{a.desc}</div>
              <div className="foot">
                <div className="price">
                  {isLeadsIncluded ? (
                    <span className="muted">Included</span>
                  ) : (
                    <>
                      {E(a.price)} <small>/month</small>
                    </>
                  )}
                </div>
                {isLeadsIncluded ? (
                  <button className="btn sm" disabled style={{ opacity: 0.6 }}>
                    ✓ Included
                  </button>
                ) : (
                  <button className="btn sm" onClick={() => toggle(a.id)}>
                    ＋ Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAnnotations && (
        <div className="note block">
          ⚑ Add-on UX: inline toggle for already-active items (fast off-switch). "Add" CTA for
          inactive — opens confirmation with prorated charge. Stepper only on quantity-driven
          add-ons (locations, terminals).
        </div>
      )}
    </div>
  );
}

export function UsageSection({ showAnnotations }: { showAnnotations: boolean }) {
  const totalForecast = USAGE.reduce((s, u) => s + u.forecast, 0);
  return (
    <div className="section">
      <div className="sect-head">
        <div>
          <h2>Usage this period</h2>
          <div className="sub">
            May 1 — May 31, 2026 · resets on the 1st{" "}
            <span
              className="info-i"
              title="Usage is metered as it happens and billed in arrears on the 1st of the next month. Caps and alerts can be set per item."
            >
              i
            </span>
          </div>
        </div>
        <div className="right">
          At current pace, total usage this month ≈{" "}
          <b className="mono">{E(totalForecast)}</b>
        </div>
      </div>
      <div className="card" style={{ padding: "18px 20px" }}>
        <div className="usage">
          {USAGE.map((u) => {
            const cap = u.included || 0;
            const pct = cap > 0 ? Math.min(100, (u.used / cap) * 100) : 0;
            const unmetered = !cap;
            return (
              <div className="meter" key={u.id}>
                <div className="top">
                  <div className="name">
                    {u.name} {u.sub && <small>{u.sub}</small>}
                  </div>
                  <div className="count">
                    <b>{u.used.toLocaleString("nl-NL")}</b>
                    <span className="muted">
                      {" "}
                      / {cap ? cap.toLocaleString("nl-NL") : "∞"}
                    </span>
                    <span className="muted" style={{ fontFamily: "var(--font-sans)" }}>
                      {" "}
                      {u.unit}
                    </span>
                  </div>
                </div>
                <div className={"bar " + (unmetered ? "unmetered" : "")}>
                  {!unmetered && <i style={{ width: pct + "%" }} />}
                </div>
                <div className="foot">
                  <span>
                    {u.rate
                      ? `${E(u.rate)} per ${u.unit.replace(/s$/, "")}`
                      : "Included"}
                  </span>
                  <span className="fc">
                    {u.forecast
                      ? `Forecast: ${E(u.forecast)} this month`
                      : cap
                        ? `${(cap - u.used).toFixed(1)} ${u.unit} remaining`
                        : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showAnnotations && (
        <div className="note block">
          ⚑ Linear bar meter (chosen style). Stripe-on-stripe pattern for "unmetered/no cap" so we
          don't fake a fill. Forecast text right-aligned so it scans next to the bar end.
        </div>
      )}
    </div>
  );
}

export function PaymentMethodSection({
  state,
  showAnnotations,
}: {
  state: AccountState;
  showAnnotations: boolean;
}) {
  if (state === "trial") {
    return (
      <div className="section">
        <div className="sect-head">
          <div>
            <h2>Payment method</h2>
            <div className="sub">Required before trial ends on May 17, 2026.</div>
          </div>
        </div>
        <div
          className="card"
          style={{ padding: "20px", borderStyle: "dashed", textAlign: "center" }}
        >
          <div style={{ maxWidth: 420, margin: "0 auto" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              No payment method on file
            </div>
            <p className="small muted" style={{ margin: "0 0 12px" }}>
              Add a SEPA Direct Debit or credit card via Adyen. We won't charge until your trial
              ends.
            </p>
            <button className="btn primary">＋ Add payment method</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="section">
      <div className="sect-head">
        <div>
          <h2>Payment method</h2>
          <div className="sub">
            Used for both your yearly plan invoice and monthly add-ons + usage invoices.
          </div>
        </div>
        <div className="right">
          <a href="#" onClick={(e) => e.preventDefault()}>
            Adyen receipt portal ↗
          </a>
        </div>
      </div>
      <div className="pm">
        <div className="left">
          <span className="ico-bank">IBAN</span>
          <div className="meta">
            <b>SEPA Direct Debit · NL•• •••• 4421</b>
            <small>
              CrossFit Amsterdam B.V. · authorised Jan 2024 · default method
            </small>
            {state === "past-due" && (
              <small style={{ color: "var(--danger)", marginTop: 4 }}>
                Last attempt 2026-05-11 — REFUSED (insufficient funds). Next retry May 14.
              </small>
            )}
          </div>
        </div>
        <div className="gap-row">
          <button className="btn sm">Replace</button>
          <button className="btn sm ghost">＋ Add backup card</button>
        </div>
      </div>
      {showAnnotations && (
        <div className="note block">
          ⚑ Single payment method covers both invoice streams. If we ever split (e.g. card for
          usage, IBAN for plan) — add per-stream selector here.
        </div>
      )}
    </div>
  );
}

// Compact "current support tier + key SLA at-a-glance" card.
// Inspired by AWS Support / Vercel's support row in account settings —
// keep the overview row short, push the full matrix into a modal.
export function SupportPlanSection({
  currentKey,
  onOpen,
  showAnnotations,
}: {
  currentKey: SupportKey;
  onOpen: () => void;
  showAnnotations: boolean;
}) {
  const sp = SUPPORT_PLANS[currentKey];
  const tierIdx = Object.keys(SUPPORT_PLANS).indexOf(currentKey);
  return (
    <div className="section">
      <div className="sect-head">
        <div>
          <h2>Support plan</h2>
          <div className="sub">Response-time SLA, channels and hours for {GYM.name}.</div>
        </div>
        <div className="right">
          <button className="btn ghost" onClick={onOpen}>
            Compare support plans
          </button>
        </div>
      </div>
      <div className="card" style={{ padding: "16px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr 1.2fr 1.4fr auto",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div className="stack-tight">
            <div className="small muted">Current support plan</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>{sp.name}</div>
            <div className="small muted">{sp.priceDetail}</div>
          </div>
          <div className="stack-tight">
            <div className="small muted">P1 first response</div>
            <div className="mono" style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>
              {sp.sla.p1}
            </div>
            <div className="small muted">P2 · {sp.sla.p2}</div>
          </div>
          <div className="stack-tight">
            <div className="small muted">Support hours</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.45, marginTop: 2 }}>
              {(Array.isArray(sp.hours) ? sp.hours : [sp.hours]).map((h, i) => (
                <div key={i}>{h}</div>
              ))}
            </div>
          </div>
          <div className="stack-tight">
            <div className="small muted">Channels</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.45, marginTop: 2 }}>
              {sp.channels.join(" · ")}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            {tierIdx < 2 ? (
              <button
                className="btn primary"
                onClick={onOpen}
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                Upgrade →
              </button>
            ) : (
              <span className="badge" style={{ color: "var(--ink-3)" }}>
                Top tier
              </span>
            )}
          </div>
        </div>
      </div>
      {showAnnotations && (
        <div className="note block">
          ⚑ Compact overview row: current tier + the P1 SLA users actually need at a glance. Full
          SLA matrix, hours and channels comparison live in the modal (avoids cluttering the
          billing page). Upgrades are sales-assisted, not self-serve.
        </div>
      )}
    </div>
  );
}
