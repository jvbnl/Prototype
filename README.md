# Prototypes

A small gallery of self-contained prototypes shipped from Claude Design
(`claude.ai/design`). Next.js (App Router) + React + TypeScript.

## Available prototypes

- **Gymly POS** (`#/pos`) — touch point-of-sale for hospitality: floor plan with
  table statuses, an order screen with category-tinted products and a kitchen/bar
  ticket, a kitchen display board, and an open-orders overview — plus reserve,
  checkout and cancel flows. Fully responsive, with a mobile bottom-sheet cart and
  swipeable kitchen columns.
- **Deal Checkout** (`#/deal-checkout`) — standalone Gymly checkout with a deal
  state. Four variants (spotlight banner / hero replacement / summary integrated /
  dedicated deal card) plus a tweaks panel for variant, deal type, sender,
  urgency timer and applies-to.
- **Gymly Billing** (`#/billing`) — self-serve billing settings: current plan,
  bill preview, add-ons, support tier, payment method, invoices, and a full
  feature-matrix Plans tab with monthly/yearly billing.
- **Family accounts** (`#/family`) — member detail screen with the "Add family
  member" flow: link an existing member or create a new one, with relation and
  billing (IBAN, billing email) inherited from the hoofdaccount. Adding a member
  reveals the family-group switcher, logs an activity entry and fires a toast;
  the tweaks panel seeds the family size and opens the menu/modal overlays.

The landing page at `/` lists every prototype. Selecting one updates the URL
hash; back-navigation returns to the gallery.

## Layout

```
src/
  app/
    layout.tsx          # Next.js root layout, viewport, Google Fonts
    page.tsx            # renders <App />
    globals.css         # minimal resets only — prototypes ship their own CSS
  App.tsx               # client-side hash router: '#/' → Home, '#/<slug>' → prototype
  home/
    Home.tsx            # prototype gallery (client component)
    home.css            # gallery styles (injected when Home mounts)
  prototypes/
    registry.ts         # list of prototypes (slug, title, component)
    pos/                # Gymly POS prototype + its styles.css
    billing/            # Gymly Billing prototype + its styles.css
    deal-checkout/      # Deal Checkout prototype + its styles.css
    family/             # Family accounts prototype + its styles.css
```

Each prototype owns its CSS as a `?raw`-imported string (configured in
`next.config.mjs`). The root component appends it as a `<style>` tag on mount
and removes it on unmount, so prototypes stay fully isolated from each other
and from the homepage. Routing is hash-based so the whole app stays a single
Next.js page.

## Adding a new prototype

1. Create `src/prototypes/<slug>/<Name>Prototype.tsx` and a `styles.css`
   next to it. Mark the component as a client component and inject the CSS:
   ```tsx
   "use client";
   import css from "./styles.css?raw";
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
npm run dev        # http://localhost:3000
npm run build      # type-check + production build (.next/)
npm run start      # serve the production build
npm run typecheck
```
