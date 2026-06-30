import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";
import { RubberButton } from "@/components/RubberButton";

type Profile = {
  id: string; name: string; age: number | null; city: string | null; bio: string | null;
  avatar_url: string | null; is_host: boolean; is_company: boolean; company_name: string | null;
};

export const Route = createFileRoute("/_authenticated/perfil")({
  component: ProfilePage,
});

function ProfilePage() {
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [p, setP] = useState<Profile | null>(null);
  const [companyName, setCompanyName] = useState("");

  async function load() {
    const { data } = await supabase.from("profiles")
      .select("id, name, age, city, bio, avatar_url, is_host, is_company, company_name")
      .eq("id", userId).maybeSingle();
    setP(data);
    setCompanyName(data?.company_name ?? "");
  }
  useEffect(() => { load(); }, [userId]);

  async function toggleHost() {
    if (!p) return;
    await supabase.from("profiles").update({ is_host: !p.is_host }).eq("id", userId);
    load();
  }
  async function toggleCompany() {
    if (!p) return;
    if (!p.is_company && !companyName.trim()) return;
    await supabase.from("profiles")
      .update({ is_company: !p.is_company, company_name: !p.is_company ? companyName.trim() : null })
      .eq("id", userId);
    load();
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (!p) return <div className="p-5 text-amber-50">Cargando…</div>;

  return (
    <div className="p-5 max-w-md mx-auto space-y-4">
      <PaperNote category="idiomas" rotation={-1}>
        <div className="flex items-center gap-3">
          {p.avatar_url ? (
            <img src={p.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-[var(--ink)]/30" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/70 flex items-center justify-center text-2xl">👤</div>
          )}
          <div>
            <h1 className="text-3xl">{p.name}{p.age ? `, ${p.age}` : ""}</h1>
            <p className="text-sm">📍 {p.city}</p>
          </div>
        </div>
      </PaperNote>

      <PaperNote category="deporte" rotation={1}>
        <h2 className="text-2xl">🌟 Modo Anfitrión</h2>
        <p className="text-sm mt-1">Organiza planes oficiales con empresas colaboradoras y cobra comisión.</p>
        <div className="mt-3">
          <RubberButton tone={p.is_host ? "primary" : "paper"} onClick={toggleHost}>
            {p.is_host ? "Activado" : "Activar"}
          </RubberButton>
        </div>
      </PaperNote>

      <PaperNote category="aire_libre" rotation={-1.5}>
        <h2 className="text-2xl">🏢 Modo Empresa</h2>
        <p className="text-sm mt-1">Encuentra anfitriones, valóralos y publica anuncios.</p>
        {!p.is_company && (
          <input
            placeholder="Nombre de tu negocio"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 mt-2 w-full"
          />
        )}
        {p.is_company && <p className="text-sm mt-2">como <strong>{p.company_name}</strong></p>}
        <div className="mt-3">
          <RubberButton tone={p.is_company ? "primary" : "paper"} onClick={toggleCompany}>
            {p.is_company ? "Activado" : "Activar"}
          </RubberButton>
        </div>
      </PaperNote>

      {p.is_company && (
        <RubberButton tone="paper" onClick={() => navigate({ to: "/empresa" })} className="w-full">
          → Ir al panel de empresa
        </RubberButton>
      )}

      <button onClick={logout} className="block mx-auto text-amber-50/80 underline text-sm mt-6">
        Cerrar sesión
      </button>
    </div>
  );
}
