# Gymly Billing

Self-serve billing page for Gymly, built from the mid-fi wireframe handoff
(`Billing Page Wireframe.html` from `claude.ai/design`). React + TypeScript + Vite.

## What's in here

- `src/App.tsx` — composes the page, owns top-level state (tab, modals, demo tweaks).
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
- `src/styles/globals.css` — design tokens and the component CSS ported from the prototype.

The model is **single-invoice, monthly-only**: plan + add-ons + payment-processing fees are
bundled into one invoice on the 1st of every month.

## Scripts

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production bundle to dist/
npm run typecheck
```
