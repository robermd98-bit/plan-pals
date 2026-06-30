import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";
import { RubberButton } from "@/components/RubberButton";
import { CATEGORIES, type Category } from "@/lib/categories";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<Category[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle(c: Category) {
    setInterests((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  }

  function onFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      let avatar_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/avatar.${ext}`;
        const up = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
        if (up.error) throw up.error;
        const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
        avatar_url = signed?.signedUrl ?? null;
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          age: age === "" ? null : Number(age),
          city,
          bio,
          interests,
          avatar_url,
          onboarded: true,
        })
        .eq("id", userId);
      if (error) throw error;
      navigate({ to: "/" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Algo falló");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-center text-4xl mt-4" style={{ color: "#FFF8E7" }}>
        ¡Cuelga tu nota!
      </h1>
      <p className="text-center text-amber-50/90 -mt-1 mb-4">
        Cuéntanos de ti para empezar
      </p>

      <PaperNote category="culture" rotation={-1}>
        <form onSubmit={submit} className="flex flex-col gap-3 pt-1">
          <label className="flex flex-col items-center gap-2">
            <span className="text-xl">Tu foto</span>
            <div
              className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--ink)]/30 bg-white/50 flex items-center justify-center"
            >
              {preview ? (
                <img src={preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📷</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="text-xs" />
          </label>

          <input required placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)}
            className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2" />
          <div className="flex gap-2">
            <input required type="number" min={16} max={99} placeholder="Edad" value={age}
              onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
              className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 w-24" />
            <input required placeholder="Ciudad" value={city} onChange={(e) => setCity(e.target.value)}
              className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 flex-1" />
          </div>
          <textarea placeholder="Bio (opcional)" value={bio} onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2" />

          <div>
            <p className="text-xl mb-2">Tus intereses</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const on = interests.includes(c.id);
                return (
                  <button type="button" key={c.id} onClick={() => toggle(c.id)}
                    className="rubber-button text-sm"
                    style={{
                      backgroundColor: on ? "var(--pin)" : "#FFF8E7",
                      color: on ? "#FFF8E7" : "var(--ink)",
                    }}
                  >
                    {c.emoji} {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {err && <p className="text-red-700 text-sm text-center">{err}</p>}
          <RubberButton type="submit" disabled={loading || interests.length === 0}>
            {loading ? "…" : "Listo, al tablón"}
          </RubberButton>
        </form>
      </PaperNote>
    </div>
  );
}
