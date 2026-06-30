import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";
import { RubberButton } from "@/components/RubberButton";

type Activity = {
  id: string; company_name: string; title: string; description: string;
  category: string; commission_per_person: number; suggested_location: string | null; suggested_max: number;
};

type EarningRow = { title: string; company_name: string; participants: number; commission: number; total: number };

export const Route = createFileRoute("/_authenticated/anfitrion")({
  component: HostPage,
});

function HostPage() {
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [isHost, setIsHost] = useState<boolean | null>(null);
  const [catalog, setCatalog] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxPeople, setMaxPeople] = useState(8);
  const [earnings, setEarnings] = useState<EarningRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("is_host").eq("id", userId).maybeSingle();
      setIsHost(!!prof?.is_host);
      const { data: cat } = await supabase.from("activities_catalog").select("*").order("title");
      setCatalog(cat ?? []);
      await loadEarnings();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadEarnings() {
    const { data: plans } = await supabase.from("plans")
      .select("id, title, company_name, commission_per_person").eq("host_id", userId).eq("is_hosted", true);
    if (!plans || plans.length === 0) { setEarnings([]); return; }
    const { data: pp } = await supabase.from("plan_participants").select("plan_id, user_id").in("plan_id", plans.map((p) => p.id));
    const counts = new Map<string, number>();
    (pp ?? []).forEach((r) => {
      if (r.user_id !== userId) counts.set(r.plan_id, (counts.get(r.plan_id) ?? 0) + 1);
    });
    setEarnings(plans.map((p) => {
      const n = counts.get(p.id) ?? 0;
      const comm = Number(p.commission_per_person ?? 0);
      return { title: p.title, company_name: p.company_name ?? "", participants: n, commission: comm, total: n * comm };
    }));
  }

  function openActivity(a: Activity) {
    setSelected(a);
    setLocation(a.suggested_location ?? "");
    setMaxPeople(a.suggested_max);
    setDate(""); setTime("");
  }

  async function publish() {
    if (!selected || !date || !time) return;
    const { data, error } = await supabase.from("plans").insert({
      creator_id: userId,
      host_id: userId,
      category: selected.category,
      title: selected.title,
      description: selected.description,
      location,
      date,
      time,
      max_people: maxPeople,
      is_hosted: true,
      activity_id: selected.id,
      company_name: selected.company_name,
      commission_per_person: selected.commission_per_person,
    }).select("id").single();
    if (error) return;
    await supabase.from("plan_participants").insert({ plan_id: data.id, user_id: userId });
    setSelected(null);
    navigate({ to: "/plan/$id", params: { id: data.id } });
  }

  if (isHost === null) return <div className="p-5 text-amber-50">Cargando…</div>;

  if (!isHost) {
    return (
      <div className="p-5 max-w-md mx-auto">
        <PaperNote category="deporte" rotation={-1}>
          <h1 className="text-3xl">🌟 Sé anfitrión</h1>
          <p className="text-sm mt-2">
            Organiza actividades oficiales de empresas colaboradoras y cobra una comisión por persona que se apunte.
            Actívalo en tu perfil.
          </p>
          <div className="mt-3"><RubberButton onClick={() => navigate({ to: "/perfil" })}>Ir al perfil</RubberButton></div>
        </PaperNote>
      </div>
    );
  }

  const totalEarned = earnings.reduce((s, e) => s + e.total, 0);

  return (
    <div className="p-5 max-w-md mx-auto space-y-5">
      <h1 className="text-4xl text-center" style={{ color: "#FFF8E7" }}>Panel anfitrión</h1>

      <PaperNote category="aire_libre" rotation={-1}>
        <p className="text-sm uppercase tracking-wider opacity-70">Comisiones acumuladas</p>
        <p className="text-5xl mt-1">{totalEarned.toFixed(2)} €</p>
        {earnings.length === 0 && <p className="text-sm mt-2 opacity-80">Aún no has organizado planes oficiales.</p>}
        {earnings.length > 0 && (
          <div className="mt-3 space-y-2">
            {earnings.map((e, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-[var(--ink)]/20 pb-1">
                <div>
                  <p className="font-bold">{e.title}</p>
                  <p className="opacity-70 text-xs">{e.company_name} · {e.participants} × {e.commission.toFixed(2)} €</p>
                </div>
                <p className="font-bold">{e.total.toFixed(2)} €</p>
              </div>
            ))}
          </div>
        )}
      </PaperNote>

      <div>
        <h2 className="text-2xl text-center" style={{ color: "#FFF8E7" }}>Catálogo de actividades</h2>
        <div className="grid gap-5 mt-3">
          {catalog.map((a, i) => (
            <PaperNote key={a.id} category={a.category} rotation={i % 2 === 0 ? -1 : 1}>
              <p className="text-xs opacity-70 uppercase tracking-wider">{a.company_name}</p>
              <h3 className="text-2xl">{a.title}</h3>
              <p className="text-sm mt-1">{a.description}</p>
              <p className="text-sm mt-2"><strong>{a.commission_per_person.toFixed(2)} €</strong> por persona apuntada</p>
              <div className="mt-3"><RubberButton onClick={() => openActivity(a)}>Organizar</RubberButton></div>
            </PaperNote>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-4" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
            <PaperNote category={selected.category} rotation={0}>
              <h2 className="text-3xl">{selected.title}</h2>
              <p className="text-sm mt-1">{selected.company_name}</p>
              <div className="flex flex-col gap-2 mt-3">
                <input placeholder="Lugar" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2" />
                <div className="flex gap-2">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0,10)}
                    className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 flex-1" />
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                    className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2" />
                </div>
                <label className="flex items-center gap-2">Aforo:
                  <input type="number" min={2} max={50} value={maxPeople} onChange={(e) => setMaxPeople(Number(e.target.value))}
                    className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 w-20" />
                </label>
                <div className="flex justify-end gap-2 mt-2">
                  <RubberButton tone="paper" onClick={() => setSelected(null)}>Cancelar</RubberButton>
                  <RubberButton onClick={publish}>Publicar</RubberButton>
                </div>
              </div>
            </PaperNote>
          </div>
        </div>
      )}
    </div>
  );
}
