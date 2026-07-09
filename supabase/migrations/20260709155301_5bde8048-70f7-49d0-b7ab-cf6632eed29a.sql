
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS recurring_group_id uuid,
  ADD COLUMN IF NOT EXISTS recurrence text;

CREATE TABLE IF NOT EXISTS public.plan_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url text,
  text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_memories TO authenticated;
GRANT ALL ON public.plan_memories TO service_role;

ALTER TABLE public.plan_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view plan memories"
ON public.plan_memories FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.plan_participants pp WHERE pp.plan_id = plan_memories.plan_id AND pp.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.plans p WHERE p.id = plan_memories.plan_id AND p.creator_id = auth.uid())
);

CREATE POLICY "Participants can add their own memories"
ON public.plan_memories FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() AND (
    EXISTS (SELECT 1 FROM public.plan_participants pp WHERE pp.plan_id = plan_memories.plan_id AND pp.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.plans p WHERE p.id = plan_memories.plan_id AND p.creator_id = auth.uid())
  )
);

CREATE POLICY "Users can delete their own memories"
ON public.plan_memories FOR DELETE TO authenticated
USING (user_id = auth.uid());
