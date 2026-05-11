# Gymly Billing

Self-serve billing page for Gymly, built from the mid-fi wireframe handoff
(`Billing Page Wireframe.html` from `claude.ai/design`). Next.js (App Router) +
React + TypeScript.

## What's in here

- `src/app/layout.tsx` — root layout, Google Fonts, viewport set to the wireframe's
  1280px desktop width.
- `src/app/page.tsx` — renders the billing app.
- `src/app/globals.css` — design tokens and component CSS from the prototype.
- `src/App.tsx` — composes the page, owns top-level state (`"use client"`).
- `src/billing/data.ts` — plans, add-ons, usage, invoices, support-plan and flow data (all mocked).
- `src/billing/chrome.tsx` — settings sidebar, top bar, tab strip, state banner.
- `src/billing/overview.tsx` — Summary-tab sections: current plan, bill preview, add-ons,
  usage meter, payment method, support plan.
- `src/billing/invoices.tsx` — single-stream invoices table.
- `src/billing/plan-modal.tsx` — plan picker with 3 differentiators per tier and a shared
  usage-rates strip.
- `src/billing/support-modal.tsx` — full support-tier comparison with response-time SLA matrix.
- `src/billing/flow-modal.tsx` — cancel / downgrade / upgrade multi-step flows.
- `src/billing/tweaks.tsx` — floating panel for demoing account states and upsell prominence.

The model is **single-invoice, monthly-only**: plan + add-ons + payment-processing fees are
bundled into one invoice on the 1st of every month.

## Scripts

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (.next/)
npm run start      # serve the production build
npm run typecheck
```
