export type AccountState = "active" | "trial" | "past-due" | "downgrade-pending";
export type UpsellMode = "subtle" | "medium" | "aggressive";
export type SupportKey = "standard" | "enhanced" | "premium";
export type PlanKey = "studio" | "starter" | "pro";
export type BillingCycle = "monthly" | "yearly";

export type Plan = {
  name: string;
  // Monthly price billed monthly.
  m: number;
  // Monthly-equivalent price when billed yearly (after the 20% discount).
  y: number;
  tagline: string;
  locations: string;
  badge?: string;
};

// Public pricing on gymly.io shows -20% on the yearly cycle across all plans.
export const YEARLY_DISCOUNT_PCT = 20;

export type Addon = {
  id: string;
  name: string;
  desc: string;
  price: number;
  active: boolean;
  recommend: boolean;
  qty?: number;
};

export type UsageItem = {
  id: string;
  name: string;
  unit: string;
  used: number;
  included: number | null;
  rate: number;
  forecast: number;
  sub?: string;
};

export type Invoice = {
  id: string;
  date: string;
  period: string;
  amount: number;
  status: "paid" | "upcoming";
  includesPlan: boolean;
};

export type SupportPlan = {
  name: string;
  price: string;
  priceDetail: string;
  desc: string;
  hours: string | string[];
  channels: string[];
  sla: { p1: string; p2: string; p3: string; p4: string };
  perks: string[];
};

export type Priority = {
  id: "p1" | "p2" | "p3" | "p4";
  label: string;
  desc: string;
};

export const GYM = { name: "CrossFit Amsterdam", locations: 2 };

// Self-serve tiers from the Notion Pricing Feature Matrix.
// Business is high-touch (sales) and intentionally excluded here.
// Yearly price = monthly × 0.8, displayed as the monthly-equivalent figure.
export const PLANS: Record<PlanKey, Plan> = {
  studio: {
    name: "Studio",
    m: 99,
    y: 79.2,
    tagline: "For small, single-location studios just getting started.",
    locations: "1",
    badge: "New",
  },
  starter: {
    name: "Starter",
    m: 169,
    y: 135.2,
    tagline: "Everything you need to run your gym.",
    locations: "Unlimited",
  },
  pro: {
    name: "Pro",
    m: 299,
    y: 239.2,
    tagline: "Grow your business, not your workload.",
    locations: "Unlimited",
  },
};

export const CURRENT_PLAN_KEY: PlanKey = "pro";
// Resolve a plan's monthly figure based on the active billing cycle.
export const planPrice = (key: PlanKey, cycle: BillingCycle) =>
  cycle === "yearly" ? PLANS[key].y : PLANS[key].m;
// Annual total billed up front on the yearly cycle.
export const yearlyTotal = (key: PlanKey) => PLANS[key].y * 12;
// Annual savings vs paying monthly for 12 months.
export const yearlySavings = (key: PlanKey) => (PLANS[key].m - PLANS[key].y) * 12;

export const ADDONS_BASE: Addon[] = [
  {
    id: "ai",
    name: "AI Coach",
    desc: "Auto-reply to member questions, draft programming.",
    price: 24.0,
    active: false,
    recommend: true,
  },
  {
    id: "branding",
    name: "Widget Custom Branding",
    desc: "Theme the booking widget to match your gym.",
    price: 4.99,
    active: true,
    recommend: false,
  },
  {
    id: "links",
    name: "Widget Custom Links",
    desc: "Deep links into specific schedules and products.",
    price: 12.99,
    active: true,
    recommend: false,
  },
  {
    id: "terminal-1",
    name: "Terminal rental — Oost",
    desc: "Physical card terminal at Amsterdam Oost.",
    price: 35.0,
    active: true,
    recommend: false,
  },
  {
    id: "terminal-2",
    name: "Terminal rental — Zuid",
    desc: "Physical card terminal at Amsterdam Zuid.",
    price: 35.0,
    active: true,
    recommend: false,
  },
  {
    id: "nutri",
    name: "Nutrisense",
    desc: "Nutrition tracking module for members.",
    price: 14.99,
    active: false,
    recommend: true,
  },
  {
    id: "workit",
    name: "Workit",
    desc: "Workout builder + member app integration.",
    price: 9.99,
    active: false,
    recommend: false,
  },
  {
    id: "events",
    name: "Events module",
    desc: "One-off events, retreats and workshops (incl. on Pro+).",
    price: 9.99,
    active: false,
    recommend: false,
  },
];

