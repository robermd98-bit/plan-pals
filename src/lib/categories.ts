export type Category = "deporte" | "social" | "idiomas" | "aire_libre" | "cultura";

export const CATEGORIES: { id: Category; label: string; paperVar: string; washiVar: string }[] = [
  { id: "deporte",    label: "Deporte",    paperVar: "var(--paper-sport)",    washiVar: "var(--washi-mint)" },
  { id: "social",     label: "Cañas",      paperVar: "var(--paper-social)",   washiVar: "var(--washi-pink)" },
  { id: "idiomas",    label: "Idiomas",    paperVar: "var(--paper-language)", washiVar: "var(--washi-mint)" },
  { id: "aire_libre", label: "Aire libre", paperVar: "var(--paper-outdoor)",  washiVar: "var(--washi-yellow)" },
  { id: "cultura",    label: "Cultura",    paperVar: "var(--paper-culture)",  washiVar: "var(--washi-pink)" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<Category, (typeof CATEGORIES)[number]>;

// Versión más saturada/oscura de cada color de papel, misma tonalidad,
// pensada para que las ondas de pulso se sientan parte del propio color
// de la tarjeta en vez de un acento aparte.
const RING_COLORS: Record<Category, string> = {
  deporte:    "#6FAE43",
  social:     "#D97854",
  idiomas:    "#3C93C2",
  aire_libre: "#D1A428",
  cultura:    "#9B5FD1",
};

export function ringColor(cat: string): string {
  return RING_COLORS[cat as Category] ?? RING_COLORS.social;
}

export function paperColor(cat: string): string {
  return CATEGORY_MAP[cat as Category]?.paperVar ?? "var(--paper-social)";
}
export function washiColor(cat: string): string {
  return CATEGORY_MAP[cat as Category]?.washiVar ?? "var(--washi-pink)";
}
export function categoryLabel(cat: string): string {
  return CATEGORY_MAP[cat as Category]?.label ?? cat;
}
