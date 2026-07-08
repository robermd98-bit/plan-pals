CREATE TABLE public.club_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_name)
);
CREATE INDEX club_members_company_idx ON public.club_members(company_name);
GRANT SELECT, INSERT, DELETE ON public.club_members TO authenticated;
GRANT ALL ON public.club_members TO service_role;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "club_members_select_all" ON public.club_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "club_members_insert_own" ON public.club_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "club_members_delete_own" ON public.club_members FOR DELETE TO authenticated USING (auth.uid() = user_id);