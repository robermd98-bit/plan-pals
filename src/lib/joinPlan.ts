import { supabase } from "@/integrations/supabase/client";

// Marca especial usada como texto de un mensaje "de sistema" cuando alguien
// se une a un plan. Nunca la escribiría una persona real, así que sirve
// para distinguir estos mensajes de los mensajes normales del chat.
export const JOIN_SYSTEM_MARK = "__joined__";

export async function joinPlan(planId: string, userId: string, isHosted: boolean = false) {
  await supabase.from("plan_participants").insert({ plan_id: planId, user_id: userId });
  await supabase.from("messages").insert({ plan_id: planId, sender_id: userId, text: JOIN_SYSTEM_MARK });
  const amount = isHosted ? 40 : 10;
  await supabase.from("points_ledger").insert({
    user_id: userId,
    plan_id: planId,
    amount,
    reason: isHosted ? "Plan oficial con negocio socio" : "Te apuntaste a un plan",
  });
}
