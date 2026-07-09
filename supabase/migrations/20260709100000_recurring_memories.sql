-- Kedas recurrentes: instancias generadas comparten un mismo grupo
alter table public.plans add column if not exists recurring_group_id uuid;
alter table public.plans add column if not exists recurrence text;
create index if not exists plans_recurring_group_idx on public.plans(recurring_group_id);

-- Recuerdos de un plan: foto/nota corta, visible solo para quien participo
create table if not exists public.plan_memories (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_url text,
  text text,
  created_at timestamptz not null default now()
);
alter table public.plan_memories enable row level security;

create policy "memories_select_participants" on public.plan_memories
  for select to authenticated using (
    exists (select 1 from public.plan_participants pp where pp.plan_id = plan_memories.plan_id and pp.user_id = auth.uid())
    or exists (select 1 from public.plans p where p.id = plan_memories.plan_id and p.creator_id = auth.uid())
  );

create policy "memories_insert_own" on public.plan_memories
  for insert to authenticated with check (
    auth.uid() = user_id and (
      exists (select 1 from public.plan_participants pp where pp.plan_id = plan_memories.plan_id and pp.user_id = auth.uid())
      or exists (select 1 from public.plans p where p.id = plan_memories.plan_id and p.creator_id = auth.uid())
    )
  );

alter publication supabase_realtime add table public.plan_memories;

-- Bucket publico para las fotos de recuerdos (mismo patron que avatars)
insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict (id) do nothing;

create policy "memories_photos_public_read" on storage.objects
  for select using (bucket_id = 'memories');
create policy "memories_photos_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'memories' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "memories_photos_update_own" on storage.objects
  for update to authenticated using (
    bucket_id = 'memories' and (storage.foldername(name))[1] = auth.uid()::text
  );
