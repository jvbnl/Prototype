import type { ComponentType } from "react";
import { BillingPrototype } from "./billing/BillingPrototype";
import { DealCheckoutPrototype } from "./deal-checkout/DealCheckoutPrototype";
import { PosPrototype } from "./pos/PosPrototype";

export type PrototypeMeta = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  accent: string;
  component: ComponentType;
};

export const PROTOTYPES: PrototypeMeta[] = [
  {
    slug: "pos",
    title: "Gymly POS",
    tagline: "Restaurant & bar point-of-sale",
    description:
      "Touch POS for hospitality: floor plan with table statuses, order screen with category-tinted products and a kitchen/bar order ticket, a kitchen display board, and open-orders overview — plus reserve, checkout and cancel flows. Fully responsive with a mobile bottom-sheet cart.",
    tags: ["POS", "Hospitality", "Mobile"],
    accent: "#7000FF",
    component: PosPrototype,
  },
  {
    slug: "deal-checkout",
    title: "Deal Checkout",
    tagline: "Standalone checkout with shareable deal state",
    description:
      "Four explorations of a deal-aware checkout for Gymly, shareable by sales reps or sent from Gymly directly. Toggle variant, deal type, urgency timer and sender in the tweaks panel.",
    tags: ["Checkout", "Deal", "4 variants"],
    accent: "#7C3AED",
    component: DealCheckoutPrototype,
  },
  {
    slug: "billing",
    title: "Gymly Billing",
    tagline: "Self-serve billing, plan & invoices",
    description:
      "Mid-fi wireframe of the Gymly billing settings: current plan, bill preview, add-ons, support tier, payment method and invoices. Account state, upsell prominence and support tier all toggleable.",
    tags: ["Billing", "Settings", "Wireframe"],
    accent: "#1a1a1a",
    component: BillingPrototype,
  },
];

export function getPrototype(slug: string): PrototypeMeta | undefined {
  return PROTOTYPES.find((p) => p.slug === slug);
}
