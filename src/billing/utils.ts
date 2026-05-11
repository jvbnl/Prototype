export const eur = (n: number) =>
  n.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const E = (n: number) => "€ " + eur(n);
