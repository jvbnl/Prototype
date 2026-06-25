"use client";

// Family accounts flow — member detail screen with the "Add family member"
// flow (link an existing member or create a new one, billing inherited from the
// main account). Ported from the Claude Design handoff
// (`Family accounts - flow.dc.html`).

import { useEffect, useRef, useState } from "react";
import { GRADS, POOL, SEED, initials, type Member, type PoolPerson } from "./data";
import { Sidebar } from "./sidebar";
import { ProfileCard } from "./profile-card";
import { AddMemberModal } from "./modal";
import familyCss from "./styles.css?raw";

export function FamilyPrototype() {
  useEffect(() => {
    const style = document.createElement("style");
    style.dataset.proto = "family";
    style.textContent = familyCss;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [toast, setToast] = useState(false);
  const [toastText, setToastText] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PoolPerson | null>(null);
  const [familyOpen, setFamilyOpen] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  // ---- derived ---------------------------------------------------------
  const mapped = members.map((m) => ({
    name: m.name,
    grad: m.grad,
    relation: m.relation,
    initials: initials(m.name),
  }));
  const stackMembers = mapped.slice(0, 3);
  const hasFamily = members.length > 0;
  const lastMember = members[members.length - 1];
  const lastAddedNote = lastMember ? `${lastMember.name} gekoppeld · zojuist` : "";

  const taken = new Set(members.map((m) => m.name));
  const q = query.trim().toLowerCase();
  const filtered = POOL.filter(
    (p) => !taken.has(p.name) && (q === "" || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)),
  );
  const results = filtered.map((p) => ({
    name: p.name,
    email: p.email,
    grad: p.grad,
    initials: initials(p.name),
    onSelect: () => {
      const [fn, ...rest] = p.name.split(" ");
      setSelected(p);
      setFirst(fn);
      setLast(rest.join(" "));
      setQuery("");
    },
  }));

  // ---- actions ---------------------------------------------------------
  const openModal = () => {
    setModalOpen(true);
    setMenuOpen(false);
    setFamilyOpen(false);
    setFirst("");
    setLast("");
    setQuery("");
    setSelected(null);
  };

  const addMember = () => {
    const fn = first.trim() || "Nieuw";
    const ln = last.trim();
    const name = `${fn} ${ln}`.trim();
    const grad = selected ? selected.grad : GRADS[members.length % GRADS.length];
    const m: Member = { name, relation: "Familielid", grad };
    setMembers((prev) => [...prev, m]);
    setModalOpen(false);
    setToast(true);
    setToastText(`${name} toegevoegd aan familie`);
    setSelected(null);
    setQuery("");
    setFirst("");
    setLast("");
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 3200);
  };

  // tweaks: seed a preset family, then collapse any open overlay
  const seedFamily = (n: number) => {
    setMembers(SEED.slice(0, n));
    setMenuOpen(false);
    setFamilyOpen(false);
  };

  return (
    <div className="fam-shell">
      <div className="fam-topbar">
        <a href="#/" className="fam-back">
          ← All prototypes
        </a>
        <span className="fam-crumb">Family accounts · Customers › Members</span>
      </div>

      <div
        className="fam-root fam-screen"
        style={{ display: "flex", width: "100%", overflow: "hidden", background: "#fff", color: "#18181B" }}
      >
        <Sidebar />

        <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
          {/* top bar */}
          <header
            style={{
              height: 64,
              flex: "none",
              borderBottom: "1px solid #EFEFF1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, font: "500 14px system-ui", color: "#71717A" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Customers <span style={{ color: "#D4D4D8" }}>/</span> Members <span style={{ color: "#D4D4D8" }}>/</span>{" "}
              <span style={{ fontWeight: 600, color: "#18181B", background: "#F4F4F5", padding: "4px 9px", borderRadius: 7 }}>Melvin Koopmans</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 13px", border: "1px solid #E4E4E7", borderRadius: 9, font: "600 13px system-ui", color: "#27272A" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M3 9h18M9 3v18" />
                </svg>
                Check-in
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 13px", border: "1px solid #E4E4E7", borderRadius: 9, font: "600 13px system-ui", color: "#27272A" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M8 7h8M8 11h8M8 15h5" />
                </svg>
                Create invoice
              </div>
              <div style={{ position: "relative", width: 38, height: 38, borderRadius: 9, border: "1px solid #E4E4E7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#52525B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                </svg>
                <span style={{ position: "absolute", top: -6, right: -6, background: "#EF4444", color: "#fff", font: "700 9px system-ui", padding: "2px 5px", borderRadius: 10 }}>99+</span>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: "#7A3FF2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff">
                  <path d="M7 5l11 7-11 7z" />
                </svg>
              </div>
            </div>
          </header>

          {/* scroll area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 60px" }}>
            {/* tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 22, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", border: "1px solid #E4E4E7", background: "#fff", borderRadius: 9, font: "600 13px system-ui", color: "#18181B" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
                Profile
              </div>
              {[
                { label: "Invoices", count: "0" },
                { label: "Memberships" },
                { label: "Orders" },
                { label: "Reservations" },
                { label: "Notes", count: "0" },
                { label: "Check-ins" },
                { label: "Settings" },
                { label: "Files", count: "0" },
              ].map((t) => (
                <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", borderRadius: 9, font: "500 13px system-ui", color: "#71717A" }}>
                  {t.label}
                  {t.count !== undefined && (
                    <span style={{ background: "#F4F4F5", padding: "0 6px", borderRadius: 8, fontSize: 11 }}>{t.count}</span>
                  )}
                </div>
              ))}
            </div>

            {/* two column */}
            <div style={{ display: "flex", gap: 22, alignItems: "flex-start", maxWidth: 1320 }}>
              {/* left column */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
                <ProfileCard
                  hasFamily={hasFamily}
                  menuOpen={menuOpen}
                  onToggleMenu={() => setMenuOpen((v) => !v)}
                  onOpenModal={openModal}
                  familyOpen={familyOpen}
                  onToggleFamily={() => setFamilyOpen((v) => !v)}
                  familyCount={members.length}
                  stackMembers={stackMembers}
                  members={mapped}
                />

                {/* membership card */}
                <div style={{ background: "#fff", border: "1px solid #EAEAEC", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "#18181B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                        <path d="M7 5l11 7-11 7z" />
                      </svg>
                    </div>
                    <span style={{ font: "600 16px system-ui", color: "#18181B", flex: 1 }}>Personeel</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "600 13px system-ui", color: "#16A34A", background: "#F0FDF4", padding: "5px 11px", borderRadius: 8 }}>
                      Active <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
                    </span>
                  </div>
                  <div style={{ marginTop: 16, border: "1px solid #F0F0F2", borderRadius: 11, overflow: "hidden" }}>
                    <div style={detailRow}>
                      <span>Active since</span>
                      <span style={detailVal}>Aug 1, 2024</span>
                    </div>
                    <div style={{ ...detailRow, borderTop: "1px solid #F4F4F5" }}>
                      <span>Payment type</span>
                      <span style={detailVal}>Once-off</span>
                    </div>
                    <div style={{ ...detailRow, borderTop: "1px solid #F4F4F5" }}>
                      <span>Price</span>
                      <span style={detailVal}>€ 0,00</span>
                    </div>
                    <div style={{ ...detailRow, borderTop: "1px solid #F4F4F5" }}>
                      <span>Total amount</span>
                      <span style={detailVal}>€ 0,00</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", border: "1px solid #E4E4E7", borderRadius: 9, font: "600 13px system-ui", color: "#27272A" }}>Edit</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", border: "1px solid #FCD9B6", borderRadius: 9, font: "600 13px system-ui", color: "#C2410C" }}>Pause</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", border: "1px solid #FCD9B6", borderRadius: 9, font: "600 13px system-ui", color: "#C2410C" }}>Cancel</div>
                  </div>
                </div>

                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "#7A3FF2", borderRadius: 11, font: "600 14px system-ui", color: "#fff", alignSelf: "flex-start", cursor: "pointer" }}>
                  Assign membership
                </div>
              </div>

              {/* right column: activity */}
              <div style={{ width: 340, flex: "none", background: "#fff", border: "1px solid #EAEAEC", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,.03)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#52525B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h4l2 6 4-14 2 8h4" />
                  </svg>
                  <span style={{ font: "600 16px system-ui", color: "#18181B" }}>Activity history</span>
                </div>

                {hasFamily && (
                  <div style={{ marginBottom: 18, animation: "famSectionIn .3s ease" }}>
                    <div style={{ font: "600 11px system-ui", color: "#A1A1AA", letterSpacing: ".04em", marginBottom: 11 }}>TODAY</div>
                    <div style={{ display: "flex", gap: 11 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F6F1FE", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7A3FF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M19 8v6M22 11h-6" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ font: "600 13px system-ui", color: "#18181B" }}>Family member added</div>
                        <div style={{ font: "400 12px system-ui", color: "#71717A" }}>{lastAddedNote}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ font: "600 11px system-ui", color: "#A1A1AA", letterSpacing: ".04em", marginBottom: 11 }}>4 OCTOBER 2025</div>
                <div style={{ display: "flex", gap: 11, marginBottom: 18 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#52525B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M19 8v6M22 11h-6" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ font: "600 13px system-ui", color: "#18181B" }}>User was enabled</div>
                    <div style={{ font: "400 12px system-ui", color: "#71717A" }}>Melvin Koopmans · 16:08</div>
                  </div>
                </div>

                <div style={{ font: "600 11px system-ui", color: "#A1A1AA", letterSpacing: ".04em", marginBottom: 11 }}>1 AUGUST 2024</div>
                <div style={{ display: "flex", gap: 11 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ font: "600 13px system-ui", color: "#18181B" }}>Membership was assigned</div>
                    <div style={{ font: "400 12px system-ui", color: "#71717A" }}>Assigned "Personeel" to user.</div>
                    <div style={{ font: "400 12px system-ui", color: "#71717A" }}>Melvin Koopmans · 22:19</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* menu click-away */}
        {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />}
        {/* family switcher click-away */}
        {familyOpen && <div onClick={() => setFamilyOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />}

        {/* modal */}
        {modalOpen && (
          <AddMemberModal
            query={query}
            onQuery={setQuery}
            results={results}
            showResults={q !== "" && results.length > 0}
            noResults={q !== "" && results.length === 0}
            hasSelection={!!selected}
            selName={selected ? selected.name : ""}
            selEmail={selected ? selected.email : ""}
            onClearSelection={() => {
              setSelected(null);
              setFirst("");
              setLast("");
              setQuery("");
            }}
            first={first}
            onFirst={setFirst}
            last={last}
            onLast={setLast}
            onClose={() => setModalOpen(false)}
            onAdd={addMember}
          />
        )}

        {/* toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 26,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 80,
              display: "flex",
              alignItems: "center",
              gap: 11,
              background: "#18181B",
              color: "#fff",
              padding: "13px 18px",
              borderRadius: 11,
              boxShadow: "0 12px 30px rgba(0,0,0,.25)",
              animation: "famToastIn .25s ease",
            }}
          >
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span style={{ font: "600 13px system-ui" }}>{toastText}</span>
          </div>
        )}
      </div>

      <FamilyTweaks
        memberCount={members.length}
        onSeed={seedFamily}
        menuOpen={menuOpen}
        onMenu={setMenuOpen}
        modalOpen={modalOpen}
        onModal={(v) => (v ? openModal() : setModalOpen(false))}
      />
    </div>
  );
}

function FamilyTweaks(props: {
  memberCount: number;
  onSeed: (n: number) => void;
  menuOpen: boolean;
  onMenu: (v: boolean) => void;
  modalOpen: boolean;
  onModal: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button className="fam-twk-pill" onClick={() => setOpen(true)}>
        ⚙ Tweaks
      </button>
    );
  }

  return (
    <div className="fam-twk-panel">
      <div className="fam-twk-hd">
        <b>Tweaks</b>
        <button className="fam-twk-x" onClick={() => setOpen(false)} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="fam-twk-body">
        <div className="fam-twk-sect">Family</div>
        <div className="fam-twk-row">
          <div className="fam-twk-lbl">Seed family members</div>
          <div className="fam-twk-seg">
            {[0, 1, 2].map((n) => (
              <button key={n} className={props.memberCount === n ? "on" : ""} onClick={() => props.onSeed(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="fam-twk-sect">Overlays</div>
        <div className="fam-twk-row fam-twk-row-h">
          <span>More-options menu</span>
          <button
            type="button"
            className="fam-twk-toggle"
            data-on={props.menuOpen ? "1" : "0"}
            onClick={() => props.onMenu(!props.menuOpen)}
            aria-label="Toggle more-options menu"
          >
            <i />
          </button>
        </div>
        <div className="fam-twk-row fam-twk-row-h">
          <span>Add-member modal</span>
          <button
            type="button"
            className="fam-twk-toggle"
            data-on={props.modalOpen ? "1" : "0"}
            onClick={() => props.onModal(!props.modalOpen)}
            aria-label="Toggle add-member modal"
          >
            <i />
          </button>
        </div>
      </div>
    </div>
  );
}

const detailRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 15px",
  font: "500 13px system-ui",
  color: "#52525B",
};
const detailVal: React.CSSProperties = { color: "#18181B", fontWeight: 600 };
