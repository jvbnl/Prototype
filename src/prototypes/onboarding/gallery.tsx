import { POS_CHECKLIST } from "./data";
import { Icon } from "./icons";
import { Coachmark } from "./components/coachmark";
import { Checklist, ProgressBar, Toast } from "./components/primitives";

const noop = () => {};

const card: React.CSSProperties = {
  background: "var(--o-surface)",
  border: "1px solid var(--o-line)",
  borderRadius: 18,
  padding: "24px 26px",
  boxShadow: "var(--o-shadow-card)",
};
const eyebrow: React.CSSProperties = {
  font: "700 11px var(--o-font)",
  letterSpacing: "0.08em",
  color: "var(--o-accent)",
  textTransform: "uppercase",
};
const cardTitle: React.CSSProperties = { marginTop: 6, font: "700 18px var(--o-font)", color: "var(--o-ink)" };
const cardDesc: React.CSSProperties = {
  marginTop: 6,
  font: "400 13.5px/1.5 var(--o-font)",
  color: "var(--o-ink-4)",
};

/** The reusable building blocks behind the flow — design-system-native. */
export function Gallery() {
  return (
    <section style={{ marginTop: 54 }}>
      <div style={{ font: "800 24px var(--o-font)", letterSpacing: "-0.02em" }}>Componenten</div>
      <p style={{ marginTop: 7, font: "400 15px/1.5 var(--o-font)", color: "var(--o-ink-3)", maxWidth: 720 }}>
        De bouwstenen achter de flow. Allemaal herbruikbaar en Gymly-breed inzetbaar — POS, rooster,
        financiën. De POS-flow is slechts de eerste voorbeeld-integratie.
      </p>

      <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 22 }}>
        {/* Coachmark anatomy + states (full width) */}
        <div style={{ ...card, gridColumn: "span 2" }}>
          <div style={eyebrow}>Kerncomponent</div>
          <div style={{ ...cardTitle, fontSize: 19 }}>Coachmark (tooltip)</div>
          <div style={{ ...cardDesc, maxWidth: 560 }}>
            Eén stap van de rondleiding. Lead met de actie, max. 1–2 zinnen, altijd voortgang en een
            uitweg.
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Coachmark
                eyebrow="Stap 1 van 4"
                title="Product aanslaan"
                body="Tik op een product om het op de bon te zetten."
                total={4}
                current={0}
                arrow={{ side: "top", offset: 40 }}
                onClose={noop}
                onNext={noop}
                style={{ position: "relative" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13, minWidth: 240, flex: 1 }}>
              {[
                ["A", "Stap-eyebrow", "geeft positie & lengte van de tour (anti-overload)."],
                ["B", "Titel + body", "actiegericht, tweede persoon, max. 2 zinnen."],
                ["C", "Voortgang", "goal-gradient: zien hoeveel er nog komt."],
                ["D", "Sluiten + Volgende", "altijd een uitweg, autonomie behouden."],
              ].map(([k, t, d]) => (
                <div key={k} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: "var(--o-accent-soft)",
                      color: "var(--o-accent-ink)",
                      font: "700 11px var(--o-font)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {k}
                  </span>
                  <span style={{ font: "400 13.5px/1.4 var(--o-font)", color: "var(--o-ink-3)" }}>
                    <b style={{ color: "var(--o-ink)" }}>{t}</b> — {d}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              marginTop: 26,
              paddingTop: 22,
              borderTop: "1px solid #f2f4f7",
              font: "700 12px var(--o-font)",
              letterSpacing: "0.04em",
              color: "var(--o-ink-5)",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            States
          </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Coachmark eyebrow="Eerste stap" title="Product aanslaan" body="" total={4} current={0} arrow={undefined} onNext={noop} onClose={noop} style={{ width: 290 }} />
            <Coachmark eyebrow="Tussenstap" title="Korting toepassen" body="" total={4} current={2} onPrev={noop} onNext={noop} onClose={noop} style={{ width: 290 }} />
            <Coachmark eyebrow="Laatste stap" title="Afrekenen" body="" total={4} current={3} onPrev={noop} onNext={noop} onClose={noop} style={{ width: 290 }} />
          </div>
        </div>

        {/* Spotlight */}
        <div style={card}>
          <div style={eyebrow}>Aandacht</div>
          <div style={cardTitle}>Spotlight</div>
          <div style={cardDesc}>Dimt alles behalve het doel (Von Restorff). Eén focuspunt per stap.</div>
          <div
            style={{
              marginTop: 18,
              position: "relative",
              height: 150,
              background: "var(--o-surface-3)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {["60%", "80%", "45%"].map((w) => (
                <div key={w} style={{ height: 10, width: w, background: "var(--o-line-2)", borderRadius: 5 }} />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                top: 50,
                left: "50%",
                transform: "translateX(-50%)",
                padding: "10px 18px",
                background: "var(--o-navy)",
                color: "#fff",
                borderRadius: 10,
                font: "600 13px var(--o-font)",
                boxShadow: "var(--o-ring), 0 0 0 999px rgba(15,22,38,.55)",
              }}
            >
              Afrekenen
            </div>
          </div>
        </div>

        {/* Progress & checklist */}
        <div style={card}>
          <div style={eyebrow}>Motivatie</div>
          <div style={cardTitle}>Voortgang &amp; checklist</div>
          <div style={{ ...cardDesc, marginBottom: 16 }}>
            Goal-gradient + endowed progress: een al-gestarte balk trekt naar afronden.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ font: "700 12.5px var(--o-font)" }}>Setup-voortgang</span>
            <span style={{ font: "600 12.5px var(--o-font)", color: "var(--o-accent)" }}>2 / 5</span>
          </div>
          <ProgressBar value={2} max={5} />
          <div style={{ marginTop: 14 }}>
            <Checklist items={POS_CHECKLIST.map((c, i) => ({ ...c, done: i < 2 }))} />
          </div>
        </div>

        {/* Intro-modal */}
        <div style={card}>
          <div style={eyebrow}>Entree</div>
          <div style={cardTitle}>Intro-modal</div>
          <div style={cardDesc}>Split-layout: links de boodschap, rechts een levende preview. Stap 2 legt een voorkeur vast.</div>
          <div style={{ marginTop: 18, display: "flex", borderRadius: 12, overflow: "hidden", border: "1px solid var(--o-line)", height: 150 }}>
            <div style={{ flex: 1.3, padding: 16, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ font: "700 9px var(--o-font)", letterSpacing: "0.12em", color: "var(--o-ink-4)", textTransform: "uppercase" }}>
                Welkom
              </div>
              <div style={{ marginTop: 5, font: "700 15px/1.15 var(--o-font)", color: "var(--o-ink)" }}>
                Maak kennis met je nieuwe POS
              </div>
              <div style={{ marginTop: 9, display: "flex", gap: 4 }}>
                <i style={{ width: 22, height: 3, borderRadius: 2, background: "var(--o-navy)" }} />
                <i style={{ width: 22, height: 3, borderRadius: 2, background: "var(--o-line-2)" }} />
                <i style={{ width: 22, height: 3, borderRadius: 2, background: "var(--o-line-2)" }} />
              </div>
            </div>
            <div style={{ flex: 1, background: "linear-gradient(150deg,#ECEAFB,#E5EEFB)" }} />
          </div>
        </div>

        {/* Choice cards */}
        <div style={card}>
          <div style={eyebrow}>Vertakking</div>
          <div style={cardTitle}>Keuzekaarten</div>
          <div style={cardDesc}>Rondleiding / ontdekken / sluiten. Eén aanrader, nooit forceren.</div>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ position: "relative", border: "1.5px solid var(--o-navy)", borderRadius: 11, padding: "11px 13px", display: "flex", alignItems: "center", gap: 11, background: "#fbfbfd" }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--o-accent-soft)", color: "var(--o-accent)", display: "grid", placeItems: "center" }}>
                <Icon name="arrow-right" size={15} />
              </span>
              <span style={{ font: "700 13.5px var(--o-font)" }}>Neem een rondleiding</span>
              <span style={{ marginLeft: "auto", background: "var(--o-navy)", color: "#fff", font: "700 9px var(--o-font)", letterSpacing: "0.05em", padding: "3px 7px", borderRadius: 5, textTransform: "uppercase" }}>
                Aanrader
              </span>
            </div>
            {[
              { icon: "search", label: "Zelf ontdekken" },
              { icon: "x", label: "Later" },
            ].map((o) => (
              <div key={o.label} style={{ border: "1.5px solid var(--o-line-2)", borderRadius: 11, padding: "11px 13px", display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--o-surface-3)", color: "var(--o-ink-3)", display: "grid", placeItems: "center" }}>
                  <Icon name={o.icon as "search" | "x"} size={15} />
                </span>
                <span style={{ font: "600 13.5px var(--o-font)", color: "var(--o-ink-2)" }}>{o.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Success toast */}
        <div style={card}>
          <div style={eyebrow}>Bevestiging</div>
          <div style={cardTitle}>Success-toast</div>
          <div style={{ ...cardDesc, marginBottom: 22 }}>
            Sluit de lus: bevestig de winst en wijs naar de volgende stap (peak-end).
          </div>
          <div style={{ position: "relative", height: 64 }}>
            <Toast title="Rondleiding voltooid 🎉" body="Je kent nu de 4 kernacties." onClose={noop} />
          </div>
        </div>

        {/* Launcher */}
        <div style={card}>
          <div style={eyebrow}>Re-entry</div>
          <div style={cardTitle}>Launcher &amp; help-hub</div>
          <div style={cardDesc}>Altijd rechtsonder. Maakt de tour herhaalbaar en zelf-bedienend.</div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "flex-end", gap: 18 }}>
            <div style={{ flex: 1, border: "1px solid var(--o-line)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "11px 13px", borderBottom: "1px solid #f2f4f7", font: "700 12.5px var(--o-font)" }}>
                Hulp &amp; rondleidingen
              </div>
              <div style={{ padding: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, padding: 8, borderRadius: 8, background: "#f6f7fb" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, background: "var(--o-accent)", color: "#fff", display: "grid", placeItems: "center" }}>
                    <Icon name="chevron-right" size={12} stroke={2.6} />
                  </span>
                  <span style={{ font: "600 12px var(--o-font)" }}>Rondleiding (opnieuw)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, padding: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, background: "var(--o-surface-3)" }} />
                  <span style={{ font: "600 12px var(--o-font)", color: "var(--o-ink-3)" }}>Setup voltooien</span>
                </div>
              </div>
            </div>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--o-navy)", color: "#fff", display: "grid", placeItems: "center", boxShadow: "var(--o-shadow-fab)", flexShrink: 0 }}>
              <Icon name="help" size={21} stroke={2.2} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
