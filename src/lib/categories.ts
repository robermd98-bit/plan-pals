export type Category = "deporte" | "social" | "idiomas" | "aire_libre" | "cultura";

export const CATEGORIES: { id: Category; label: string; emoji: string; paperVar: string; washiVar: string }[] = [
  { id: "deporte",    label: "Deporte",    emoji: "⚽", paperVar: "var(--paper-sport)",    washiVar: "var(--washi-mint)" },
  { id: "social",     label: "Cañas",      emoji: "🍻", paperVar: "var(--paper-social)",   washiVar: "var(--washi-pink)" },
  { id: "idiomas",    label: "Idiomas",    emoji: "💬", paperVar: "var(--paper-language)", washiVar: "var(--washi-mint)" },
  { id: "aire_libre", label: "Aire libre", emoji: "🌿", paperVar: "var(--paper-outdoor)",  washiVar: "var(--washi-yellow)" },
  { id: "cultura",    label: "Cultura",    emoji: "🎭", paperVar: "var(--paper-culture)",  washiVar: "var(--washi-pink)" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<Category, (typeof CATEGORIES)[number]>;

export function paperColor(cat: string): string {
  return CATEGORY_MAP[cat as Category]?.paperVar ?? "var(--paper-social)";
}
export function washiColor(cat: string): string {
  return CATEGORY_MAP[cat as Category]?.washiVar ?? "var(--washi-pink)";
}
export function categoryLabel(cat: string): string {
  return CATEGORY_MAP[cat as Category]?.label ?? cat;
}
export function categoryEmoji(cat: string): string {
  return CATEGORY_MAP[cat as Category]?.emoji ?? "📌";
}
