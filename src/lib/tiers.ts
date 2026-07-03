export interface Tier {
  id: string;
  label: string;
  emoji: string;
  min: number;
}

export const TIERS: Tier[] = [
  { id: "novato", label: "Novato", emoji: "🌱", min: 0 },
  { id: "habitual", label: "Habitual", emoji: "🔥", min: 3 },
  { id: "veterano", label: "Veterano de la cuadrilla", emoji: "🏆", min: 8 },
];

export function tierFor(plansCount: number): Tier {
  let current = TIERS[0];
  for (const t of TIERS) if (plansCount >= t.min) current = t;
  return current;
}

export function nextTier(plansCount: number): Tier | null {
  return TIERS.find((t) => t.min > plansCount) ?? null;
}
