"use client";

// Guided onboarding — reusable patterns (intro-modal, spotlight-tour,
// success-toast, launcher/help-hub, setup-checklist) with the new POS-flow as
// the example integration. Ported from the "Guided onboarding UX" handoff +
// the "Richting A" reference prototype. See README.md for the component
// inventory and the runtime tour-engine notes.

import { useEffect, useRef, useState } from "react";
import onbCss from "./styles.css?raw";
import { PRODUCTS, POS_INTRO, POS_TOUR, eur } from "./data";
import type { CategoryKey, Product } from "./data";
import type { Pref } from "./useOnboarding";
import { Icon } from "./icons";
import { Pos } from "./pos";
import { Gallery } from "./gallery";
import { useOnboarding } from "./useOnboarding";
import type { Onboarding } from "./useOnboarding";
import { IntroModal } from "./components/intro-modal";
import { SpotlightTour } from "./components/spotlight-tour";
import { Launcher } from "./components/launcher";
import { Toast } from "./components/primitives";

const CAT_BG: Record<CategoryKey, string> = {
  coffee: "var(--o-cat-coffee-bg)",
  cold: "var(--o-cat-cold-bg)",
  food: "var(--o-cat-food-bg)",
  bowl: "var(--o-cat-bowl-bg)",
  sweet: "var(--o-cat-sweet-bg)",
};
const CAT_INK: Record<CategoryKey, string> = {
  coffee: "var(--o-cat-coffee-ink)",
  cold: "var(--o-cat-cold-ink)",
  food: "var(--o-cat-food-ink)",
  bowl: "var(--o-cat-bowl-ink)",
  sweet: "var(--o-cat-sweet-ink)",
};

const pick = (id: string) => PRODUCTS.find((p) => p.id === id) as Product;
const PREVIEW = ["cappuccino", "cola", "broodje", "poke"].map(pick);

/** Small product tile reused as the live preview inside the preference step. */
function PreviewTile({ p, mode }: { p: Product; mode: Pref }) {
  return (
    <div
      className="pos-tile"
      data-mode={mode}
      style={
        {
          "--tile-bg": CAT_BG[p.cat],
          "--tile-ink": CAT_INK[p.cat],
          cursor: "default",
          minHeight: 86,
        } as React.CSSProperties
      }
    >
      {mode === "image" && (
        <span className="pos-tile__thumb" style={{ background: CAT_BG[p.cat], height: 38, fontSize: 22 }}>
          {p.emoji}
        </span>
      )}
      <span className="pos-tile__name" style={{ fontSize: 13 }}>
        {p.name}
      </span>
      <span className="pos-tile__price" style={{ fontSize: 12 }}>
        {eur(p.price)}
      </span>
    </div>
  );
}

