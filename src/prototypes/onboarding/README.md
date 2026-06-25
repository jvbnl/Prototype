# Guided onboarding — patterns + POS example

Reusable onboarding components (intro-modal, spotlight-tour, success-toast,
launcher/help-hub, setup-checklist) with the **new POS-flow** as the only example
integration. Built from the handoff _"Guided onboarding patterns → Gymly design
system"_ and the `Richting A` reference prototype.

Registered as the `onboarding` prototype in `src/prototypes/registry.ts`; like the
other prototypes it is a `"use client"` component that injects its own
`styles.css` (`?raw`) on mount and removes it on unmount.

> Relationship to **Gymly POS**: that prototype has an inline 2-step intro modal
> (triggered from its Tweaks). This prototype is the **productized, reusable**
> version of the whole onboarding system — the same intro plus the spotlight
> tour, launcher, toast and checklist — extracted as design-system components and
> demonstrated on a POS-style backdrop.

> The HTML/JS prototypes from the handoff used hardcoded styling and fixed pixel
> coordinates. None of that is carried over — they were spec for behaviour,
> layout and copy only. All styling runs through tokens in `styles.css`.

## DS-bouwstenen — hergebruikt vs. nieuw

| Onboarding-component | Bouwt op (DS-primitive) | Status |
| --- | --- | --- |
| `IntroModal` (welkom/voorkeur/keuze) | Modal/Dialog + Button + RadioCard | **nieuw** patroon op bestaande primitives |
| `Coachmark` (tooltip) | Popover/Tooltip + Button + Badge | **nieuw** |
| `SpotlightTour` (engine) | Portal/overlay + focus-conventies | **nieuw** (kern) |
| `SuccessToast` | Toast | hergebruik |
| `Launcher` + help-hub | FAB + Popover + Checklist | **nieuw** schil om bestaande |
| `Checklist` / `ProgressBar` | Checklist + ProgressBar | hergebruik |
| `Segments` / `Dots` | kleine voortgangsindicatoren | **nieuw**, triviaal |

Tokens (kleur, spacing, radius, shadow, typografie), iconenset, focus-ring,
overlay-aanpak en nl-copy: in productie via de bestaande variabelen/thema — hier
samengevat in `styles.css` (scope `.onb`).

## Tour-engine (de kern)

`components/spotlight-tour.tsx` — bewust **niet** met vaste coördinaten:

- **DOM-anker, geen pixels.** Elk doel krijgt een stabiele hook
  (`data-tour-id="pos-product"`); positie wordt runtime berekend met
  `getBoundingClientRect` t.o.v. het frame.
- **Config-driven.** Stappen zijn data (`POS_TOUR` in `data.ts`): `id`,
  `target`, `eyebrow`, `title`, `body`, `place`. Dezelfde engine draait elke
  feature.
- **Collision/placement.** Tooltip flipt automatisch (boven/onder/links/rechts)
  en blijft binnen het frame (voorkeur → tegenoverliggend → rest → clamp).
- **Herpositioneren** bij resize/scroll (`ResizeObserver` + listeners).
- **Persistentie.** Per feature één "gezien"-vlag (`useOnboarding`, localStorage)
  zodat de intro één keer triggert; altijd herstartbaar via de launcher.
- **Toegankelijk.** Focus-trap + Esc in de modal, focus naar de coachmark per
  stap, toetsenbordnavigatie (Enter/→ = volgende, ← = vorige, Esc = sluiten),
  zichtbare focus-ring, `aria`-rollen, en `prefers-reduced-motion`.
- **Touch/POS.** Hit-targets ≥ 44px (`--o-tap`), werkt op tablet-resoluties.

## De POS-flow (voorbeeld)

1. **Intro stap 1** — "Maak kennis met je nieuwe POS".
2. **Intro stap 2 (voorkeur)** — "Hoe wil je producten zien?" → Kleurcodering vs
   Afbeeldingen, met **live preview** rechts; de keuze wordt opgeslagen en direct
   toegepast op de POS-tegels.
3. **Keuze** — Rondleiding (aanrader) / Zelf ontdekken / Later.
4. **Tour (4 kritieke POS-flows)** — product aanslaan · zoeken & categorieën ·
   korting op een item · afrekenen & betaalmethode.
5. **Afronden** — success-toast + checklist-item afgevinkt; launcher rechtsonder
   voor herstart.

De **Tweaks**-panel (rechtsonder) herstart de demo, toont de rondleiding, slaat
de intro over en wisselt de productweergave.

## Gymly-breed uitrollen

De engine is feature-agnostisch. Voor rooster/financiën/CRM:

1. Geef de doelen een `data-tour-id`.
2. Schrijf een stappen-array (zoals `POS_TOUR`) + de modal-steps (`POS_INTRO`).
3. Render `<IntroModal>`, `<SpotlightTour>` en `<Launcher>` met een eigen
   "gezien"-sleutel in `useOnboarding`.

Geen engine-wijzigingen nodig — alleen configuratie.

## Bestanden

```
OnboardingPrototype.tsx    registry-component: CSS-injectie, POS-backdrop, flow,
                           componenten-galerij, tweaks-panel
styles.css                 design tokens (scope .onb) + primitive/POS-styles
data.ts                    POS-catalogus, intro-steps, tour-config, checklist
useOnboarding.ts           flow-state + persistentie ("gezien"-vlag, voorkeur)
icons.tsx                  stroked icon-set
pos.tsx                    touch/tablet POS (cart, zoeken, korting, afrekenen)
gallery.tsx                "Componenten"-sectie (anatomie + states)
components/
  intro-modal.tsx          2-staps split-layout + keuzescherm (focus-trap, a11y)
  spotlight-tour.tsx       config-driven, DOM-ankerende tour-engine
  coachmark.tsx            één tour-stap (herbruikt in de galerij)
  launcher.tsx             FAB + help-hub + setup-checklist
  primitives.tsx           Segments, Dots, ProgressBar, Checklist, Toast
  useFocusTrap.ts          focus-trap + Esc voor de modal
```
