import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { categoryEmoji, categoryLabel, paperColor } from "@/lib/categories";
import { randomRoomIcebreaker } from "@/lib/icebreakers";
import { ArrowLeft, Send } from "lucide-react";

type Message = { id: string; category: string; sender_id: string; text: string; created_at: string };
type Profile = { id: string; name: string; avatar_url: string | null };

const AVATAR_TINTS = ["#E76F51", "#2A9D8F", "#E9C46A", "#6D597A", "#457B9D", "#F4A261"];
function tintFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

function MiniAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden mb-1"
      style={{ backgroundColor: avatarUrl ? undefined : tintFor(name || "?") }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        (name || "?").slice(0, 1).toUpperCase()
      )}
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/comunidad/$category")({
  component: CommunityRoom,
});

function CommunityRoom() {
  const { category } = Route.useParams();
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [text, setText] = useState("");
  const [icebreaker] = useState(randomRoomIcebreaker);
  const scrollRef = useRef<HTMLDivElement>(null);
  const profilesRef = useRef<Record<string, Profile>>({});

  const isGeneral = category === "general";
  const headerBg = isGeneral ? "var(--pin)" : paperColor(category);
  const headerFg = isGeneral ? "var(--pin-foreground)" : "var(--ink)";

  async function ensureProfiles(ids: string[]) {
    const missing = Array.from(new Set(ids)).filter((id) => !profilesRef.current[id]);
    if (!missing.length) return;
    const { data } = await supabase.from("profiles").select("id, name, avatar_url").in("id", missing);
    if (data?.length) {
      const next = { ...profilesRef.current };
      data.forEach((p) => { next[p.id] = p; });
      profilesRef.current = next;
      setProfiles(next);
    }
  }

  useEffect(() => {
    (async () => {
      const { data: msgs } = await supabase
        .from("community_messages")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages(msgs ?? []);
      await ensureProfiles((msgs ?? []).map((m) => m.sender_id));
    })();

    const ch = supabase
      .channel(`community-${category}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages", filter: `category=eq.${category}` },
        async (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => [...prev, m]);
          await ensureProfiles([m.sender_id]);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [category]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText("");
    await supabase.from("community_messages").insert({ category, sender_id: userId, text: t });
  }

  return (
    <div className="min-h-screen flex flex-col pb-4">
      <header className="flex items-center gap-3 p-4" style={{ backgroundColor: headerBg, color: headerFg }}>
        <button onClick={() => navigate({ to: "/comunidad" })} style={{ color: headerFg }}>
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-bold">
          {isGeneral ? "💬 Chat general" : `${categoryEmoji(category)} Sala de ${categoryLabel(category)}`}
        </h1>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-[var(--ink)]/50 text-sm mt-10">{icebreaker}</p>
        )}
        {messages.map((m) => {
          const own = m.sender_id === userId;
          const author = profiles[m.sender_id];
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-end gap-2 ${own ? "justify-end" : "justify-start"}`}
            >
              {!own && <MiniAvatar name={author?.name ?? "Alguien"} avatarUrl={author?.avatar_url} />}
              <div
                className="max-w-[70%] rounded-2xl px-3 py-2 paper-shadow"
                style={{
                  backgroundColor: own ? "var(--pin)" : "#FFFFFF",
                  color: own ? "var(--pin-foreground)" : "var(--ink)",
                  border: own ? "none" : "1px solid var(--border)",
                }}
              >
                {!own && <p className="text-[11px] opacity-70 mb-0.5 font-semibold">{author?.name ?? "Alguien"}</p>}
                <p className="text-sm">{m.text}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <form onSubmit={send} className="flex items-center gap-2 px-4 mt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe algo…"
          className="flex-1 bg-white/90 border-2 border-[var(--ink)]/20 rounded-full px-4 py-2"
        />
        <button
          type="submit"
          className="rounded-full w-11 h-11 flex items-center justify-center"
          style={{ backgroundColor: "var(--pin)", color: "var(--pin-foreground)" }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
