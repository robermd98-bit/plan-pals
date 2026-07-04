-- points_ledger
CREATE TABLE public.points_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.points_ledger TO authenticated;
GRANT ALL ON public.points_ledger TO service_role;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own ledger" ON public.points_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert own ledger" ON public.points_ledger FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.points_ledger (user_id);

-- community_messages
CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.community_messages TO authenticated;
GRANT ALL ON public.community_messages TO service_role;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read community messages" ON public.community_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "send own community messages" ON public.community_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE INDEX ON public.community_messages (category, created_at);
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- plan_views
CREATE TABLE public.plan_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.plan_views TO authenticated;
GRANT ALL ON public.plan_views TO service_role;
ALTER TABLE public.plan_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own views" ON public.plan_views FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert own views" ON public.plan_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.plan_views (user_id, viewed_at DESC);

-- partner_rewards
CREATE TABLE public.partner_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  points_cost integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_rewards TO authenticated;
GRANT ALL ON public.partner_rewards TO service_role;
ALTER TABLE public.partner_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read active rewards" ON public.partner_rewards FOR SELECT TO authenticated USING (active = true);

-- reward_redemptions
CREATE TABLE public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES public.partner_rewards(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, reward_id)
);
GRANT SELECT, INSERT ON public.reward_redemptions TO authenticated;
GRANT ALL ON public.reward_redemptions TO service_role;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own redemptions" ON public.reward_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert own redemptions" ON public.reward_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);