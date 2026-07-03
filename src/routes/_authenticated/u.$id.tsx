import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";

export const Route = createFileRoute("/_authenticated/u/$id")({
  component: ProfilePage,
});

type Profile = {
  id: string; name: string; age: number | null; city: string | null; bio: string | null;
  avatar_url: string | null; interests: string[];
};

function ProfilePage() {
  const { id } = Route.useParams();
  const [p, setP] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles")
        .select("id, name, age, city, bio, avatar_url, interests").eq("id", id).maybeSingle();
      setP(data);
    })();
  }, [id]);

  if (!p) return <div className="p-5 text-[var(--ink)]">Cargando…</div>;

  return (
    <div className="p-5 max-w-md mx-auto">
      <PaperNote category="idiomas" rotation={-2}>
        <div className="flex flex-col items-center gap-3">
          {p.avatar_url ? (
            <img src={p.avatar_url} alt="" className="w-40 h-40 rounded-full object-cover border-4 border-[var(--ink)]/30" />
          ) : (
            <div className="w-40 h-40 rounded-full bg-white/70 flex items-center justify-center text-5xl">👤</div>
          )}
          <h1 className="text-4xl">{p.name}{p.age ? `, ${p.age}` : ""}</h1>
          {p.city && <p className="text-base">📍 {p.city}</p>}
          {p.bio && <p className="text-center text-sm mt-1">{p.bio}</p>}
          {p.interests?.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {p.interests.map((i) => (
                <span key={i} className="rubber-button text-xs" style={{ backgroundColor: "#FFFFFF", color: "var(--ink)" }}>
                  {i}
                </span>
              ))}
            </div>
          )}
        </div>
      </PaperNote>
    </div>
  );
}
