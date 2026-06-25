import type { IconName } from "./icons";

export type Placement = "top" | "bottom" | "left" | "right";

/* ----------------------------------------------------------- POS catalog */

export type CategoryKey = "coffee" | "cold" | "food" | "bowl" | "sweet";

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "coffee", label: "Koffie" },
  { key: "cold", label: "Fris" },
  { key: "food", label: "Eten" },
  { key: "bowl", label: "Bowls" },
  { key: "sweet", label: "Zoet" },
];

export type Product = {
  id: string;
  name: string;
  price: number;
  cat: CategoryKey;
  emoji: string;
};

// Demo-data instead of an empty grid — so the value is imaginable from step 1.
export const PRODUCTS: Product[] = [
  { id: "cappuccino", name: "Cappuccino", price: 3.4, cat: "coffee", emoji: "☕" },
  { id: "espresso", name: "Espresso", price: 2.6, cat: "coffee", emoji: "☕" },
  { id: "latte", name: "Latte macchiato", price: 3.8, cat: "coffee", emoji: "🥛" },
  { id: "thee", name: "Verse thee", price: 2.9, cat: "coffee", emoji: "🍵" },
  { id: "cola", name: "Cola", price: 3.0, cat: "cold", emoji: "🥤" },
  { id: "jus", name: "Verse jus", price: 3.9, cat: "cold", emoji: "🍊" },
  { id: "water", name: "Water plat", price: 2.4, cat: "cold", emoji: "💧" },
  { id: "smoothie", name: "Smoothie", price: 4.8, cat: "cold", emoji: "🥤" },
  { id: "broodje", name: "Broodje", price: 5.5, cat: "food", emoji: "🥪" },
  { id: "tosti", name: "Tosti ham/kaas", price: 4.5, cat: "food", emoji: "🧀" },
  { id: "wrap", name: "Wrap kip", price: 6.5, cat: "food", emoji: "🌯" },
  { id: "soep", name: "Soep van de dag", price: 5.0, cat: "food", emoji: "🍲" },
  { id: "poke", name: "Poke bowl", price: 11.5, cat: "bowl", emoji: "🥗" },
  { id: "acai", name: "Açaí bowl", price: 9.5, cat: "bowl", emoji: "🍓" },
  { id: "yoghurt", name: "Yoghurt bowl", price: 7.5, cat: "bowl", emoji: "🥣" },
  { id: "brownie", name: "Brownie", price: 3.2, cat: "sweet", emoji: "🍫" },
  { id: "muffin", name: "Muffin", price: 2.8, cat: "sweet", emoji: "🧁" },
  { id: "cheesecake", name: "Cheesecake", price: 4.2, cat: "sweet", emoji: "🍰" },
];

export const eur = (n: number) =>
  "€ " + n.toFixed(2).replace(".", ",");

/* ------------------------------------------------- onboarding flow config */

/** A modal step is data, so the same IntroModal renders any feature's intro. */
export type ModalStep =
  | { kind: "welcome"; eyebrow: string; title: string; body: string }
  | {
      kind: "preference";
      eyebrow: string;
      title: string;
      body: string;
      options: { value: string; title: string; desc: string }[];
    }
  | {
      kind: "choice";
      eyebrow: string;
      title: string;
      body: string;
      options: {
        value: "tour" | "discover" | "later";
        title: string;
        desc: string;
        icon: IconName;
        recommended?: boolean;
      }[];
    };

export const POS_INTRO: ModalStep[] = [
  {
    kind: "welcome",
    eyebrow: "Welkom",
    title: "Maak kennis met je nieuwe POS",
    body: "Sneller aanslaan, sluitende kassa-discipline en een volledig overzicht — in één touch-vriendelijke interface, ontworpen voor hospitality.",
  },
  {
    kind: "preference",
    eyebrow: "Productweergave",
    title: "Hoe wil je producten zien?",
    body: "Kies wat het beste werkt voor jullie team. Je kunt dit later altijd aanpassen.",
    options: [
      {
        value: "color",
        title: "Kleurcodering",
        desc: "Snel scannen op categorie. Werkt goed voor ervaren teams.",
      },
      {
        value: "image",
        title: "Afbeeldingen",
        desc: "Visueel rijker. Handig voor nieuw personeel of grote menukaarten.",
      },
    ],
  },
  {
    kind: "choice",
    eyebrow: "Je bent klaar",
    title: "Hoe wil je beginnen?",
    body: "Kies hoe je de POS wilt leren kennen. Je kunt dit moment altijd opnieuw oproepen via de help-knop.",
    options: [
      {
        value: "tour",
        title: "Neem een rondleiding",
        desc: "We lopen samen langs de 4 belangrijkste acties. ~2 min.",
        icon: "arrow-right",
        recommended: true,
      },
      {
        value: "discover",
        title: "Zelf ontdekken",
        desc: "We markeren tips terwijl je rondklikt. Op je eigen tempo.",
        icon: "search",
      },
      {
        value: "later",
        title: "Later",
        desc: "Sluit en ga direct aan de slag.",
        icon: "x",
      },
    ],
  },
];

/**
 * Tour steps as data: each anchors to a real DOM node via `target`
 * (data-tour-id) and the engine computes position at runtime. `place` is the
 * preferred side; the engine flips it to stay inside the frame.
 */
export type TourStep = {
  id: string;
  target: string;
  eyebrow: string;
  title: string;
  body: string;
  place: Placement;
};

export const POS_TOUR: TourStep[] = [
  {
    id: "order",
    target: "pos-product",
    eyebrow: "Stap 1 van 4",
    title: "Product aanslaan",
    body: "Tik op een product om het op de bon te zetten. De bon telt rechts automatisch op.",
    place: "right",
  },
  {
    id: "search",
    target: "pos-search",
    eyebrow: "Stap 2 van 4",
    title: "Zoeken & categorieën",
    body: "Vind elk product in seconden — filter op categorie of zoek met de naam.",
    place: "bottom",
  },
  {
    id: "discount",
    target: "pos-discount",
    eyebrow: "Stap 3 van 4",
    title: "Korting of aanpassing",
    body: "Pas op een regel snel een korting of aanpassing toe — handig bij acties.",
    place: "left",
  },
  {
    id: "checkout",
    target: "pos-checkout",
    eyebrow: "Stap 4 van 4",
    title: "Afrekenen",
    body: "Reken af en kies de betaalmethode. Klaar — de kassa klopt aan het eind van de dag.",
    place: "top",
  },
];

/* -------------------------------------------------------- setup checklist */

export type ChecklistItem = { id: string; label: string; done: boolean };

// Endowed progress: the first item starts ticked (goal-gradient pull).
export const POS_CHECKLIST: ChecklistItem[] = [
  { id: "import", label: "Producten geïmporteerd", done: true },
  { id: "tour", label: "Rondleiding gevolgd", done: false },
  { id: "order", label: "Eerste bestelling afgerekend", done: false },
  { id: "discount", label: "Kortingsknop ingesteld", done: false },
  { id: "team", label: "Team uitgenodigd", done: false },
];
