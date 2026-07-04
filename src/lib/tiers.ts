export interface Tier {
  id: string;
  label: string;
  emoji: string;
  min: number;
  discount: number; // % de descuento en planes oficiales con negocio socio
}

export const TIERS: Tier[] = [
  { id: "novato", label: "Novato", emoji: "🌱", min: 0, discount: 0 },
  { id: "habitual", label: "Habitual", emoji: "🔥", min: 3, discount: 5 },
  { id: "veterano", label: "Veterano de la cuadrilla", emoji: "🏆", min: 8, discount: 10 },
  { id: "leyenda", label: "Leyenda de la cuadrilla", emoji: "👑", min: 15, discount: 15 },
];

export function tierFor(plansCount: number): Tier {
  let current = TIERS[0];
  for (const t of TIERS) if (plansCount >= t.min) current = t;
  return current;
}

export function nextTier(plansCount: number): Tier | null {
  return TIERS.find((t) => t.min > plansCount) ?? null;
}
