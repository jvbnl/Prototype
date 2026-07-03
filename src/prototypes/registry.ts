import type { ComponentType } from "react";
import { BillingPrototype } from "./billing/BillingPrototype";
import { DealCheckoutPrototype } from "./deal-checkout/DealCheckoutPrototype";
import { FamilyPrototype } from "./family/FamilyPrototype";
import { OnboardingPrototype } from "./onboarding/OnboardingPrototype";
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
    slug: "onboarding",
    title: "Guided onboarding",
    tagline: "Reusable activation patterns + POS example",
    description:
      "Reusable, design-system-native onboarding patterns — intro-modal (welcome / preference / choice), spotlight coachmark tour, success-toast, launcher with help-hub, and a setup checklist — with the new POS-flow as the reference integration. The tour engine anchors to real DOM nodes (data-tour-id), auto-flips placement, repositions on resize/scroll, and is keyboard- and focus-trap-accessible. A \"Componenten\" gallery documents each building block.",
    tags: ["Onboarding", "Tour", "POS"],
    accent: "#5564E8",
    component: OnboardingPrototype,
  },
  {
    slug: "pos",
    title: "Gymly POS",
    tagline: "Restaurant & bar point-of-sale",
    description:
      "Touch POS for hospitality: PIN sign-in with start- and end-of-shift cash counting, floor plan with table statuses, order screen with category-tinted products and a kitchen/bar order ticket, a kitchen display board, and open-orders overview — plus reserve, checkout and cancel flows. Fully responsive with a mobile bottom-sheet cart.",
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
  {
    slug: "family",
    title: "Family accounts",
    tagline: "Linked members on one main account",
    description:
      "Member detail screen with the \"Add family member\" flow: link an existing member or create a new one, with relation and billing (IBAN, billing email) inherited from the hoofdaccount. Adding a member promotes the main account, reveals the family-group switcher, logs an activity entry and fires a toast. Seed the family size and open overlays from the tweaks panel.",
    tags: ["Customers", "Family", "Flow"],
    accent: "#7A3FF2",
    component: FamilyPrototype,
  },
];

export function getPrototype(slug: string): PrototypeMeta | undefined {
  return PROTOTYPES.find((p) => p.slug === slug);
}
