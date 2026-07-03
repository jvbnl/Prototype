// Left navigation rail for the Family accounts flow. Static chrome — faithfully
// ported from the prototype so the member detail screen sits in real context.

export function Sidebar() {
  return (
    <aside
      style={{
        width: 236,
        flex: "none",
        borderRight: "1px solid #EFEFF1",
        display: "flex",
        flexDirection: "column",
        padding: "14px 12px",
        overflowY: "auto",
      }}
    >
      {/* workspace switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "6px 8px",
          borderRadius: 9,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: "#18181B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
            <path d="M7 5l11 7-11 7z" />
          </svg>
        </div>
        <span style={{ font: "600 15px system-ui", color: "#18181B", flex: 1 }}>MONO Boulder</span>
        <span style={{ color: "#A1A1AA", fontSize: 12 }}>⌄</span>
      </div>

      <div style={navRow}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
        </svg>
        <span style={{ flex: 1 }}>Today</span>
        <span style={{ font: "500 12px system-ui", color: "#A1A1AA" }}>Thu 25</span>
      </div>
      <div style={navRow}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.5 5h13l3.5 7v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-6z" />
        </svg>
        <span>Inbox</span>
      </div>

      <div style={{ ...navRow, font: "600 13px system-ui", color: "#7A3FF2" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
        <span>Customers</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          margin: "2px 0 2px 22px",
          borderLeft: "1px solid #EFEFF1",
          paddingLeft: 10,
        }}
      >
        <div style={{ padding: "7px 9px", borderRadius: 8, background: "#F4F1FB", font: "600 13px system-ui", color: "#7A3FF2" }}>
          Members
        </div>
        <div style={{ padding: "7px 9px", borderRadius: 8, font: "500 13px system-ui", color: "#71717A" }}>Organizations</div>
      </div>

      <div style={navRow}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="0.6" fill="currentColor" />
        </svg>
        <span style={{ flex: 1 }}>Leads</span>
        <span style={{ font: "600 11px system-ui", color: "#7A3FF2" }}>94</span>
      </div>
      <div style={navRow}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
        <span>Revenue</span>
      </div>
      <div style={navRow}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M7 14l3-3 3 3 4-5" />
        </svg>
        <span>Insights</span>
      </div>
      <div style={navRow}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M2 3h3l2.5 12h11l2-8H6" />
        </svg>
        <span>Point of Sale</span>
      </div>
      <div style={navRow}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
        <span>Webshop</span>
      </div>
      <div style={navRow}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Addons</span>
      </div>
      <div style={navRow}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h4l2 6 4-14 2 8h6" />
        </svg>
        <span>Activity Log</span>
      </div>
      <div style={navRow}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14.6H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 4.6h.1A2 2 0 1 1 13 4.6" />
        </svg>
        <span style={{ flex: 1 }}>Settings</span>
        <span style={{ color: "#A1A1AA" }}>›</span>
      </div>

      <div style={{ font: "600 11px system-ui", color: "#A1A1AA", letterSpacing: ".04em", padding: "14px 9px 6px" }}>Calendars</div>
      <div style={navRow}>
        <span
          style={{
            width: 13,
            height: 13,
            borderRadius: 4,
            border: "2px solid #7A3FF2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7A3FF2" }} />
        </span>
        Activities
      </div>
      <div style={navRow}>
        <span
          style={{
            width: 13,
            height: 13,
            borderRadius: 4,
            border: "2px solid #7A3FF2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7A3FF2" }} />
        </span>
        Events
      </div>
    </aside>
  );
}

const navRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 9px",
  borderRadius: 8,
  font: "500 13px system-ui",
  color: "#52525B",
};
