// Mock data for the Family accounts flow prototype.
// Ported from the Claude Design handoff (`Family accounts - flow.dc.html`).

export type Member = { name: string; relation: string; grad: string };
export type PoolPerson = { name: string; email: string; grad: string };

/** Avatar gradients, cycled when creating brand-new family members. */
export const GRADS = [
  "linear-gradient(135deg,#F472B6,#EC4899)",
  "linear-gradient(135deg,#38BDF8,#0EA5E9)",
  "linear-gradient(135deg,#34D399,#10B981)",
  "linear-gradient(135deg,#FBBF24,#F59E0B)",
];

/** Existing members the "Bestaand lid" search can link to the family. */
export const POOL: PoolPerson[] = [
  { name: "Sophie de Vries", email: "sophie.devries@gmail.com", grad: GRADS[0] },
  { name: "Lucas Bakker", email: "lucas.bakker@gmail.com", grad: GRADS[1] },
  { name: "Emma Visser", email: "emma.visser@outlook.com", grad: GRADS[2] },
  { name: "Daan Jansen", email: "daan.jansen@gmail.com", grad: GRADS[3] },
  { name: "Noa Smit", email: "noa.smit@gmail.com", grad: GRADS[0] },
];

/** Preset family the tweaks panel seeds for its "filled" states. */
export const SEED: Member[] = [
  { name: "Sophie Koopmans", relation: "Dochter", grad: GRADS[0] },
  { name: "Lucas Koopmans", relation: "Zoon", grad: GRADS[1] },
];

/** First two letters of the name, uppercased — used for avatar monograms. */
export const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
