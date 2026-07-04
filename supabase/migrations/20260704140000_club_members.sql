-- Miembros de un "club" por negocio (comunidad persistente del negocio dentro de la app,
-- alternativa a que el negocio monte un grupo de WhatsApp aparte)
create table if not exists public.club_members (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (company_name, user_id)
);
alter table public.club_members enable row level security;

create policy "club_members_read_all" on public.club_members
  for select to authenticated using (true);

create policy "club_members_insert_own" on public.club_members
  for insert to authenticated with check (auth.uid() = user_id);

create policy "club_members_delete_own" on public.club_members
  for delete to authenticated using (auth.uid() = user_id);

create index if not exists club_members_company_idx on public.club_members(company_name);
