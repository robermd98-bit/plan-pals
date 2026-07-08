import { Dumbbell, Beer, Languages, Mountain, Landmark, MessageCircle, type LucideIcon } from "lucide-react";
import { ringColor, type Category } from "@/lib/categories";

const ICONS: Record<Category, LucideIcon> = {
  deporte: Dumbbell,
  social: Beer,
  idiomas: Languages,
  aire_libre: Mountain,
  cultura: Landmark,
};

export function categoryIconFor(cat: string): LucideIcon {
  return ICONS[cat as Category] ?? MessageCircle;
}

export function CategoryIcon({
  category,
  size = 20,
  className = "",
  tinted = true,
}: {
  category: string;
  size?: number;
  className?: string;
  tinted?: boolean;
}) {
  const Icon = categoryIconFor(category);
  return (
    <Icon
      size={size}
      className={className}
      color={tinted ? ringColor(category) : "currentColor"}
      strokeWidth={2.25}
    />
  );
}
