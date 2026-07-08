import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";
import { RubberButton } from "@/components/RubberButton";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ArrowLeft } from "lucide-react";

type Reward = {
  id: string;
  company_name: string;
  category: string;
  title: string;
  description: string | null;
  points_cost: number;
};

export const Route = createFileRoute("/_authenticated/recompensas")({
  component: Rewards,
});

function Rewards() {
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeemedIds, setRedeemedIds] = useState<Set<string>>(new Set());
  const [redeeming, setRedeeming] = useState<string | null>(null);

  async function load() {
    const { data: ledger } = await supabase.from("points_ledger").select("amount").eq("user_id", userId);
    setPoints((ledger ?? []).reduce((sum, r) => sum + r.amount, 0));

    const { data: rw } = await supabase.from("partner_rewards").select("*").eq("active", true).order("points_cost");
    setRewards(rw ?? []);

    const { data: red } = await supabase.from("reward_redemptions").select("reward_id").eq("user_id", userId);
    setRedeemedIds(new Set((red ?? []).map((r) => r.reward_id)));
  }
  useEffect(() => { load(); }, [userId]);

  async function redeem(reward: Reward) {
    if (points < reward.points_cost || redeemedIds.has(reward.id)) return;
    setRedeeming(reward.id);
    await supabase.from("reward_redemptions").insert({ user_id: userId, reward_id: reward.id });
    await supabase.from("points_ledger").insert({
      user_id: userId,
      amount: -reward.points_cost,
      reason: `Canje: ${reward.title}`,
    });
    await load();
    setRedeeming(null);
  }

  return (
    <div className="p-5 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate({ to: "/perfil" })} style={{ color: "var(--ink)" }}>
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>Recompensas</h1>
      </div>

      <div className="rounded-2xl px-5 py-4 mb-5 text-center" style={{ backgroundColor: "var(--pin)", color: "var(--pin-foreground)" }}>
        <p className="text-xs uppercase tracking-wider opacity-80">Tus puntos</p>
        <p className="text-4xl font-bold">{points}</p>
        <p className="text-xs mt-1 opacity-80">Ganas puntos al apuntarte a planes — el doble si son oficiales con un negocio socio</p>
      </div>

      <p className="text-sm text-[var(--ink)]/60 mb-3">
        Canjea tus puntos en cualquiera de nuestros negocios colaboradores. Ganas puntos con uno, los gastas donde quieras.
      </p>

      <div className="grid gap-3">
        {rewards.map((r) => {
          const already = redeemedIds.has(r.id);
          const canAfford = points >= r.points_cost;
          return (
            <PaperNote key={r.id} category={r.category} rotation={0} className="!py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider opacity-70 inline-flex items-center gap-1">
                    <CategoryIcon category={r.category} size={13} /> {r.company_name}
                  </p>
                  <h3 className="text-lg font-semibold leading-tight mt-0.5">{r.title}</h3>
                  {r.description && <p className="text-xs opacity-70 mt-1">{r.description}</p>}
                </div>
                <span className="text-sm font-bold shrink-0">{r.points_cost} pts</span>
              </div>
              <div className="mt-3">
                {already ? (
                  <span className="text-xs font-semibold" style={{ color: "var(--pin)" }}>✓ Ya canjeado</span>
                ) : (
                  <RubberButton
                    tone={canAfford ? "primary" : "paper"}
                    className="text-sm"
                    disabled={!canAfford || redeeming === r.id}
                    onClick={() => redeem(r)}
                  >
                    {redeeming === r.id ? "Canjeando…" : canAfford ? "Canjear" : `Te faltan ${r.points_cost - points} pts`}
                  </RubberButton>
                )}
              </div>
            </PaperNote>
          );
        })}
      </div>

      {rewards.length === 0 && (
        <p className="text-center text-[var(--ink)]/60 text-sm mt-10">Todavía no hay recompensas disponibles.</p>
      )}
    </div>
  );
}
