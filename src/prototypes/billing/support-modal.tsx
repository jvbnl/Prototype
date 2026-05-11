import { PRIORITY_DEFS, SUPPORT_PLANS } from "./data";
import type { SupportKey } from "./data";

// Pattern: tier cards on top, response-time matrix below (priority × tier),
// hours strip below that. Current tier is highlighted in every block.
export function SupportPlanModal({
  open,
  onClose,
  currentKey,
}: {
  open: boolean;
  onClose: () => void;
  currentKey: SupportKey;
}) {
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: 940 }}
      >
        <div className="modal-hd">
          <div>
            <h2>Support plans</h2>
            <div className="small muted">
              Currently on{" "}
              <b style={{ color: "var(--ink)" }}>{SUPPORT_PLANS[currentKey].name}</b> · upgrades
              are sales-assisted
            </div>
          </div>
          <button className="x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body" style={{ padding: "22px 22px 18px" }}>
          {/* Tier cards */}
          <div className="plans" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {Object.entries(SUPPORT_PLANS).map(([k, sp]) => {
              const isCurrent = k === currentKey;
              return (
                <div
                  key={k}
                  className={"planopt " + (isCurrent ? "selected" : "")}
                  style={{ padding: "14px 14px 12px", gap: 5 }}
                >
                  <div className="spread" style={{ alignItems: "center" }}>
                    <div className="name" style={{ fontSize: 13.5 }}>
                      {sp.name}
                    </div>
                    {isCurrent && (
                      <span className="badge" style={{ color: "var(--ink-3)" }}>
                        Current
                      </span>
                    )}
                  </div>
                  <div className="small muted" style={{ minHeight: 46, lineHeight: 1.4 }}>
                    {sp.desc}
                  </div>
                  <div className="price" style={{ fontSize: 18, lineHeight: 1.15 }}>
                    {sp.price}
                  </div>
                  <div className="small muted">{sp.priceDetail}</div>
                  <div style={{ height: 6 }} />
                  {sp.perks.map((perk, i) => (
                    <div
                      key={i}
                      className="small"
                      style={{
                        padding: "5px 0",
                        borderTop: "1px solid var(--line-2)",
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <span className="muted" style={{ flex: "0 0 auto" }}>
                        ✓
                      </span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* SLA matrix */}
          <div style={{ marginTop: 22 }}>
            <div className="spread" style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                Response-time SLA{" "}
                <span className="small muted" style={{ fontWeight: 400 }}>
                  first response · business hours unless P1 noted
                </span>
              </div>
              <a href="#" className="small" onClick={(e) => e.preventDefault()}>
                Priority definitions ↗
              </a>
            </div>
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
                        width: "38%",
                      }}
                    >
                      Priority
                    </th>
                    {Object.entries(SUPPORT_PLANS).map(([k, sp]) => (
                      <th
                        key={k}
                        style={{
                          textAlign: "left",
                          padding: "10px 14px",
                          background: k === currentKey ? "var(--bg-3)" : "var(--bg-2)",
                          fontWeight: 600,
                          fontSize: 12.5,
                          color: "var(--ink)",
                          borderLeft: "1px solid var(--line-2)",
                        }}
                      >
                        {sp.name}
                        {k === currentKey && (
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
                  {PRIORITY_DEFS.map((pr) => (
                    <tr key={pr.id} style={{ borderTop: "1px solid var(--line-2)" }}>
                      <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 500 }}>{pr.label}</div>
                        <div className="small muted" style={{ marginTop: 2 }}>
                          {pr.desc}
                        </div>
                      </td>
                      {Object.entries(SUPPORT_PLANS).map(([k, sp]) => (
                        <td
                          key={k}
                          className="mono"
                          style={{
                            padding: "12px 14px",
                            verticalAlign: "top",
                            borderLeft: "1px solid var(--line-2)",
                            background: k === currentKey ? "var(--bg-2)" : "transparent",
                            fontWeight: k === currentKey ? 500 : 400,
                          }}
                        >
                          {sp.sla[pr.id]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Support hours strip */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>
              Support hours
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              {Object.entries(SUPPORT_PLANS).map(([k, sp]) => (
                <div
                  key={k}
                  className="card"
                  style={{
                    padding: "12px 14px",
                    background: k === currentKey ? "var(--bg-2)" : undefined,
                  }}
                >
                  <div className="small muted" style={{ marginBottom: 4 }}>
                    {sp.name}
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                    {(Array.isArray(sp.hours) ? sp.hours : [sp.hours]).map((h, i) => (
                      <div key={i}>{h}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <div className="stack-tight">
            <span className="small muted">
              Support plans are billed alongside your Gymly subscription. Upgrades are
              sales-assisted.
            </span>
          </div>
          <div className="gap-row">
            <button className="btn ghost" onClick={onClose}>
              Close
            </button>
            <button className="btn primary">Contact us to upgrade</button>
          </div>
        </div>
      </div>
    </div>
  );
}
