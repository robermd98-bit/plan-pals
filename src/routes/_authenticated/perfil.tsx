import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";
import { RubberButton } from "@/components/RubberButton";
import { Camera } from "lucide-react";
import { tierFor, nextTier } from "@/lib/tiers";

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
  const [uploading, setUploading] = useState(false);
  const [plansCount, setPlansCount] = useState(0);
  const [points, setPoints] = useState(0);

  async function load() {
    const { data } = await supabase.from("profiles")
      .select("id, name, age, city, bio, avatar_url, is_host, is_company, company_name")
      .eq("id", userId).maybeSingle();
    setP(data);
    setCompanyName(data?.company_name ?? "");

    const { count } = await supabase.from("plan_participants")
      .select("*", { count: "exact", head: true }).eq("user_id", userId);
    setPlansCount(count ?? 0);

    const { data: ledger } = await supabase.from("points_ledger").select("amount").eq("user_id", userId);
    setPoints((ledger ?? []).reduce((sum, r) => sum + r.amount, 0));
  }
  useEffect(() => { load(); }, [userId]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Elige un archivo de imagen (jpg, png…)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede pesar más de 5 MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${pub.publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
      await load();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`No se pudo subir la foto: ${msg}`);
    } finally {
      setUploading(false);
    }
  }

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

  if (!p) return <div className="p-5 text-[var(--ink)]">Cargando…</div>;

  return (
    <div className="p-5 max-w-md mx-auto space-y-4">
      <PaperNote category="idiomas" rotation={-1}>
        <div className="flex items-center gap-3">
          <div className="relative w-20 h-20 shrink-0">
            <label className="cursor-pointer block w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--ink)]/30 relative">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/70 flex items-center justify-center text-2xl">👤</div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-xs">…</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleAvatarChange}
              />
            </label>
            <span
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2"
              style={{ backgroundColor: "var(--pin)", borderColor: "#FFFFFF" }}
            >
              <Camera size={14} color="var(--pin-foreground)" />
            </span>
          </div>
          <div>
            <h1 className="text-3xl">{p.name}{p.age ? `, ${p.age}` : ""}</h1>
            <p className="text-sm">📍 {p.city}</p>
          </div>
        </div>
      </PaperNote>

      <PaperNote category="cultura" rotation={0.5}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-70">Tu nivel</p>
            <h2 className="text-2xl">{tierFor(plansCount).emoji} {tierFor(plansCount).label}</h2>
            <p className="text-sm mt-1 font-semibold" style={{ color: "var(--pin)" }}>
              {tierFor(plansCount).discount}% de descuento en planes oficiales
            </p>
            {nextTier(plansCount) && (
              <p className="text-xs mt-1 opacity-70">
                {nextTier(plansCount)!.min - plansCount} planes más para llegar a {nextTier(plansCount)!.label} ({nextTier(plansCount)!.discount}% dto)
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider opacity-70">Puntos</p>
            <p className="text-2xl font-bold">{points}</p>
          </div>
        </div>
        <Link to="/recompensas" className="rubber-button text-sm inline-block mt-3" style={{ backgroundColor: "var(--pin)", color: "var(--pin-foreground)" }}>
          🎁 Ver recompensas
        </Link>
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

      <button onClick={logout} className="block mx-auto text-[var(--ink)]/80 underline text-sm mt-6">
        Cerrar sesión
      </button>
    </div>
  );
}
