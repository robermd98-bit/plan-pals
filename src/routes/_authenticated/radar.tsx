import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CategoryIcon } from "@/components/CategoryIcon";
import { PulseRings } from "@/components/PaperNote";
import { cityFromLocation, locationMatchesCity } from "@/lib/geo";
import { ArrowLeft, Radar as RadarIcon } from "lucide-react";

type Plan = {
  id: string;
  category: string;
  title: string;
  location: string;
  date: string;
  time: string;
};

export const Route = createFileRoute("/_authenticated/radar")({
  component: Radar,
});

function Radar() {
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [myCity, setMyCity] = useState<string | null>(null);
  const [nearby, setNearby] = useState<Plan[]>([]);
  const [others, setOthers] = useState<Record<string, Plan[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: profile } = await supabase.from("profiles").select("city").eq("id", userId).maybeSingle();
      const city = profile?.city ?? "";
      setMyCity(city || null);

      const { data: joined } = await supabase.from("plan_participants").select("plan_id").eq("user_id", userId);
      const joinedIds = new Set((joined ?? []).map((j) => j.plan_id));

      const { data: plans } = await supabase
        .from("plans")
        .select("id, category, title, location, date, time")
        .neq("creator_id", userId)
        .gte("date", new Date().toISOString().slice(0, 10))
        .order("date", { ascending: true });

      const all = (plans ?? []).filter((p) => !joinedIds.has(p.id));
      const near = city ? all.filter((p) => locationMatchesCity(p.location, city)) : [];
      const far = city ? all.filter((p) => !locationMatchesCity(p.location, city)) : all;

      const grouped: Record<string, Plan[]> = {};
      far.forEach((p) => {
        const c = cityFromLocation(p.location);
        grouped[c] = grouped[c] ?? [];
        grouped[c].push(p);
      });

      setNearby(near);
      setOthers(grouped);
      setLoading(false);
    })();
  }, [userId]);

  return (
    <div className="p-5 max-w-md mx-auto pb-10">
      <button onClick={() => navigate({ to: "/" })} className="mb-3" style={{ color: "var(--ink)" }}>
        <ArrowLeft />
      </button>

      <div className="flex flex-col items-center mb-6">
        <motion.div
          className="relative flex items-center justify-center"
          style={{ width: 90, height: 90 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <PulseRings color="var(--pin)" rounded="rounded-full" expand={1.5} count={3} />
          <div className="rounded-full flex items-center justify-center" style={{ width: 60, height: 60, backgroundColor: "var(--pin)" }}>
            <RadarIcon size={30} color="var(--pin-foreground)" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-extrabold mt-3" style={{ color: "var(--ink)" }}>Radar</h1>
        <p className="text-center text-[var(--ink)]/60 text-sm mt-1">
          {myCity ? `Planes cerca de ti y en el resto de ciudades` : "Añade tu ciudad en el perfil para ver lo que tienes cerca"}
        </p>
      </div>

      {loading && <p className="text-center text-[var(--ink)]/50 text-sm">Buscando planes…</p>}

      {!loading && myCity && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--ink)" }}>🎯 En {myCity}</h2>
          {nearby.length === 0 ? (
            <p className="text-[var(--ink)]/50 text-sm">Todavía no hay planes en tu ciudad.</p>
          ) : (
            <div className="grid gap-2">
              {nearby.map((p) => <RadarRow key={p.id} plan={p} />)}
            </div>
          )}
        </section>
      )}

      {!loading && Object.keys(others).length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--ink)" }}>🌍 Otras ciudades</h2>
          <div className="flex flex-col gap-4">
            {Object.entries(others).map(([city, plans]) => (
              <div key={city}>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">{city}</p>
                <div className="grid gap-2">
                  {plans.map((p) => <RadarRow key={p.id} plan={p} />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RadarRow({ plan }: { plan: Plan }) {
  return (
    <Link
      to="/plan/$id"
      params={{ id: plan.id }}
      className="flex items-center gap-3 rounded-xl px-3 py-2 bg-[var(--card)]"
      style={{ border: "1px solid var(--border)" }}
    >
      <CategoryIcon category={plan.category} size={22} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{plan.title}</p>
        <p className="text-xs text-[var(--ink)]/60">{plan.location} · {plan.time.slice(0, 5)}</p>
      </div>
    </Link>
  );
}
