import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, categoryEmoji } from "@/lib/categories";
import { PaperNote } from "@/components/PaperNote";

export const Route = createFileRoute("/_authenticated/comunidad/")({
  component: Comunidad,
});

type Club = { company_name: string; category: string; members: number };

function Comunidad() {
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    (async () => {
      const { data: acts } = await supabase.from("activities_catalog").select("company_name, category");
      const byCompany = new Map<string, string>();
      (acts ?? []).forEach((a) => {
        if (!byCompany.has(a.company_name)) byCompany.set(a.company_name, a.category);
      });

      const { data: members } = await supabase.from("club_members").select("company_name");
      const counts = new Map<string, number>();
      (members ?? []).forEach((m) => counts.set(m.company_name, (counts.get(m.company_name) ?? 0) + 1));

      const list: Club[] = Array.from(byCompany.entries()).map(([company_name, category]) => ({
        company_name,
        category,
        members: counts.get(company_name) ?? 0,
      }));
      list.sort((a, b) => b.members - a.members || a.company_name.localeCompare(b.company_name));
      setClubs(list);
    })();
  }, []);

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-4xl text-center font-extrabold" style={{ color: "var(--ink)" }}>Salas en directo</h1>
      <p className="text-center text-[var(--ink)]/60 text-sm mt-1 mb-6">
        Habla con gente sin necesidad de estar apuntado a ningún plan
      </p>

      <div className="grid gap-3">
        <Link to="/comunidad/$category" params={{ category: "general" }}>
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ backgroundColor: "var(--pin)", color: "var(--pin-foreground)" }}>
            <span className="text-3xl">💬</span>
            <div>
              <h2 className="text-xl font-semibold">General</h2>
              <p className="text-xs opacity-80">Para hablar de lo que sea, con todo el mundo</p>
            </div>
          </div>
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} to="/comunidad/$category" params={{ category: c.id }}>
            <PaperNote category={c.id} rotation={0}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{c.emoji}</span>
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>{c.label}</h2>
                  <p className="text-xs opacity-70">Entrar a la sala</p>
                </div>
              </div>
            </PaperNote>
          </Link>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-1" style={{ color: "var(--ink)" }}>Clubes de negocios</h2>
      <p className="text-[var(--ink)]/60 text-xs mb-3">Únete al club de tu negocio favorito: planes, novedades y chat propio</p>
      <div className="grid gap-2">
        {clubs.map((c) => (
          <Link
            key={c.company_name}
            to="/clubes/$company"
            params={{ company: c.company_name }}
            className="flex items-center gap-3 rounded-xl px-3 py-2 bg-[var(--card)]"
            style={{ border: "1px solid var(--border)" }}
          >
            <span className="text-2xl">{categoryEmoji(c.category)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{c.company_name}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full shrink-0" style={{ backgroundColor: "var(--muted)" }}>
              {c.members} {c.members === 1 ? "miembro" : "miembros"}
            </span>
          </Link>
        ))}
        {clubs.length === 0 && (
          <p className="text-center text-[var(--ink)]/50 text-sm">Todavía no hay negocios con club.</p>
        )}
      </div>
    </div>
  );
}
