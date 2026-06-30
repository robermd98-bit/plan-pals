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
      className="fixed bottom-0 inset-x-0 z-40 flex justify-around items-end px-2 pt-2 pb-3"
      style={{
        background:
          "linear-gradient(180deg, transparent, rgba(50,30,15,0.55) 35%, rgba(50,30,15,0.85))",
        backdropFilter: "blur(6px)",
      }}
    >
      {items.map(({ to, label, icon: Icon, big, exact }) => (
        <Link
          key={to}
          to={to as never}
          activeOptions={exact ? { exact: true } : undefined}
          className="flex flex-col items-center gap-0.5 text-[11px] text-amber-50/80 [&.active]:text-white"
          activeProps={{ className: "active" }}
        >
          <span
            className={`flex items-center justify-center rounded-full border-2 border-amber-50/80 ${
              big ? "w-12 h-12 -mt-5" : "w-9 h-9"
            }`}
            style={{
              backgroundColor: big ? "var(--pin)" : "rgba(255,248,231,0.12)",
              boxShadow: big ? "0 4px 10px rgba(0,0,0,0.4)" : undefined,
            }}
          >
            <Icon size={big ? 24 : 18} />
          </span>
          <span style={{ fontFamily: "var(--font-hand)", fontSize: 13 }}>
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
