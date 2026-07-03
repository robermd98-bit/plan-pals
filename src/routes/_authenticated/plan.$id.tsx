import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";
import { RubberButton } from "@/components/RubberButton";
import { categoryEmoji, categoryLabel } from "@/lib/categories";
import { randomIcebreaker } from "@/lib/icebreakers";
import { joinPlan, JOIN_SYSTEM_MARK } from "@/lib/joinPlan";
import { ArrowLeft, Send } from "lucide-react";

type Plan = {
  id: string; creator_id: string; category: string; title: string; description: string;
  location: string; date: string; time: string; max_people: number; is_hosted: boolean; company_name: string | null;
};
type Profile = { id: string; name: string; avatar_url: string | null };
type Message = { id: string; sender_id: string; text: string; created_at: string };

export const Route = createFileRoute("/_authenticated/plan/$id")({
  component: PlanDetail,
});

function PlanDetail() {
  const { id } = Route.useParams();
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [participants, setParticipants] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [joined, setJoined] = useState(false);
  const [icebreaker, setIcebreaker] = useState(randomIcebreaker);

  useEffect(() => {
    setIcebreaker(randomIcebreaker());
  }, [id]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("plans").select("*").eq("id", id).maybeSingle();
      setPlan(p);

      const { data: parts } = await supabase.from("plan_participants").select("user_id").eq("plan_id", id);
      const userIds = Array.from(new Set([...(parts ?? []).map((x) => x.user_id), ...(p ? [p.creator_id] : [])]));
      setJoined((parts ?? []).some((x) => x.user_id === userId) || p?.creator_id === userId);
      if (userIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id, name, avatar_url").in("id", userIds);
        setParticipants(profs ?? []);
      }
      const { data: msgs } = await supabase.from("messages").select("*").eq("plan_id", id).order("created_at");
      setMessages(msgs ?? []);
    })();
  }, [id, userId]);

  // realtime
  useEffect(() => {
    const ch = supabase
      .channel(`plan-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `plan_id=eq.${id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]))
      .on("postgres_changes", { event: "*", schema: "public", table: "plan_participants", filter: `plan_id=eq.${id}` },
        async () => {
          const { data: parts } = await supabase.from("plan_participants").select("user_id").eq("plan_id", id);
          const ids = (parts ?? []).map((x) => x.user_id);
          if (ids.length) {
            const { data: profs } = await supabase.from("profiles").select("id, name, avatar_url").in("id", ids);
            setParticipants(profs ?? []);
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const t = text.trim();
    setText("");
    await supabase.from("messages").insert({ plan_id: id, sender_id: userId, text: t });
  }

  async function join() {
    await joinPlan(id, userId);
    setJoined(true);
  }

  if (!plan) return <div className="p-5 text-[var(--ink)]">Cargando…</div>;

  return (
    <div className="flex flex-col h-screen pb-24">
      <header className="px-4 pt-5 pb-2 flex items-center gap-2">
        <button onClick={() => navigate({ to: "/mis-planes" })} className="text-[var(--ink)]">
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>{categoryEmoji(plan.category)} {categoryLabel(plan.category)}</h1>
      </header>

      <div className="px-4">
        <PaperNote category={plan.category} rotation={-1}>
          <h2 className="text-3xl">{plan.title}</h2>
          <p className="text-sm mt-2">{plan.description}</p>
          <p className="text-sm mt-2">📍 {plan.location}</p>
          <p className="text-sm">📅 {formatDate(plan.date)} · {plan.time.slice(0,5)}</p>
          {plan.is_hosted && <p className="text-sm mt-2">🌟 Plan oficial con {plan.company_name}</p>}
          {!joined && (
            <div className="mt-3 flex justify-center">
              <RubberButton onClick={join}>Me apunto</RubberButton>
            </div>
          )}
        </PaperNote>
      </div>

      <div className="px-4 mt-4">
        <p className="text-[var(--ink)]/70 text-sm mb-2 font-semibold">
          La cuadrilla
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {participants.map((p) => (
            <Link key={p.id} to="/u/$id" params={{ id: p.id }} className="shrink-0 flex flex-col items-center">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[var(--border)]" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center border-2 border-[var(--border)]">👤</div>
              )}
              <span className="text-[11px] text-[var(--ink)]/90 mt-1 truncate max-w-[60px]">{p.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 mt-2 space-y-2">
        {messages.map((m) => {
          if (m.text === JOIN_SYSTEM_MARK) {
            const author = participants.find((p) => p.id === m.sender_id);
            return (
              <div key={m.id} className="flex justify-center my-1">
                <span
                  className="text-xs px-3 py-1 rounded-full text-center font-medium"
                  style={{
                    backgroundColor: "var(--muted)",
                    color: "var(--ink)",
                  }}
                >
                  👋 {author?.name ?? "Alguien"} se ha unido a la cuadrilla
                </span>
              </div>
            );
          }
          const own = m.sender_id === userId;
          const author = participants.find((p) => p.id === m.sender_id);
          return (
            <div key={m.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%] rounded-2xl px-3 py-2 paper-shadow"
                style={{ backgroundColor: own ? "var(--pin)" : "#FFFFFF", color: own ? "var(--pin-foreground)" : "var(--ink)", border: own ? "none" : "1px solid var(--border)" }}>
                {!own && <p className="text-[11px] opacity-70 mb-0.5 font-semibold">{author?.name}</p>}
                <p className="text-sm">{m.text}</p>
              </div>
            </div>
          );
        })}
        {messages.every((m) => m.text === JOIN_SYSTEM_MARK) && (
          <p className="text-[var(--ink)]/70 text-center text-sm mt-6">{icebreaker}</p>
        )}
      </div>

      {joined && (
        <form onSubmit={send} className="px-4 pt-2 flex gap-2 sticky bottom-24">
          <input
            value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe…"
            className="flex-1 bg-white/90 border-2 border-[var(--ink)]/20 rounded-full px-4 py-2"
          />
          <button type="submit" className="rounded-full w-11 h-11 flex items-center justify-center"
            style={{ backgroundColor: "var(--pin)", color: "var(--pin-foreground)" }}>
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}
