-- Chat en directo por categoria (no ligado a un plan concreto)
create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);
alter table public.community_messages enable row level security;

create policy "community_messages_read_all" on public.community_messages
  for select to authenticated using (true);

create policy "community_messages_insert_own" on public.community_messages
  for insert to authenticated with check (auth.uid() = sender_id);

create index if not exists community_messages_category_idx
  on public.community_messages(category, created_at);

alter publication supabase_realtime add table public.community_messages;
