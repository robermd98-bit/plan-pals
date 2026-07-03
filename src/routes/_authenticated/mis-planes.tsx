import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";
import { categoryEmoji, categoryLabel } from "@/lib/categories";

type Plan = {
  id: string;
  category: string;
  title: string;
  location: string;
  date: string;
  time: string;
  creator_id: string;
  max_people: number;
};

type ViewedPlan = Plan & { going: number };

export const Route = createFileRoute("/_authenticated/mis-planes")({
  component: MyPlans,
});

function MyPlans() {
  const { userId } = Route.useRouteContext();
  const [mine, setMine] = useState<Plan[]>([]);
  const [joined, setJoined] = useState<Plan[]>([]);
  const [viewed, setViewed] = useState<ViewedPlan[]>([]);

  useEffect(() => {
    (async () => {
      const { data: created } = await supabase
        .from("plans").select("*").eq("creator_id", userId).order("date");
      setMine(created ?? []);

      const { data: parts } = await supabase
        .from("plan_participants").select("plan_id").eq("user_id", userId);
      const ids = (parts ?? []).map((p) => p.plan_id);
      if (ids.length) {
        const { data: ps } = await supabase
          .from("plans").select("*").in("id", ids).order("date");
        setJoined((ps ?? []).filter((p) => p.creator_id !== userId));
      } else setJoined([]);

      // Planes que vio pero no confirmo (recordatorio suave)
      const { data: views } = await supabase
        .from("plan_views")
        .select("plan_id, viewed_at")
        .eq("user_id", userId)
        .order("viewed_at", { ascending: false });

      const joinedIds = new Set(ids);
      const mineIds = new Set((created ?? []).map((p) => p.id));
      const seen = new Set<string>();
      const candidateIds: string[] = [];
      for (const v of views ?? []) {
        if (joinedIds.has(v.plan_id) || mineIds.has(v.plan_id) || seen.has(v.plan_id)) continue;
        seen.add(v.plan_id);
        candidateIds.push(v.plan_id);
      }
      if (candidateIds.length) {
        const today = new Date().toISOString().slice(0, 10);
        const { data: vplans } = await supabase.from("plans").select("*").in("id", candidateIds).gte("date", today);
        const { data: pp } = await supabase.from("plan_participants").select("plan_id")
          .in("plan_id", (vplans ?? []).map((p) => p.id));
        const counts = new Map<string, number>();
        (pp ?? []).forEach((r) => counts.set(r.plan_id, (counts.get(r.plan_id) ?? 0) + 1));
        const byId = new Map((vplans ?? []).map((p) => [p.id, p]));
        const ordered = candidateIds.map((cid) => byId.get(cid)).filter((p) => p !== undefined);
        setViewed(ordered.slice(0, 5).map((p) => ({ ...p, going: counts.get(p.id) ?? 0 } as ViewedPlan)));
      } else {
        setViewed([]);
      }
    })();
  }, [userId]);

  return (
    <div className="p-5">
      <h1 className="text-4xl text-center font-extrabold" style={{ color: "var(--ink)" }}>Mis planes</h1>

      {viewed.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>👀 Planes que viste</h2>
          <p className="text-[var(--ink)]/50 text-xs mb-2">Todavía puedes apuntarte</p>
          <div className="grid gap-2">
            {viewed.map((p) => (
              <Link key={p.id} to="/plan/$id" params={{ id: p.id }}
                className="flex items-center gap-3 rounded-xl px-3 py-2 bg-[var(--card)]"
                style={{ border: "1px solid var(--border)" }}>
                <span className="text-2xl">{categoryEmoji(p.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{p.title}</p>
                  <p className="text-xs text-[var(--ink)]/60">{formatDate(p.date)} · {p.time.slice(0, 5)}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full shrink-0" style={{ backgroundColor: "var(--muted)" }}>
                  {Math.max(p.max_people - p.going, 0)} plazas
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-2xl mb-2" style={{ color: "var(--ink)" }}>Organizo</h2>
        {mine.length === 0 ? (
          <p className="text-[var(--ink)]/80 text-sm">Aún no has colgado ningún plan.</p>
        ) : (
          <div className="grid gap-5">{mine.map((p, i) => <PlanRow key={p.id} plan={p} idx={i} />)}</div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-2xl mb-2" style={{ color: "var(--ink)" }}>Voy</h2>
        {joined.length === 0 ? (
          <p className="text-[var(--ink)]/80 text-sm">Aún no te has apuntado a ningún plan.</p>
        ) : (
          <div className="grid gap-5">{joined.map((p, i) => <PlanRow key={p.id} plan={p} idx={i} />)}</div>
        )}
      </section>
    </div>
  );
}

function PlanRow({ plan, idx }: { plan: Plan; idx: number }) {
  return (
    <Link to="/plan/$id" params={{ id: plan.id }}>
      <PaperNote category={plan.category} rotation={(idx % 2 === 0 ? -1 : 1.5)}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{categoryEmoji(plan.category)}</span>
          <div className="flex-1">
            <p className="text-xs opacity-70 uppercase tracking-wider">{categoryLabel(plan.category)}</p>
            <h3 className="text-2xl leading-tight">{plan.title}</h3>
            <p className="text-sm mt-1">{plan.location} · {formatDate(plan.date)} {plan.time.slice(0,5)}</p>
          </div>
        </div>
      </PaperNote>
    </Link>
  );
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}
