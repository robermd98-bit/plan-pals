import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";
import { RubberButton } from "@/components/RubberButton";
import { CATEGORIES, categoryLabel, paperColor, type Category } from "@/lib/categories";
import { Calendar, MapPin, Users, Heart, X } from "lucide-react";

type Plan = {
  id: string;
  creator_id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  max_people: number;
  is_hosted: boolean;
  company_name: string | null;
  creator?: { name: string; avatar_url: string | null } | null;
  going?: number;
  attendees?: { name: string; avatar_url: string | null }[];
};

type Ad = { id: string; company_name: string; title: string; message: string; kind: "ad" };
type FeedItem = (Plan & { kind: "plan" }) | Ad;

export const Route = createFileRoute("/_authenticated/")({
  component: Discover,
});

function Discover() {
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Category | "all">("all");
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function load() {
    // joined plan ids to exclude
    const { data: joined } = await supabase
      .from("plan_participants")
      .select("plan_id")
      .eq("user_id", userId);
    const joinedIds = new Set((joined ?? []).map((j) => j.plan_id));

    let q = supabase
      .from("plans")
      .select("*")
      .neq("creator_id", userId)
      .gte("date", new Date().toISOString().slice(0, 10))
      .order("date", { ascending: true });
    if (filter !== "all") q = q.eq("category", filter);
    const { data: plans } = await q;
    const filtered = (plans ?? []).filter((p) => !joinedIds.has(p.id));

    // creators
    const ids = Array.from(new Set(filtered.map((p) => p.creator_id)));
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("id, name, avatar_url").in("id", ids)
      : { data: [] as { id: string; name: string; avatar_url: string | null }[] };
    const pmap = new Map((profs ?? []).map((p) => [p.id, p]));

    // counts + attendee sample for avatar stack
    const counts = new Map<string, number>();
    const attendeeIdsByPlan = new Map<string, string[]>();
    if (filtered.length) {
      const { data: pp } = await supabase
        .from("plan_participants")
        .select("plan_id, user_id")
        .in("plan_id", filtered.map((f) => f.id));
      (pp ?? []).forEach((r) => {
        counts.set(r.plan_id, (counts.get(r.plan_id) ?? 0) + 1);
        const arr = attendeeIdsByPlan.get(r.plan_id) ?? [];
        if (arr.length < 4) arr.push(r.user_id);
        attendeeIdsByPlan.set(r.plan_id, arr);
      });
    }
    const attendeeIds = Array.from(new Set(Array.from(attendeeIdsByPlan.values()).flat()));
    const { data: attendeeProfs } = attendeeIds.length
      ? await supabase.from("profiles").select("id, name, avatar_url").in("id", attendeeIds)
      : { data: [] as { id: string; name: string; avatar_url: string | null }[] };
    const attendeeMap = new Map((attendeeProfs ?? []).map((p) => [p.id, p]));

    const planItems: FeedItem[] = filtered.map((p) => ({
      ...p,
      kind: "plan" as const,
      creator: pmap.get(p.creator_id) ?? null,
      going: counts.get(p.id) ?? 0,
      attendees: (attendeeIdsByPlan.get(p.id) ?? [])
        .map((uid) => attendeeMap.get(uid))
        .filter((p): p is { id: string; name: string; avatar_url: string | null } => !!p)
        .map((p) => ({ name: p.name, avatar_url: p.avatar_url })),
    }));

    // intercalar anuncios cada ~7 cartas
    const { data: ads } = await supabase.from("ads").select("*").order("created_at", { ascending: false }).limit(5);
    const adItems: Ad[] = (ads ?? []).map((a) => ({
      id: a.id,
      company_name: a.company_name,
      title: a.title,
      message: a.message,
      kind: "ad" as const,
    }));

    const result: FeedItem[] = [];
    let adIdx = 0;
    planItems.forEach((p, i) => {
      result.push(p);
      if ((i + 1) % 7 === 0 && adItems[adIdx]) {
        result.push(adItems[adIdx]);
        adIdx++;
      }
    });
    setItems(result);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleAction(item: FeedItem, action: "join" | "skip") {
    if (confirmingId) return; // evita doble toque mientras se confirma
    if (item.kind === "ad") {
      await supabase.rpc("increment_ad_impression", { ad_id: item.id });
      setItems((prev) => prev?.slice(1) ?? null);
      return;
    }
    if (action === "join") {
      setConfirmingId(item.id);
      const insertPromise = supabase.from("plan_participants").insert({ plan_id: item.id, user_id: userId });
      await Promise.all([insertPromise, new Promise((r) => setTimeout(r, 1000))]);
      navigate({ to: "/plan/$id", params: { id: item.id } });
      return;
    }
    setItems((prev) => prev?.slice(1) ?? null);
  }

  return (
    <div className="px-4 pt-6">
      <header className="flex items-baseline justify-between mb-3">
        <h1 className="text-4xl" style={{ color: "#FFF8E7" }}>El tablón</h1>
        <span className="text-amber-50/80 text-sm" style={{ fontFamily: "var(--font-hand)", fontSize: 18 }}>
          desliza para apuntarte
        </span>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="Todo" emoji="✨" />
        {CATEGORIES.map((c) => (
          <FilterChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} label={c.label} emoji={c.emoji} tint={c.paperVar} />
        ))}
      </div>

      <div className="relative h-[520px] mt-3">
        {items && items.length > 0 && items[0].kind === "plan" && (
          <div
            className="absolute inset-x-8 top-10 h-[460px] rounded-full blur-3xl opacity-50 pointer-events-none"
            style={{ backgroundColor: paperColor(items[0].category), zIndex: 0 }}
          />
        )}
        {items === null && (
          <p className="text-center text-amber-50/80 mt-20">Cargando planes…</p>
        )}
        {items !== null && items.length === 0 && (
          <div className="flex flex-col items-center mt-10 gap-4">
            <PaperNote category="aire_libre" rotation={-3} className="max-w-xs">
              <h2 className="text-3xl text-center">¡El tablón está vacío!</h2>
              <p className="text-center mt-2">No quedan planes que descubrir. ¿Y si propones tú uno?</p>
            </PaperNote>
            <RubberButton onClick={() => navigate({ to: "/crear" })}>Crear un plan</RubberButton>
          </div>
        )}
        <AnimatePresence>
          {items?.slice(0, 3).reverse().map((it, idx, arr) => {
            const isTop = idx === arr.length - 1;
            return (
              <SwipeCard
                key={it.id}
                item={it}
                isTop={isTop}
                stackIndex={arr.length - 1 - idx}
                onSwipe={(action) => handleAction(it, action)}
                confirming={isTop && it.id === confirmingId}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {items && items.length > 0 && items[0].kind === "plan" && (
        <div className="flex justify-center gap-6 mt-4">
          <RubberButton tone="paper" disabled={!!confirmingId} onClick={() => handleAction(items[0], "skip")}>
            <X className="inline -mt-1" size={20} /> Paso
          </RubberButton>
          <RubberButton disabled={!!confirmingId} onClick={() => handleAction(items[0], "join")}>
            <Heart className="inline -mt-1" size={20} /> Me apunto
          </RubberButton>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label, emoji, tint }: { active: boolean; onClick: () => void; label: string; emoji: string; tint?: string }) {
  const activeBg = tint ?? "var(--pin)";
  const activeFg = tint ? "var(--ink)" : "#FFF8E7";
  return (
    <button
      onClick={onClick}
      className="rubber-button shrink-0 text-sm"
      style={{
        backgroundColor: active ? activeBg : "#FFF8E7",
        color: active ? activeFg : "var(--ink)",
      }}
    >
      {emoji} {label}
    </button>
  );
}

function SwipeCard({
  item,
  isTop,
  stackIndex,
  onSwipe,
  confirming = false,
}: {
  item: FeedItem;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (action: "join" | "skip") => void;
  confirming?: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-220, -120, 0, 120, 220], [0, 1, 1, 1, 0]);

  return (
    <motion.div
      className="absolute inset-x-2 top-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        zIndex: 10 - stackIndex,
        scale: 1 - stackIndex * 0.04,
        y: stackIndex * 10,
      }}
      drag={isTop && !confirming ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onSwipe("join");
        else if (info.offset.x < -120) onSwipe("skip");
      }}
    >
      {item.kind === "ad" ? <AdCard ad={item} /> : <PlanCard plan={item} confirming={confirming} />}
    </motion.div>
  );
}

function PlanCard({ plan, confirming = false }: { plan: Plan & { kind: "plan" }; confirming?: boolean }) {
  return (
    <PaperNote
      category={plan.category}
      rotation={-1.5}
      className="h-[500px] flex flex-col"
      attendees={plan.attendees}
      attendeesTotal={plan.going}
      confirming={confirming}
      confirmLabel="💌 ¡Apuntado!"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold uppercase tracking-[0.15em] opacity-70">
          {categoryLabel(plan.category)}
        </span>
        {plan.is_hosted && (
          <span className="text-sm bg-[var(--ink)] text-amber-50 px-2 py-0.5 rounded-full">
            🌟 Oficial
          </span>
        )}
      </div>
      <h2 className="text-[2.75rem] leading-[1.05]">{plan.title}</h2>
      <p className="mt-3 text-base flex-1 overflow-hidden">{plan.description}</p>

      <div className="mt-3 space-y-1.5 text-sm">
        <p className="flex items-center gap-2"><MapPin size={16} /> {plan.location}</p>
        <p className="flex items-center gap-2">
          <Calendar size={16} /> {formatDate(plan.date)} · {plan.time.slice(0, 5)}
        </p>
        <p className="flex items-center gap-2"><Users size={16} /> {plan.going ?? 0}/{plan.max_people} apuntados</p>
      </div>

      <div className="mt-3 pt-3 border-t-2 border-dashed border-[var(--ink)]/30 flex items-center gap-2">
        {plan.creator?.avatar_url ? (
          <img src={plan.creator.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-[var(--ink)]/30" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">👤</div>
        )}
        <span className="text-sm">
          por <strong style={{ fontFamily: "var(--font-hand)", fontSize: 22 }}>{plan.creator?.name ?? "alguien"}</strong>
        </span>
      </div>
    </PaperNote>
  );
}

function AdCard({ ad }: { ad: Ad }) {
  return (
    <PaperNote category="cultura" rotation={1.5} className="h-[500px] flex flex-col justify-center text-center">
      <span className="text-xs uppercase tracking-widest opacity-70">Anuncio</span>
      <h2 className="text-5xl mt-2">{ad.title}</h2>
      <p className="mt-4 text-lg">{ad.message}</p>
      <p className="mt-6 text-sm">— {ad.company_name}</p>
    </PaperNote>
  );
}

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
}
