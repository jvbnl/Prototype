// "Add family member" modal: search an existing member to pre-fill the name
// fields, or just type a new member's name. Billing details are always
// inherited from the main account.

interface ModalProps {
  query: string;
  onQuery: (v: string) => void;
  results: { name: string; email: string; grad: string; initials: string; onSelect: () => void }[];
  showResults: boolean;
  noResults: boolean;
  hasSelection: boolean;
  selName: string;
  selEmail: string;
  onClearSelection: () => void;
  first: string;
  onFirst: (v: string) => void;
  last: string;
  onLast: (v: string) => void;
  onClose: () => void;
  onAdd: () => void;
}

export function AddMemberModal(p: ModalProps) {
  return (
    <div
      onClick={p.onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(24,24,27,.45)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "famFadeIn .15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,.3)",
          overflow: "hidden",
          animation: "famModalIn .2s ease",
        }}
      >
        <div style={{ padding: "20px 22px", borderBottom: "1px solid #F0F0F2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ font: "600 17px system-ui", color: "#18181B" }}>Add family member</div>
            <div style={{ font: "400 13px system-ui", color: "#A1A1AA", marginTop: 2 }}>Gekoppeld aan Melvin Koopmans</div>
          </div>
          <div
            onClick={p.onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: "400 20px system-ui",
              color: "#A1A1AA",
              cursor: "pointer",
            }}
          >
            ×
          </div>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16, maxHeight: "60vh", overflowY: "auto" }}>
          {/* search existing member */}
          <div>
            <div style={{ font: "600 12px system-ui", color: "#52525B", marginBottom: 6 }}>Zoek bestaand lid</div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4-4" />
                </svg>
              </span>
              <input
                className="fam-input"
                value={p.query}
                onChange={(e) => p.onQuery(e.target.value)}
                placeholder="Naam of e-mail…"
                style={{
                  width: "100%",
                  border: "1px solid #E4E4E7",
                  borderRadius: 9,
                  padding: "11px 13px 11px 38px",
                  font: "400 14px system-ui",
                  color: "#18181B",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ font: "400 12px system-ui", color: "#A1A1AA", marginTop: 7 }}>
              Vind een bestaand lid om de gegevens hieronder automatisch over te nemen.
            </div>

            {p.showResults && (
              <div style={{ marginTop: 8, border: "1px solid #EFEFF1", borderRadius: 10, overflow: "hidden", maxHeight: 184, overflowY: "auto" }}>
                {p.results.map((r, i) => (
                  <div
                    key={i}
                    onClick={r.onSelect}
                    className="fam-hover-row"
                    style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderBottom: "1px solid #F4F4F5" }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        font: "600 11px system-ui",
                        flex: "none",
                        background: r.grad,
                      }}
                    >
                      {r.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: "600 13px system-ui", color: "#18181B" }}>{r.name}</div>
                      <div style={{ font: "400 12px system-ui", color: "#A1A1AA" }}>{r.email}</div>
                    </div>
                    <span style={{ font: "600 12px system-ui", color: "#7A3FF2" }}>Kies</span>
                  </div>
                ))}
              </div>
            )}

            {p.noResults && (
              <div
                style={{
                  marginTop: 8,
                  border: "1px dashed #E4E4E7",
                  borderRadius: 10,
                  padding: 14,
                  textAlign: "center",
                  font: "400 13px system-ui",
                  color: "#A1A1AA",
                }}
              >
                Geen bestaand lid gevonden — vul de gegevens hieronder handmatig in.
              </div>
            )}

            {p.hasSelection && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  border: "1px solid #E5DBFB",
                  background: "#F6F1FE",
                  borderRadius: 10,
                  padding: "10px 13px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A3FF2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "600 13px system-ui", color: "#18181B" }}>Gegevens overgenomen van {p.selName}</div>
                  <div style={{ font: "400 12px system-ui", color: "#7C6BA0" }}>{p.selEmail}</div>
                </div>
                <div onClick={p.onClearSelection} style={{ font: "600 13px system-ui", color: "#7A3FF2", cursor: "pointer" }}>
                  Wissen
                </div>
              </div>
            )}
          </div>

          {/* name fields */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ font: "600 12px system-ui", color: "#52525B", marginBottom: 6 }}>First name</div>
              <input
                className="fam-input"
                value={p.first}
                onChange={(e) => p.onFirst(e.target.value)}
                placeholder="bv. Sophie"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: "600 12px system-ui", color: "#52525B", marginBottom: 6 }}>Last name</div>
              <input
                className="fam-input"
                value={p.last}
                onChange={(e) => p.onLast(e.target.value)}
                placeholder="bv. Koopmans"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ background: "#FAFAFB", border: "1px solid #EFEFF1", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7A3FF2" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 10h18M7 15h2M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              <span style={{ font: "600 13px system-ui", color: "#18181B" }}>Geërfd van Melvin Koopmans</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ font: "600 12px system-ui", color: "#52525B", marginBottom: 6 }}>IBAN</div>
              <div
                style={{
                  border: "1px solid #E4E4E7",
                  borderRadius: 9,
                  padding: "11px 13px",
                  font: "400 14px system-ui",
                  color: "#18181B",
                  background: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                NL91 ABNA •••• 1234
                <span style={{ font: "600 10px system-ui", color: "#7A3FF2", background: "#F6F1FE", padding: "2px 7px", borderRadius: 10 }}>geërfd</span>
              </div>
            </div>
            <div>
              <div style={{ font: "600 12px system-ui", color: "#52525B", marginBottom: 6 }}>Billing email</div>
              <div
                style={{
                  border: "1px solid #E4E4E7",
                  borderRadius: 9,
                  padding: "11px 13px",
                  font: "400 14px system-ui",
                  color: "#18181B",
                  background: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                melvin@gymly.io
                <span style={{ font: "600 10px system-ui", color: "#7A3FF2", background: "#F6F1FE", padding: "2px 7px", borderRadius: 10 }}>geërfd</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12, font: "400 12px system-ui", color: "#A1A1AA" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>
              Het hoofdaccount betaalt altijd voor familieleden.
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 22px", borderTop: "1px solid #F0F0F2", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <div
            onClick={p.onClose}
            style={{ padding: "11px 18px", border: "1px solid #E4E4E7", borderRadius: 10, font: "600 13px system-ui", color: "#27272A", cursor: "pointer" }}
          >
            Cancel
          </div>
          <div
            onClick={p.onAdd}
            style={{ padding: "11px 20px", background: "#7A3FF2", borderRadius: 10, font: "600 13px system-ui", color: "#fff", cursor: "pointer" }}
          >
            Add member
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E4E4E7",
  borderRadius: 9,
  padding: "11px 13px",
  font: "400 14px system-ui",
  color: "#18181B",
  outline: "none",
};
