import { Link } from "@tanstack/react-router";
import { Compass, Plus, Calendar, Sparkles, User } from "lucide-react";

type Item = { to: string; label: string; icon: typeof Compass; big?: boolean; exact?: boolean };
const items: Item[] = [
  { to: "/", label: "Descubrir", icon: Compass, exact: true },
  { to: "/mis-planes", label: "Mis planes", icon: Calendar },
  { to: "/crear", label: "Crear", icon: Plus, big: true },
  { to: "/anfitrion", label: "Anfitrión", icon: Sparkles },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex justify-around items-end px-2 pt-2 pb-3 bg-[var(--card)]"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      {items.map(({ to, label, icon: Icon, big, exact }) => (
        <Link
          key={to}
          to={to as never}
          activeOptions={exact ? { exact: true } : undefined}
          className="flex flex-col items-center gap-0.5 text-[11px] text-[var(--ink)]/50 [&.active]:text-[var(--ink)]"
          activeProps={{ className: "active" }}
        >
          <span
            className={`flex items-center justify-center rounded-full ${
              big ? "w-12 h-12 -mt-5" : "w-9 h-9"
            }`}
            style={{
              backgroundColor: big ? "var(--pin)" : "transparent",
              color: big ? "var(--pin-foreground)" : "inherit",
              boxShadow: big ? "0 4px 10px rgba(0,0,0,0.18)" : undefined,
            }}
          >
            <Icon size={big ? 24 : 18} />
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600 }}>
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