export function OnboardingPrototype() {
  useEffect(() => {
    const style = document.createElement("style");
    style.dataset.proto = "onboarding";
    style.textContent = onbCss;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  const o = useOnboarding();
  const frameRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"flow" | "library">("flow");

  const media = {
    welcome: (
      <div style={{ position: "absolute", inset: 0 }}>
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 28,
            right: 26,
            background: "var(--o-surface)",
            borderRadius: 13,
            padding: 14,
            boxShadow: "0 10px 26px rgba(40,40,90,.12)",
            display: "flex",
            alignItems: "center",
            gap: 11,
          }}
        >
          <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--o-cat-coffee-bg)", display: "grid", placeItems: "center", fontSize: 20 }}>
            ☕
          </span>
          <div>
            <div style={{ font: "700 14px var(--o-font)" }}>Cappuccino</div>
            <div style={{ font: "600 12px var(--o-font)", color: "var(--o-ink-4)", marginTop: 2 }}>{eur(3.4)}</div>
          </div>
          <div style={{ marginLeft: "auto", width: 30, height: 30, borderRadius: 8, background: "var(--o-navy)", color: "#fff", display: "grid", placeItems: "center" }}>
            <Icon name="plus" size={15} stroke={2.4} />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 150,
            left: 48,
            right: 24,
            background: "rgba(255,255,255,.72)",
            borderRadius: 11,
            padding: "11px 13px",
            boxShadow: "0 8px 20px rgba(40,40,90,.08)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--o-cat-bowl-bg)", display: "grid", placeItems: "center", fontSize: 16 }}>
            🥗
          </span>
          <div style={{ font: "600 13px var(--o-font)", color: "var(--o-ink-2)" }}>Poke bowl</div>
          <div style={{ marginLeft: "auto", font: "600 12.5px var(--o-font)", color: "var(--o-ink-3)" }}>{eur(11.5)}</div>
        </div>
      </div>
    ),
    preference: (value: string) => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {PREVIEW.map((p) => (
          <PreviewTile key={p.id} p={p} mode={value as Pref} />
        ))}
      </div>
    ),
  };

  // The component library — a separate, additional view reached via a link.
  if (view === "library") {
    return (
      <div className="onb onb-lib">
        <div className="onb-topbar">
          <button onClick={() => setView("flow")}>← Terug naar flow</button>
          <span>Guided onboarding · Component library</span>
          <a href="#/" style={{ marginLeft: "auto" }}>
            Alle prototypes ↗
          </a>
        </div>
        <div className="onb-lib__main">
          <Gallery />
        </div>
      </div>
    );
  }

  // The end-to-end flow — fullscreen, like the other prototypes. The root is the
  // positioned context every overlay (modal, spotlight, toast, launcher) anchors to.
  return (
    <div className="onb onb-root" ref={frameRef} id="onb-frame">
      <Pos pref={o.pref} onCheckout={() => o.tickChecklist("order")} />

      {o.phase === "app" && (
        <Launcher
          open={o.launcherOpen}
          pulse={o.discover}
          checklist={o.checklist}
          onToggle={o.toggleLauncher}
          onRestartTour={o.restartTour}
        />
      )}

      {o.phase === "tour" && (
        <SpotlightTour
          frameRef={frameRef}
          steps={POS_TOUR}
          index={o.tourStep}
          onNext={() => o.tourNext(POS_TOUR.length - 1)}
          onPrev={o.tourPrev}
          onClose={o.tourClose}
        />
      )}

      {o.toast && (
        <Toast
          title="Rondleiding voltooid 🎉"
          body="Je kent nu de 4 kernacties. Hervat altijd via de help-knop."
          onClose={o.hideToast}
        />
      )}

      {o.phase === "intro" && (
        <IntroModal
          steps={POS_INTRO}
          index={o.introStep}
          pref={o.pref}
          media={media}
          onPref={(v) => o.setPref(v as Pref)}
          onNext={o.introNext}
          onPrev={o.introPrev}
          onSkip={o.closeIntro}
          onChoose={o.choose}
        />
      )}

      <OnbTweaks o={o} onComponents={() => setView("library")} />
    </div>
  );
}

/** Demo controls + nav, matching the tweaks-panel convention of the other
 *  prototypes (which keep their "All prototypes" link here too). */
function OnbTweaks({ o, onComponents }: { o: Onboarding; onComponents: () => void }) {
  return (
    <div className="onb-twk">
      <div className="onb-twk__hd">
        Tweaks
        <span style={{ font: "500 10px var(--o-font)", color: "var(--o-ink-5)" }}>demo</span>
      </div>
      <div className="onb-twk__body">
        <div className="onb-twk__sect">Flow</div>
        <button className="onb-twk__btn" onClick={o.replayDemo}>
          ↻ Herstart vanaf intro
        </button>
        <button className="onb-twk__btn" onClick={o.restartTour}>
          ▶ Toon rondleiding
        </button>
        <button className="onb-twk__btn" onClick={o.closeIntro}>
          ⤼ Sla intro over
        </button>

        <div className="onb-twk__sect">Productweergave</div>
        <div className="onb-twk__seg">
          <button data-on={o.pref === "color" ? 1 : 0} onClick={() => o.setPref("color")}>
            Kleur
          </button>
          <button data-on={o.pref === "image" ? 1 : 0} onClick={() => o.setPref("image")}>
            Afbeelding
          </button>
        </div>

        <div className="onb-twk__sect">Navigatie</div>
        <button className="onb-twk__btn" onClick={onComponents}>
          ▦ Component library →
        </button>
        <a className="onb-twk__btn" href="#/" style={{ display: "block", lineHeight: "32px", textDecoration: "none" }}>
          ← Alle prototypes
        </a>
      </div>
    </div>
  );
}
