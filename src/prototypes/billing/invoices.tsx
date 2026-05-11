import { INVOICES } from "./data";
import type { AccountState } from "./data";
import { E } from "./utils";

export function InvoicesSection({ state }: { state: AccountState }) {
  return (
    <div className="section">
      <div className="sect-head">
        <div>
          <h2>Invoices</h2>
          <div className="sub">
            One invoice per month, bundling plan, add-ons and usage. Plan-renewal months are
            tagged.
          </div>
        </div>
        <div className="right">
          <a href="#" onClick={(e) => e.preventDefault()}>
            Download all (CSV)
          </a>
        </div>
      </div>

      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: "160px" }}>Invoice</th>
            <th>Period</th>
            <th style={{ width: "140px" }}>Issued</th>
            <th style={{ width: "140px" }}>Contents</th>
            <th style={{ width: "120px" }} className="num">
              Amount
            </th>
            <th style={{ width: "140px" }}>Status</th>
            <th style={{ width: "60px" }}></th>
          </tr>
        </thead>
        <tbody>
          {INVOICES.map((inv) => {
            let statusCell = <span className="status paid">Paid</span>;
            if (inv.status === "upcoming")
              statusCell = <span className="status upc">Upcoming</span>;
            if (state === "past-due" && inv.id === "INV-2026-04")
              statusCell = <span className="status failed">Failed · retrying</span>;
            return (
              <tr key={inv.id}>
                <td className="mono">{inv.id}</td>
                <td>{inv.period}</td>
                <td className="mono small">{inv.date}</td>
                <td>
                  {inv.includesPlan ? (
                    <span
                      className="status"
                      style={{
                        background: "var(--note-bg)",
                        borderColor: "#e8d97a",
                        color: "var(--note-ink)",
                      }}
                    >
                      Plan renewal + monthly
                    </span>
                  ) : (
                    <span className="muted small">Add-ons + usage</span>
                  )}
                </td>
                <td className="amt">{E(inv.amount)}</td>
                <td>{statusCell}</td>
                <td>
                  {inv.status === "upcoming" ? (
                    <span className="muted small">—</span>
                  ) : (
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      PDF ↓
                    </a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