// Usage = payment processing only. SMS and storage are NOT charged by Gymly.
export const USAGE: UsageItem[] = [
  {
    id: "fees",
    name: "Payment processing",
    unit: "transactions",
    used: 412,
    included: null,
    rate: 0.29,
    forecast: 142.34,
    sub: "iDEAL, SEPA, Bancontact, card",
  },
  {
    id: "email",
    name: "Transactional emails",
    unit: "emails",
    used: 3142,
    included: null,
    rate: 0,
    forecast: 0,
    sub: "Booking confirmations, reminders, receipts — included",
  },
];

// Single invoice stream: plan + add-ons + usage bundled monthly.
// Plan-renewal months show a much larger amount (plan charge included).
export const INVOICES: Invoice[] = [
  {
    id: "INV-2026-05",
    date: "2026-06-01",
    period: "May 1 — May 31, 2026",
    amount: 247.32,
    status: "upcoming",
    includesPlan: false,
  },
  {
    id: "INV-2026-04",
    date: "2026-05-01",
    period: "Apr 1 — Apr 30, 2026",
    amount: 215.18,
    status: "paid",
    includesPlan: false,
  },
  {
    id: "INV-2026-03",
    date: "2026-04-01",
    period: "Mar 1 — Mar 31, 2026",
    amount: 198.04,
    status: "paid",
    includesPlan: false,
  },
  {
    id: "INV-2026-02",
    date: "2026-03-01",
    period: "Feb 1 — Feb 28, 2026",
    amount: 221.4,
    status: "paid",
    includesPlan: false,
  },
  {
    id: "INV-2026-01",
    date: "2026-02-01",
    period: "Jan 1 — Jan 31, 2026",
    amount: 1681.74,
    status: "paid",
    includesPlan: true,
  },
  {
    id: "INV-2025-12",
    date: "2026-01-01",
    period: "Dec 1 — Dec 31, 2025",
    amount: 189.66,
    status: "paid",
    includesPlan: false,
  },
];

// Reference patterns: AWS Support tiers, Atlassian SLA matrix, Stripe support
// page — compact tier summary on the overview, response-time matrix in a modal.
export const SUPPORT_PLANS: Record<SupportKey, SupportPlan> = {
  standard: {
    name: "Standard",
    price: "Included",
    priceDetail: "€ 0 · with every Gymly plan",
    desc: "Essential support for independent trainers and small studios.",
    hours: "Mon–Fri · 09:00–17:30 CET",
    channels: ["Chat", "E-mail", "Docs & tutorials"],
    sla: { p1: "8 business hrs", p2: "1 business day", p3: "2 business days", p4: "Best effort" },
    perks: ["Support via chat or e-mail", "Documentation & tutorials"],
  },
  enhanced: {
    name: "Enhanced",
    price: "10% of monthly spend",
    priceDetail: "min. € 49 / month",
    desc: "Faster responses and hands-on help for growing gyms.",
    hours: ["Mon–Fri · 09:00–17:30", "Mon–Sat (P1) · 08:00–20:00"],
    channels: ["Everything in Standard", "Intercom & phone", "Monthly Q&A livestream"],
    sla: { p1: "2 hrs", p2: "4 hrs", p3: "1 business day", p4: "3 business days" },
    perks: ["Intercom & phone support", "Monthly Q&A livestream", "Saturday support (P1)"],
  },
  premium: {
    name: "Premium",
    price: "10% of monthly spend",
    priceDetail: "min. € 199 / month",
    desc: "Dedicated support and custom service levels for franchises.",
    hours: ["Mon–Fri · 09:00–17:30", "Mon–Sun (P1) · 07:00–22:00"],
    channels: ["Everything in Enhanced", "Priority queue", "Named contact"],
    sla: { p1: "30 min", p2: "1 hr", p3: "4 business hrs", p4: "1 business day" },
    perks: ["Priority support", "Weekend support (P1)", "Faster response times"],
  },
};

