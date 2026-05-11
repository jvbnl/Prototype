import { useState } from "react";
import type {
  AccountState,
  BillingCycle,
  SupportKey,
  UpsellMode,
} from "./data";

export type Tweaks = {
  accountState: AccountState;
  upsellMode: UpsellMode;
  showAnnotations: boolean;
  supportKey: SupportKey;
};

export const TWEAK_DEFAULTS: Tweaks = {
  accountState: "active",
  upsellMode: "medium",
  showAnnotations: true,
  supportKey: "standard",
};

export function TweaksPanel({
  tweaks,
  setTweak,
  cycle,
  setCycle,
  onOpenPlan,
  onOpenSupport,
  onOpenUpgrade,
  onOpenDowngrade,
  onOpenCancel,
}: {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void;
  cycle: BillingCycle;
  setCycle: (c: BillingCycle) => void;
  onOpenPlan: () => void;
  onOpenSupport: () => void;
  onOpenUpgrade: () => void;
  onOpenDowngrade: () => void;
  onOpenCancel: () => void;
}) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        className="twk-panel"
        onClick={() => setOpen(true)}
        style={{
          width: "auto",
          padding: "8px 12px",
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
        }}
      >
        ⚙ Tweaks
      </button>
    );
  }

  return (
    <div className="twk-panel">
      <div className="twk-hd">
        <b>Wireframe tweaks</b>
        <button
          className="twk-x"
          onClick={() => setOpen(false)}
          aria-label="Hide tweaks"
        >
          ✕
        </button>
      </div>
      <div className="twk-body">
        <div className="twk-sect">State coverage</div>
        <div className="twk-row">
          <label className="twk-lbl">
            <span>Account state</span>
          </label>
          <select
            className="twk-field"
            value={tweaks.accountState}
            onChange={(e) => setTweak("accountState", e.target.value as AccountState)}
          >
            <option value="active">Active (default)</option>
            <option value="trial">Trial (no payment method)</option>
            <option value="past-due">Past-due (failed payment)</option>
            <option value="downgrade-pending">Downgrade pending</option>
          </select>
        </div>

        <div className="twk-sect">Billing cycle</div>
        <div className="twk-row">
          <label className="twk-lbl">
            <span>Active cycle</span>
          </label>
          <div className="twk-seg">
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                className={cycle === c ? "on" : ""}
                onClick={() => setCycle(c)}
              >
                {c === "monthly" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
        </div>

        <div className="twk-sect">Upsell prominence</div>
        <div className="twk-row">
          <label className="twk-lbl">
            <span>Mode</span>
          </label>
          <div className="twk-seg">
            {(["subtle", "medium", "aggressive"] as const).map((m) => (
              <button
                key={m}
                className={tweaks.upsellMode === m ? "on" : ""}
                onClick={() => setTweak("upsellMode", m)}
              >
                {m === "subtle" ? "Subtle" : m === "medium" ? "Medium" : "Aggr."}
              </button>
            ))}
          </div>
        </div>

        <div className="twk-sect">Support plan</div>
        <div className="twk-row">
          <label className="twk-lbl">
            <span>Current tier</span>
          </label>
          <div className="twk-seg">
            {(["standard", "enhanced", "premium"] as const).map((s) => (
              <button
                key={s}
                className={tweaks.supportKey === s ? "on" : ""}
                onClick={() => setTweak("supportKey", s)}
              >
                {s === "standard" ? "Std" : s === "enhanced" ? "Enh" : "Prem"}
              </button>
            ))}
          </div>
        </div>
        <button className="twk-btn" onClick={onOpenSupport}>
          Open support comparison
        </button>

        <div className="twk-sect">Wireframe</div>
        <div className="twk-row twk-row-h" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <span>Show annotations</span>
          <button
            className="twk-toggle"
            data-on={tweaks.showAnnotations ? "1" : "0"}
            onClick={() => setTweak("showAnnotations", !tweaks.showAnnotations)}
            aria-label="Toggle annotations"
          >
            <i />
          </button>
        </div>
        <button className="twk-btn" onClick={onOpenPlan}>
          Open plan-change modal
        </button>
        <button className="twk-btn" onClick={onOpenUpgrade}>
          Open upgrade flow (→ Pro)
        </button>
        <button className="twk-btn" onClick={onOpenDowngrade}>
          Open downgrade flow (→ Starter)
        </button>
        <button className="twk-btn" onClick={onOpenCancel}>
          Open cancel flow
        </button>
      </div>
    </div>
  );
}
