import {
  FEATURE_MATRIX,
  FEATURE_MATRIX_COMMON,
  PLANS,
  YEARLY_DISCOUNT_PCT,
} from "./data";
import type { BillingCycle, Feature, FeatureValue, PlanKey } from "./data";

const PLAN_ORDER: PlanKey[] = ["studio", "starter", "pro"];

function renderCell(value: FeatureValue) {
  if (typeof value === "string") {
    return <span style={{ fontSize: 12.5 }}>{value}</span>;
  }
  return value ? (
    <span style={{ color: "var(--ink)", fontSize: 13 }}>✓</span>
  ) : (
    <span style={{ color: "var(--ink-4)", fontSize: 13 }}>—</span>
  );
}

// Reference: Notion / Linear / Stripe pricing pages. Categories surface as
// subtle row dividers; the current plan column is tinted so the user always
// knows where they sit. Common-across-plans features collapse into a one-line
// footer to keep the table scannable.
export function FeatureMatrix({ highlightKey }: { highlightKey: PlanKey }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "10px 14px",
                background: "var(--bg-2)",
                fontWeight: 500,
                fontSize: 11,
                color: "var(--ink-2)",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                width: "44%",
              }}
            >
              Feature
            </th>
            {PLAN_ORDER.map((k) => (
              <th
                key={k}
                style={{
                  textAlign: "center",
                  padding: "10px 14px",
                  background: k === highlightKey ? "var(--bg-3)" : "var(--bg-2)",
                  fontWeight: 600,
                  fontSize: 12.5,
                  color: "var(--ink)",
                  borderLeft: "1px solid var(--line-2)",
                  width: "18.66%",
                }}
              >
                {PLANS[k].name}
                {k === highlightKey && (
                  <span
                    className="small muted"
                    style={{ marginLeft: 6, fontWeight: 400 }}
                  >
                    current
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURE_MATRIX.map((cat) => (
            <CategoryRows key={cat.id} category={cat} highlightKey={highlightKey} />
          ))}
        </tbody>
      </table>
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--line-2)",
          background: "var(--bg-2)",
          fontSize: 12,
          color: "var(--ink-2)",
          lineHeight: 1.55,
        }}
      >
        <b style={{ color: "var(--ink)" }}>All plans include:</b>{" "}
        {FEATURE_MATRIX_COMMON.join(" · ")}.
      </div>
    </div>
  );
}

function CategoryRows({
  category,
  highlightKey,
}: {
  category: { id: string; label: string; features: Feature[] };
  highlightKey: PlanKey;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={4}
          style={{
            padding: "10px 14px 4px",
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".06em",
            color: "var(--ink-3)",
            borderTop: "1px solid var(--line-2)",
            background: "#fafafa",
          }}
        >
          {category.label}
        </td>
      </tr>
      {category.features.map((f) => (
        <tr key={f.id} style={{ borderTop: "1px solid var(--line-2)" }}>
          <td style={{ padding: "10px 14px", color: "var(--ink-2)" }}>{f.label}</td>
          {PLAN_ORDER.map((k) => (
            <td
              key={k}
              style={{
                padding: "10px 14px",
                textAlign: "center",
                borderLeft: "1px solid var(--line-2)",
                background: k === highlightKey ? "var(--bg-2)" : "transparent",
              }}
            >
              {renderCell(f[k])}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Notion / Linear pattern: a segmented control with the discount badge sitting
// inside the "Yearly" tab so the savings are the headline, not the fine print.
export function CycleToggle({
  cycle,
  onChange,
}: {
  cycle: BillingCycle;
  onChange: (c: BillingCycle) => void;
}) {
  return (
    <div className="cycle-toggle" role="tablist" aria-label="Billing cycle">
      <button
        role="tab"
        aria-selected={cycle === "monthly"}
        className={cycle === "monthly" ? "on" : ""}
        onClick={() => onChange("monthly")}
      >
        Monthly
      </button>
      <button
        role="tab"
        aria-selected={cycle === "yearly"}
        className={cycle === "yearly" ? "on" : ""}
        onClick={() => onChange("yearly")}
      >
        Yearly{" "}
        <span
          style={{
            marginLeft: 6,
            padding: "1px 6px",
            borderRadius: 999,
            background: cycle === "yearly" ? "rgba(255,255,255,.18)" : "var(--ok-bg)",
            color: cycle === "yearly" ? "#fff" : "#1f4f33",
            border:
              cycle === "yearly" ? "1px solid rgba(255,255,255,.2)" : "1px solid #cfdfd3",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: ".02em",
          }}
        >
          Save {YEARLY_DISCOUNT_PCT}%
        </span>
      </button>
    </div>
  );
}