export const PRIORITY_DEFS: Priority[] = [
  { id: "p1", label: "P1 · Critical", desc: "Site/app down, payments failing, can't run classes." },
  { id: "p2", label: "P2 · High", desc: "Core feature broken; workaround exists." },
  { id: "p3", label: "P3 · Normal", desc: "How-to questions, minor issues." },
  { id: "p4", label: "P4 · Low", desc: "Feature requests, cosmetic." },
];

export const REASONS = [
  { id: "cost", label: "Costs too much for what we use" },
  { id: "features", label: "Not using the extra features" },
  { id: "season", label: "Quiet season — temporarily downsizing" },
  { id: "switching", label: "Switching to another product" },
  { id: "closing", label: "Closing the studio" },
  { id: "other", label: "Something else" },
] as const;

export type ReasonId = (typeof REASONS)[number]["id"];

export const SAVE_OFFERS: Record<ReasonId, { title: string; body: string; cta: string }> = {
  cost: {
    title: "Stay on your plan with 30% off for 3 months",
    body: "If price is the issue, here's a one-time discount — full features for the next three months.",
    cta: "Apply 30% off & keep plan",
  },
  features: {
    title: "Stay on your plan with 50% off for 3 months",
    body: "Half-price for the next three months so you can give the features you're not using a proper shot before switching to a smaller plan.",
    cta: "Apply 50% off & keep plan",
  },
  season: {
    title: "Pause for the season instead",
    body: "Pause for up to 90 days. We keep everything ready and your members can still see schedules.",
    cta: "Pause for 90 days",
  },
  switching: {
    title: "Talk to us before you go",
    body: "We'd love to hear what's pulling you away — a 15-min call with someone who can actually fix it.",
    cta: "Book a 15-min call",
  },
  closing: {
    title: "We're sorry to hear it",
    body: "If you'd like, we can export everything for you and pause billing while you wind down.",
    cta: "Export my data",
  },
  other: {
    title: "Tell us a bit more",
    body: "Anything we can do? A team member will read this and reply within one business day.",
    cta: "Send to support",
  },
};

export const TIER_DELTAS: Record<string, { stays: string[]; goes: string[] }> = {
  pro_to_starter: {
    stays: [
      "All your members — first 25 stay active, others go read-only",
      "Planning & schedule — no change",
      "Native member app — iOS + Android",
      "Your data — nothing is deleted",
      "Support — daily Gymly support stays",
    ],
    goes: [
      "Multiple locations — from unlimited → 1 location",
      "Organizations & family accounts — will be hidden",
      "Advanced reports — basic only",
      "Add-ons — all add-ons paused",
    ],
  },
  pro_to_studio: {
    stays: [
      "First 25 members stay active",
      "Planning & schedule — no change",
      "Native member app",
      "Your data — nothing is deleted",
      "Support — daily Gymly support stays",
    ],
    goes: [
      "Multiple locations — from unlimited → 1 location",
      "Organizations & family accounts — removed",
      "Advanced reports — removed",
      "All add-ons paused",
    ],
  },
  starter_to_studio: {
    stays: [
      "First 25 members stay active",
      "Planning & schedule — no change",
      "Native member app",
      "Your data",
    ],
    goes: [
      "Multiple locations → 1 location",
      "Family accounts — removed",
      "Some add-ons paused",
    ],
  },
};

export const CANCEL_DELTA = {
  stays: [
    "Read-only access until period end",
    "Member exports & invoices",
    "Reactivation in one click",
    "Your data — kept for 30 days, then archived",
  ],
  goes: [
    "Bookings, check-in, payments",
    "Member app & custom branding",
    "All reports",
    "Support & uptime SLA",
    "All add-ons",
  ],
};

