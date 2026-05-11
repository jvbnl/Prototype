# Prototypes

A small gallery of self-contained prototypes shipped from Claude Design
(`claude.ai/design`). React + TypeScript + Vite.

## Available prototypes

- **Deal Checkout** (`#/deal-checkout`) — standalone Gymly checkout with a deal
  state. Four variants (spotlight banner / hero replacement / summary integrated /
  dedicated deal card) plus a tweaks panel for variant, deal type, sender, urgency
  timer and applies-to.
- **Gymly Billing** (`#/billing`) — self-serve billing settings: current plan,
  bill preview, add-ons, support tier, payment method and invoices. Account
  state and upsell prominence toggleable via Tweaks.

The landing page at `/` (hash `#/`) lists every prototype.

## Layout

```
index.html              # generic shell, just renders #root
src/
  main.tsx              # mounts <App />
  App.tsx               # hash router: '#/' → Home, '#/<slug>' → prototype
  home/
    Home.tsx            # prototype gallery
    home.css            # gallery styles (injected when Home mounts)
  prototypes/
    registry.ts         # list of prototypes (slug, title, component)
    billing/            # Gymly Billing prototype + its styles.css
    deal-checkout/      # Deal Checkout prototype + its styles.css
```

Each prototype owns its CSS as a `?inline`-imported string. The root component
appends it as a `<style>` tag on mount and removes it on unmount, so prototypes
stay fully isolated from each other (and from the homepage).

## Adding a new prototype

1. Create `src/prototypes/<slug>/<Name>Prototype.tsx` and a `styles.css`
   next to it. In the component, inject the CSS:
   ```tsx
   import css from "./styles.css?inline";
   useEffect(() => {
     const s = document.createElement("style");
     s.textContent = css;
     document.head.appendChild(s);
     return () => s.remove();
   }, []);
   ```
2. Register it in `src/prototypes/registry.ts`.

## Scripts

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production bundle to dist/
npm run typecheck
```
