import { GYM } from "./data";
import type { AccountState } from "./data";

export function SettingsNav() {
  const items: { group: string; rows: string[] }[] = [
    {
      group: "Commerce",
      rows: ["Activity Types", "Memberships", "Widget", "Discounts", "Marketing tracking"],
    },
    { group: "Point of Sale", rows: ["Products", "Categories"] },
    { group: "Workflows", rows: ["Lead workflow", "No-show policy", "Payroll"] },
    { group: "Data", rows: ["User", "Organization", "Required fields"] },
    {
      group: "Management",
      rows: ["Billing", "Calendars", "Ledgers", "Email templates", "Security", "Payments", "Trash"],
    },
  ];
  return (
    <nav className="nav" aria-label="Settings">
      <div className="brand">
        <div className="mark">G</div>
        <b>Gymly</b>
        <span className="muted small" style={{ marginLeft: "auto" }}>
          {GYM.name}
        </span>
      </div>
      <div className="crumb">
        <span>Settings</span>
        <span>‹ Back</span>
      </div>
      {items.map((g) => (
        <div key={g.group}>
          <div className="group">{g.group}</div>
          {g.rows.map((r) => (
            <a
              key={r}
              href="#"
              className={"row " + (r === "Billing" ? "active" : "")}
              onClick={(e) => e.preventDefault()}
            >
              <span className="ico" /> {r}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function TopBar() {
  return (
    <div className="topbar">
      <div className="crumbs">
        Settings <span style={{ margin: "0 6px" }}>/</span> <b>Billing</b>
      </div>
      <div className="actions">
        <span className="small muted">
          Org: <b style={{ color: "var(--ink)" }}>{GYM.name}</b> · {GYM.locations} locations
        </span>
        <button className="btn ghost">Contact support</button>
      </div>
    </div>
  );
}

export function Tabs({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  return (
    <div className="tabs">
      {["Summary", "Invoices", "Plans"].map((t) => (
        <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}

export function StateBanner({ state }: { state: AccountState }) {
  if (state === "active") return null;
  if (state === "trial")
    return (
      <div className="banner info" role="status">
        <span className="dot" />
        <div className="body">
          <h3>You're on a 14-day trial — 6 days left</h3>
          <p>
            Add a payment method before May 17 to keep your account active. We won't charge you
            until the trial ends.
          </p>
          <div className="meta">No charges yet · Trial ends 2026-05-17</div>
        </div>
        <div className="cta">
          <button className="btn">Continue trial</button>
          <button className="btn primary">Add payment method</button>
        </div>
      </div>
    );
  if (state === "past-due")
    return (
      <div className="banner danger" role="alert">
        <span className="dot" />
        <div className="body">
          <h3>Payment failed — action required by May 18</h3>
          <p>
            We couldn't collect € 247,32 from your account ending •• 4421 on May 11. Update your
            payment method or retry to avoid account suspension.
          </p>
          <div className="meta">
            Adyen reason: <span className="mono">REFUSED — Insufficient funds</span> · 2 retries
            scheduled
          </div>
        </div>
        <div className="cta">
          <button className="btn">Retry payment</button>
          <button className="btn primary">Update method</button>
        </div>
      </div>
    );
  if (state === "downgrade-pending")
    return (
      <div className="banner warn">
        <span className="dot" />
        <div className="body">
          <h3>Downgrade to Growth scheduled for Dec 31, 2026</h3>
          <p>
            You'll keep all Pro features until your current billing period ends. Add-ons not
            available on Growth will be paused.
          </p>
          <div className="meta">
            Affected add-ons: Leads (will become included), AI Coach (will be paused)
          </div>
        </div>
        <div className="cta">
          <button className="btn">Keep Pro</button>
          <button className="btn ghost">Review changes</button>
        </div>
      </div>
    );
  return null;
}
