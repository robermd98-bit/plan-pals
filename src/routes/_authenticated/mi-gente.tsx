import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Person = { id: string; name: string; avatar_url: string | null; sharedCount: number };

export const Route = createFileRoute("/_authenticated/mi-gente")({
  component: MiGente,
});

function MiGente() {
  const { userId } = Route.useRouteContext();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: joined } = await supabase.from("plan_participants").select("plan_id").eq("user_id", userId);
      const { data: created } = await supabase.from("plans").select("id").eq("creator_id", userId);
      const myPlanIds = Array.from(new Set([...(joined ?? []).map((j) => j.plan_id), ...(created ?? []).map((c) => c.id)]));

      if (!myPlanIds.length) {
        setPeople([]);
        setLoading(false);
        return;
      }

      const counts = new Map<string, number>();

      const { data: co } = await supabase
        .from("plan_participants").select("plan_id, user_id").in("plan_id", myPlanIds).neq("user_id", userId);
      (co ?? []).forEach((r) => counts.set(r.user_id, (counts.get(r.user_id) ?? 0) + 1));

      const { data: plansInfo } = await supabase.from("plans").select("id, creator_id").in("id", myPlanIds);
      (plansInfo ?? []).forEach((p) => {
        if (p.creator_id !== userId) counts.set(p.creator_id, (counts.get(p.creator_id) ?? 0) + 1);
      });

      const ids = Array.from(counts.keys());
      if (!ids.length) {
        setPeople([]);
        setLoading(false);
        return;
      }
      const { data: profs } = await supabase.from("profiles").select("id, name, avatar_url").in("id", ids);
      const list: Person[] = (profs ?? []).map((p) => ({ ...p, sharedCount: counts.get(p.id) ?? 0 }));
      list.sort((a, b) => b.sharedCount - a.sharedCount);
      setPeople(list);
      setLoading(false);
    })();
  }, [userId]);

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-4xl text-center font-extrabold" style={{ color: "var(--ink)" }}>Mi gente</h1>
      <p className="text-center text-[var(--ink)]/60 text-sm mt-1 mb-6">
        Todas las personas con las que ya has coincidido en algún plan
      </p>

      {loading && <p className="text-center text-[var(--ink)]/50 text-sm">Cargando…</p>}
      {!loading && people.length === 0 && (
        <p className="text-center text-[var(--ink)]/50 text-sm">Todavía no has coincidido con nadie. ¡Apúntate a un plan!</p>
      )}

      <div className="grid gap-2">
        {people.map((p) => (
          <Link
            key={p.id}
            to="/u/$id"
            params={{ id: p.id }}
            className="flex items-center gap-3 rounded-xl px-3 py-2 bg-[var(--card)]"
            style={{ border: "1px solid var(--border)" }}
          >
            <div className="w-11 h-11 rounded-full overflow-hidden bg-white/70 flex items-center justify-center shrink-0" style={{ border: "1px solid var(--border)" }}>
              {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : "👤"}
            </div>
            <p className="flex-1 min-w-0 text-sm font-semibold truncate">{p.name}</p>
            <span className="text-xs px-2 py-1 rounded-full shrink-0" style={{ backgroundColor: "var(--muted)" }}>
              {p.sharedCount} {p.sharedCount === 1 ? "plan" : "planes"} juntos
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
