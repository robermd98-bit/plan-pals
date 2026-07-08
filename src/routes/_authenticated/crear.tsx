import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";
import { RubberButton } from "@/components/RubberButton";
import { CATEGORIES, type Category } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";

export const Route = createFileRoute("/_authenticated/crear")({
  component: CreatePlan,
});

function CreatePlan() {
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category>("social");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxPeople, setMaxPeople] = useState(6);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("plans")
        .insert({
          creator_id: userId,
          category,
          title,
          description,
          location,
          date,
          time,
          max_people: maxPeople,
        })
        .select("id")
        .single();
      if (error) throw error;
      await supabase.from("plan_participants").insert({ plan_id: data.id, user_id: userId });
      navigate({ to: "/plan/$id", params: { id: data.id } });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Algo salió mal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-4xl text-center font-extrabold" style={{ color: "var(--ink)" }}>Cuelga un plan</h1>
      <PaperNote category={category} rotation={-1} className="mt-4">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <p className="text-lg mb-1">Categoría</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button type="button" key={c.id} onClick={() => setCategory(c.id)}
                  className="rubber-button text-sm inline-flex items-center gap-1.5"
                  style={{
                    backgroundColor: category === c.id ? "var(--pin)" : "#FFFFFF",
                    color: category === c.id ? "var(--pin-foreground)" : "var(--ink)",
                  }}>
                  <CategoryIcon category={c.id} size={15} tinted={category !== c.id} /> {c.label}
                </button>
              ))}
            </div>
          </div>

          <input required placeholder="Título (ej. partido de fútbol)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
            className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2" />
          <textarea required placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500}
            className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2" />
          <input required placeholder="Lugar" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={120}
            className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2" />
          <div className="flex gap-2">
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0,10)}
              className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 flex-1" />
            <input required type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2" />
          </div>
          <label className="flex items-center gap-3">
            <span>Aforo máximo:</span>
            <input type="number" min={2} max={50} value={maxPeople} onChange={(e) => setMaxPeople(Number(e.target.value))}
              className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 w-20" />
          </label>
          {err && <p className="text-red-700 text-sm text-center">{err}</p>}
          <RubberButton type="submit" disabled={loading}>{loading ? "…" : "Pinchar en el tablón"}</RubberButton>
        </form>
      </PaperNote>
    </div>
  );
}
