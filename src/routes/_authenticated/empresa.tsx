import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";
import { RubberButton } from "@/components/RubberButton";

type HostRow = {
  id: string; name: string; avatar_url: string | null;
  avg_rating: number; reviews_count: number; traffic: number; plans_count: number;
};

type Review = { id: string; rating: number; comment: string | null; created_at: string; company_id: string; company_name: string | null };

export const Route = createFileRoute("/_authenticated/empresa")({
  component: CompanyPage,
});

function CompanyPage() {
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ is_company: boolean; company_name: string | null } | null>(null);
  const [hosts, setHosts] = useState<HostRow[]>([]);
  const [openHost, setOpenHost] = useState<HostRow | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tab, setTab] = useState<"directory" | "ads">("directory");
  const [ads, setAds] = useState<{ id: string; title: string; message: string; impressions: number }[]>([]);
  const [adTitle, setAdTitle] = useState("");
  const [adMsg, setAdMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("is_company, company_name").eq("id", userId).maybeSingle();
      setProfile(prof);
      if (!prof?.is_company) return;
      await loadHosts();
      await loadAds();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadHosts() {
    const { data: profs } = await supabase.from("profiles").select("id, name, avatar_url").eq("is_host", true);
    if (!profs) return;
    const ids = profs.map((p) => p.id);
    if (ids.length === 0) { setHosts([]); return; }
    const { data: revs } = await supabase.from("host_reviews").select("host_id, rating").in("host_id", ids);
    const { data: plans } = await supabase.from("plans").select("id, host_id").in("host_id", ids).eq("is_hosted", true);
    const planIds = (plans ?? []).map((p) => p.id);
    const { data: pp } = planIds.length
      ? await supabase.from("plan_participants").select("plan_id").in("plan_id", planIds)
      : { data: [] as { plan_id: string }[] };
    const planToHost = new Map((plans ?? []).map((p) => [p.id, p.host_id]));

    const rows: HostRow[] = profs.map((pr) => {
      const myRevs = (revs ?? []).filter((r) => r.host_id === pr.id);
      const myPlans = (plans ?? []).filter((p) => p.host_id === pr.id);
      const myTraffic = (pp ?? []).filter((r) => planToHost.get(r.plan_id) === pr.id).length;
      const avg = myRevs.length ? myRevs.reduce((s, r) => s + r.rating, 0) / myRevs.length : 0;
      return {
        id: pr.id, name: pr.name, avatar_url: pr.avatar_url,
        avg_rating: avg, reviews_count: myRevs.length, traffic: myTraffic, plans_count: myPlans.length,
      };
    }).sort((a, b) => b.avg_rating - a.avg_rating || b.reviews_count - a.reviews_count);
    setHosts(rows);
  }

  async function openHostCard(h: HostRow) {
    setOpenHost(h);
    const { data: revs } = await supabase.from("host_reviews").select("*").eq("host_id", h.id).order("created_at", { ascending: false });
    const cIds = Array.from(new Set((revs ?? []).map((r) => r.company_id)));
    const { data: comps } = cIds.length
      ? await supabase.from("profiles").select("id, company_name").in("id", cIds)
      : { data: [] as { id: string; company_name: string | null }[] };
    const cmap = new Map((comps ?? []).map((c) => [c.id, c.company_name]));
    setReviews((revs ?? []).map((r) => ({ ...r, company_name: cmap.get(r.company_id) ?? "Empresa" })));
  }

  async function submitReview() {
    if (!openHost) return;
    await supabase.from("host_reviews").insert({
      host_id: openHost.id, company_id: userId, rating, comment: comment.trim() || null,
    });
    setComment(""); setRating(5);
    await openHostCard(openHost);
    await loadHosts();
  }

  async function loadAds() {
    const { data } = await supabase.from("ads").select("id, title, message, impressions").eq("advertiser_id", userId).order("created_at", { ascending: false });
    setAds(data ?? []);
  }

  async function createAd() {
    if (!profile?.company_name || !adTitle.trim() || !adMsg.trim()) return;
    await supabase.from("ads").insert({
      advertiser_id: userId, company_name: profile.company_name, title: adTitle.trim(), message: adMsg.trim(),
    });
    setAdTitle(""); setAdMsg("");
    await loadAds();
  }

  if (profile === null) return <div className="p-5 text-[var(--ink)]">Cargando…</div>;
  if (!profile.is_company) {
    return (
      <div className="p-5 max-w-md mx-auto">
        <PaperNote category="aire_libre" rotation={-1}>
          <h1 className="text-3xl">🏢 Modo empresa</h1>
          <p className="text-sm mt-2">Actívalo desde tu perfil para acceder al directorio de anfitriones y publicar anuncios.</p>
          <div className="mt-3"><RubberButton onClick={() => navigate({ to: "/perfil" })}>Ir al perfil</RubberButton></div>
        </PaperNote>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-md mx-auto space-y-4">
      <h1 className="text-4xl text-center" style={{ color: "var(--ink)" }}>{profile.company_name}</h1>

      <div className="flex gap-2 justify-center">
        <RubberButton tone={tab === "directory" ? "primary" : "paper"} onClick={() => setTab("directory")}>Anfitriones</RubberButton>
        <RubberButton tone={tab === "ads" ? "primary" : "paper"} onClick={() => setTab("ads")}>Anuncios</RubberButton>
      </div>

      {tab === "directory" && (
        <div className="grid gap-4">
          {hosts.length === 0 && <p className="text-[var(--ink)]/80 text-center">Todavía no hay anfitriones.</p>}
          {hosts.map((h, i) => (
            <PaperNote key={h.id} category="idiomas" rotation={i % 2 === 0 ? -1 : 1} onClick={() => openHostCard(h)}>
              <div className="flex items-center gap-3">
                {h.avatar_url ? (
                  <img src={h.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-[var(--ink)]/30" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white/70 flex items-center justify-center">👤</div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl leading-tight">{h.name}</h3>
                  <p className="text-sm">⭐ {h.avg_rating.toFixed(1)} ({h.reviews_count}) · 👥 {h.traffic} · 📌 {h.plans_count} planes</p>
                </div>
              </div>
            </PaperNote>
          ))}
        </div>
      )}

      {tab === "ads" && (
        <div className="space-y-4">
          <PaperNote category="cultura" rotation={-1}>
            <h2 className="text-2xl">Nuevo anuncio</h2>
            <input placeholder="Título" value={adTitle} onChange={(e) => setAdTitle(e.target.value)} maxLength={60}
              className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 w-full mt-2" />
            <textarea placeholder="Mensaje" value={adMsg} onChange={(e) => setAdMsg(e.target.value)} rows={3} maxLength={200}
              className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 w-full mt-2" />
            <div className="mt-2"><RubberButton onClick={createAd}>Publicar anuncio</RubberButton></div>
          </PaperNote>

          <h2 className="text-2xl text-center" style={{ color: "var(--ink)" }}>Tus anuncios</h2>
          {ads.length === 0 && <p className="text-[var(--ink)]/80 text-center text-sm">Aún no has publicado nada.</p>}
          {ads.map((a, i) => (
            <PaperNote key={a.id} category="social" rotation={i % 2 === 0 ? 1 : -1}>
              <h3 className="text-2xl">{a.title}</h3>
              <p className="text-sm mt-1">{a.message}</p>
              <p className="text-xs opacity-70 mt-2">👁 {a.impressions} impresiones</p>
            </PaperNote>
          ))}
        </div>
      )}

      {openHost && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setOpenHost(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[85vh] overflow-y-auto">
            <PaperNote category="idiomas" rotation={0}>
              <div className="flex items-center gap-3">
                {openHost.avatar_url ? (
                  <img src={openHost.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center">👤</div>
                )}
                <div>
                  <h2 className="text-2xl">{openHost.name}</h2>
                  <p className="text-sm">⭐ {openHost.avg_rating.toFixed(1)} ({openHost.reviews_count})</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl">Tu reseña</h3>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} className="text-2xl">
                      {n <= rating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
                <textarea placeholder="Comentario (opcional)" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={300}
                  className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 w-full mt-2" />
                <div className="mt-2"><RubberButton onClick={submitReview}>Enviar reseña</RubberButton></div>
              </div>

              <div className="mt-5">
                <h3 className="text-xl">Reseñas</h3>
                {reviews.length === 0 && <p className="text-sm opacity-70 mt-1">Aún no hay reseñas.</p>}
                <div className="space-y-2 mt-2">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-[var(--ink)]/20 pb-2">
                      <p className="text-sm"><strong>{r.company_name}</strong> · {"★".repeat(r.rating)}</p>
                      {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </PaperNote>
          </div>
        </div>
      )}
    </div>
  );
}
