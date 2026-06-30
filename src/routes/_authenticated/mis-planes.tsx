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
};

export const Route = createFileRoute("/_authenticated/mis-planes")({
  component: MyPlans,
});

function MyPlans() {
  const { userId } = Route.useRouteContext();
  const [mine, setMine] = useState<Plan[]>([]);
  const [joined, setJoined] = useState<Plan[]>([]);

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
    })();
  }, [userId]);

  return (
    <div className="p-5">
      <h1 className="text-4xl text-center" style={{ color: "#FFF8E7" }}>Mis planes</h1>

      <section className="mt-5">
        <h2 className="text-2xl mb-2" style={{ color: "#FFF8E7" }}>Organizo</h2>
        {mine.length === 0 ? (
          <p className="text-amber-50/80 text-sm">Aún no has colgado ningún plan.</p>
        ) : (
          <div className="grid gap-5">{mine.map((p, i) => <PlanRow key={p.id} plan={p} idx={i} />)}</div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-2xl mb-2" style={{ color: "#FFF8E7" }}>Voy</h2>
        {joined.length === 0 ? (
          <p className="text-amber-50/80 text-sm">Aún no te has apuntado a ningún plan.</p>
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