// ── Feature matrix ──────────────────────────────────────────────────────────
// Sourced from the Notion Pricing Feature Matrix. Business plan is excluded
// (high-touch, sales-led upsell). Only DIFFERENTIATED features are listed —
// the table is meant to inform the upgrade decision, not catalog every check.
// Uniform-across-plans features ("unlimited members", scheduling, payments,
// etc.) are summarised in the matrix footer instead of rendered as 25 rows of
// identical ✓ marks.

export type FeatureValue = boolean | string;

export type Feature = {
  id: string;
  label: string;
  studio: FeatureValue;
  starter: FeatureValue;
  pro: FeatureValue;
};

export type FeatureCategory = {
  id: string;
  label: string;
  features: Feature[];
};

export const FEATURE_MATRIX: FeatureCategory[] = [
  {
    id: "members",
    label: "Members & locations",
    features: [
      { id: "locations", label: "Locations", studio: "1 location", starter: "Unlimited", pro: "Unlimited" },
      { id: "family", label: "Family accounts", studio: false, starter: true, pro: true },
      { id: "orgs", label: "Organizations / corporate accounts", studio: false, starter: false, pro: true },
      { id: "branding", label: "Custom branding", studio: false, starter: true, pro: true },
      { id: "loc-memberships", label: "Location-specific memberships", studio: false, starter: true, pro: true },
    ],
  },
  {
    id: "reports",
    label: "Reports & analytics",
    features: [
      { id: "advanced-reports", label: "Advanced reports", studio: false, starter: false, pro: true },
      { id: "revenue", label: "Revenue analytics", studio: false, starter: false, pro: true },
      { id: "multi-country", label: "Multi-country support", studio: false, starter: true, pro: true },
    ],
  },
  {
    id: "payments",
    label: "Payments & billing",
    features: [
      { id: "discount-codes", label: "Discount codes", studio: false, starter: true, pro: true },
      { id: "multi-currency", label: "Multi-currency", studio: false, starter: false, pro: true },
    ],
  },
  {
    id: "bookings",
    label: "Schedule & bookings",
    features: [
      { id: "appointments", label: "Appointments & tours", studio: false, starter: true, pro: true },
      { id: "events", label: "Events", studio: false, starter: false, pro: true },
      { id: "bring-friend", label: "Bring a Friend", studio: false, starter: true, pro: true },
    ],
  },
  {
    id: "comms",
    label: "Communication",
    features: [
      { id: "email-templates", label: "Customizable email templates", studio: false, starter: true, pro: true },
    ],
  },
  {
    id: "member-app",
    label: "Member app",
    features: [
      { id: "qr", label: "QR check-in (Gymly ID)", studio: false, starter: true, pro: true },
      { id: "community", label: "Community home & feed", studio: false, starter: true, pro: true },
      { id: "custom-branded-app", label: "Custom-branded app", studio: false, starter: true, pro: true },
    ],
  },
  {
    id: "leads",
    label: "Leads & acquisition",
    features: [
      { id: "leads-dash", label: "Leads dashboard & conversion tracking", studio: false, starter: false, pro: true },
      { id: "widget", label: "Website widget (bookings, leads, guests)", studio: false, starter: false, pro: true },
      { id: "guest-reg", label: "Guest registration & payments", studio: false, starter: false, pro: true },
      { id: "contact-form", label: "Contact form (via widget)", studio: false, starter: false, pro: true },
      { id: "widget-branding", label: "Widget branding", studio: false, starter: false, pro: true },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    features: [
      { id: "pos", label: "Point of Sale", studio: false, starter: false, pro: true },
      { id: "payroll", label: "Payroll & staff hours", studio: false, starter: false, pro: true },
    ],
  },
];

// Plans share all of these — surfaced as a one-line footer in the matrix.
export const FEATURE_MATRIX_COMMON = [
  "Unlimited members",
  "Class scheduling, capacity & waitlist",
  "Automatic recurring payments & invoicing",
  "Member app with class booking",
  "Workout builder, routines & training logs",
  "In-app, push & email notifications",
  "Basic reports",
  "Standard support",
];
