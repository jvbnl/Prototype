// Profile header card for the member detail screen: identity, primary actions,
// the "More options" dropdown, and the nested family-group switcher.

export type FamilyChild = { name: string; relation: string; initials: string; grad: string };

interface ProfileCardProps {
  hasFamily: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpenModal: () => void;
  familyOpen: boolean;
  onToggleFamily: () => void;
  familyCount: number;
  stackMembers: { initials: string; grad: string }[];
  members: FamilyChild[];
}

export function ProfileCard({
  hasFamily,
  menuOpen,
  onToggleMenu,
  onOpenModal,
  familyOpen,
  onToggleFamily,
  familyCount,
  stackMembers,
  members,
}: ProfileCardProps) {
  const moreBorder = menuOpen ? "#7A3FF2" : "#E4E4E7";
  const moreBg = menuOpen ? "#F6F1FE" : "#fff";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #EAEAEC",
        borderRadius: 14,
        padding: 22,
        boxShadow: "0 1px 3px rgba(0,0,0,.03)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#7A3FF2,#C084FC)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            font: "600 17px system-ui",
            flex: "none",
          }}
        >
          MK
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ font: "600 19px system-ui", color: "#18181B" }}>Melvin Koopmans</span>
            {hasFamily && (
              <span
                style={{
                  font: "600 11px system-ui",
                  color: "#7A3FF2",
                  background: "#F6F1FE",
                  padding: "3px 9px",
                  borderRadius: 10,
                }}
              >
                Hoofdaccount
              </span>
            )}
          </div>
          <div style={{ font: "400 14px system-ui", color: "#71717A" }}>melvin@gymly.io</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, font: "600 14px system-ui", color: "#27272A" }}>
          View details <span style={{ color: "#A1A1AA" }}>⌄</span>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", gap: 9, marginTop: 20 }}>
        <div style={actionBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
          Edit
        </div>
        <div style={actionBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
          </svg>
          Resend invitation email
        </div>
        <div
          onClick={onToggleMenu}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 15px",
            borderRadius: 10,
            font: "600 13px system-ui",
            color: "#27272A",
            cursor: "pointer",
            border: `1px solid ${moreBorder}`,
            background: moreBg,
          }}
        >
          ··· More options
        </div>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: 48,
              left: 222,
              width: 256,
              background: "#fff",
              border: "1px solid #E8E8EB",
              borderRadius: 12,
              boxShadow: "0 12px 34px rgba(0,0,0,.16)",
              padding: 6,
              zIndex: 50,
              animation: "famFadeIn .12s ease",
            }}
          >
            <div style={menuItem}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
              Edit details
            </div>
            <div style={menuItem}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              Give credit
            </div>
            <div style={{ height: 1, background: "#F0F0F2", margin: "5px 6px" }} />
            <div
              onClick={onOpenModal}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: 11,
                borderRadius: 8,
                font: "600 13px system-ui",
                color: "#7A3FF2",
                background: "#F6F1FE",
                cursor: "pointer",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7A3FF2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </svg>
              Add family member
            </div>
            <div style={{ height: 1, background: "#F0F0F2", margin: "5px 6px" }} />
            <div style={{ ...menuItem, color: "#DC2626" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
              Delete member
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginTop: 18,
          padding: "13px 15px",
          background: "#FAFAFB",
          border: "1px solid #F0F0F2",
          borderRadius: 10,
          font: "500 13px system-ui",
          color: "#52525B",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        Platform account · Member since 2024
      </div>

      {hasFamily && (
        <div style={{ position: "relative", marginTop: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "13px 15px",
              border: "1px solid #EFEFF1",
              borderRadius: 11,
            }}
          >
            <div style={{ display: "flex", paddingLeft: 9 }}>
              {stackMembers.map((s, i) => (
                <div
                  key={i}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    font: "600 10px system-ui",
                    marginLeft: -9,
                    background: s.grad,
                  }}
                >
                  {s.initials}
                </div>
              ))}
            </div>
            <span style={{ flex: 1, font: "600 14px system-ui", color: "#18181B" }}>
              Family group · {familyCount} leden
            </span>
            <div
              onClick={onToggleFamily}
              style={{ display: "flex", alignItems: "center", gap: 6, font: "600 13px system-ui", color: "#7A3FF2", cursor: "pointer" }}
            >
              View{" "}
              <span style={{ fontSize: 11, transform: `rotate(${familyOpen ? "180deg" : "0deg"})`, transition: "transform .15s" }}>⌄</span>
            </div>
          </div>

          {familyOpen && (
            <div
              style={{
                position: "absolute",
                top: 62,
                right: 0,
                left: 0,
                background: "#fff",
                border: "1px solid #E8E8EB",
                borderRadius: 12,
                boxShadow: "0 14px 36px rgba(0,0,0,.16)",
                padding: 8,
                zIndex: 30,
                animation: "famFadeIn .12s ease",
              }}
            >
              <div style={{ font: "600 11px system-ui", color: "#A1A1AA", letterSpacing: ".04em", padding: "7px 10px 8px" }}>FAMILIE</div>

              {/* hoofdaccount (current) */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: 9, background: "#F6F1FE" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#7A3FF2,#C084FC)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    font: "600 12px system-ui",
                    flex: "none",
                  }}
                >
                  MK
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: "600 13px system-ui", color: "#18181B" }}>Melvin Koopmans</div>
                  <div style={{ font: "500 11px system-ui", color: "#7A3FF2" }}>Hoofdaccount · huidig</div>
                </div>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7A3FF2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              {/* nested children */}
              <div style={{ margin: "4px 0 2px 27px", borderLeft: "2px solid #EFEFF1", paddingLeft: 14 }}>
                {members.map((member, i) => (
                  <div key={i} className="fam-hover-row" style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", borderRadius: 9 }}>
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
                        background: member.grad,
                      }}
                    >
                      {member.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: "600 13px system-ui", color: "#18181B" }}>{member.name}</div>
                      <div style={{ font: "400 11px system-ui", color: "#A1A1AA" }}>{member.relation} · betaalt via Melvin</div>
                    </div>
                    <span style={{ font: "600 12px system-ui", color: "#7A3FF2" }}>Open</span>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: "#F0F0F2", margin: "6px 8px" }} />
              <div
                onClick={onOpenModal}
                className="fam-hover-violet"
                style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 9, font: "600 13px system-ui", color: "#7A3FF2" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7A3FF2" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Familielid toevoegen
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  padding: "10px 15px",
  border: "1px solid #E4E4E7",
  borderRadius: 10,
  font: "600 13px system-ui",
  color: "#27272A",
  cursor: "pointer",
};

const menuItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 11,
  padding: "10px 11px",
  borderRadius: 8,
  font: "500 13px system-ui",
  color: "#3F3F46",
  cursor: "pointer",
};
