import { supabase } from "@/integrations/supabase/client";

// Marca especial usada como texto de un mensaje "de sistema" cuando alguien
// se une a un plan. Nunca la escribiría una persona real, así que sirve
// para distinguir estos mensajes de los mensajes normales del chat.
export const JOIN_SYSTEM_MARK = "__joined__";

export async function joinPlan(planId: string, userId: string) {
  await supabase.from("plan_participants").insert({ plan_id: planId, user_id: userId });
  await supabase.from("messages").insert({ plan_id: planId, sender_id: userId, text: JOIN_SYSTEM_MARK });
}
