import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CategoryIcon } from "@/components/CategoryIcon";
import { RubberButton } from "@/components/RubberButton";
import { PaperNote } from "@/components/PaperNote";
import { ArrowLeft, MessageCircle } from "lucide-react";

type Plan = {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  time: string;
  max_people: number;
};

export const Route = createFileRoute("/_authenticated/clubes/$company")({
  component: ClubPage,
});

function ClubPage() {
  const { company } = Route.useParams();
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>("social");
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data: act } = await supabase
      .from("activities_catalog").select("category").eq("company_name", company).limit(1).maybeSingle();
    if (act) setCategory(act.category);

    const { count } = await supabase
      .from("club_members").select("*", { count: "exact", head: true }).eq("company_name", company);
    setMemberCount(count ?? 0);

    const { data: mine } = await supabase
      .from("club_members").select("id").eq("company_name", company).eq("user_id", userId).maybeSingle();
    setIsMember(!!mine);

    const today = new Date().toISOString().slice(0, 10);
    const { data: ps } = await supabase
      .from("plans").select("id, title, category, location, date, time, max_people")
      .eq("company_name", company).gte("date", today).order("date");
    setPlans(ps ?? []);
  }
  useEffect(() => { load(); }, [company, userId]);

  async function toggleMembership() {
    setBusy(true);
    if (isMember) {
      await supabase.from("club_members").delete().eq("company_name", company).eq("user_id", userId);
    } else {
      await supabase.from("club_members").insert({ company_name: company, user_id: userId });
    }
    await load();
    setBusy(false);
  }

  return (
    <div className="p-5 max-w-md mx-auto">
      <button onClick={() => navigate({ to: "/comunidad" })} className="mb-3" style={{ color: "var(--ink)" }}>
        <ArrowLeft />
      </button>

      <PaperNote category={category} rotation={0}>
        <div className="flex items-center gap-3">
          <CategoryIcon category={category} size={38} />
          <div>
            <h1 className="text-2xl font-bold">{company}</h1>
            <p className="text-sm opacity-70">{memberCount} {memberCount === 1 ? "miembro" : "miembros"} del club</p>
          </div>
        </div>
        <RubberButton
          tone={isMember ? "paper" : "primary"}
          disabled={busy}
          onClick={toggleMembership}
          className="text-sm mt-3 w-full"
        >
          {isMember ? "✓ Eres miembro del club" : "Unirme al club"}
        </RubberButton>
      </PaperNote>

      {isMember && (
        <Link
          to="/comunidad/$category"
          params={{ category: company }}
          className="rubber-button text-sm mt-3 flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--pin)", color: "var(--pin-foreground)" }}
        >
          <MessageCircle size={16} /> Entrar al chat del club
        </Link>
      )}

      <h2 className="text-xl font-bold mt-6 mb-2" style={{ color: "var(--ink)" }}>Próximas kedas de {company}</h2>
      {plans.length === 0 ? (
        <p className="text-[var(--ink)]/60 text-sm">Todavía no hay planes programados.</p>
      ) : (
        <div className="grid gap-2">
          {plans.map((p) => (
            <Link
              key={p.id}
              to="/plan/$id"
              params={{ id: p.id }}
              className="flex items-center gap-3 rounded-xl px-3 py-2 bg-[var(--card)]"
              style={{ border: "1px solid var(--border)" }}
            >
              <CategoryIcon category={p.category} size={22} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.title}</p>
                <p className="text-xs text-[var(--ink)]/60">{p.location} · {p.time.slice(0, 5)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
