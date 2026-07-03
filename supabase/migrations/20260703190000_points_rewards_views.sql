-- Puntos ganados por el usuario (por apuntarse a planes, con bonus en planes oficiales)
create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);
alter table public.points_ledger enable row level security;
create policy "points_select_own" on public.points_ledger for select using (auth.uid() = user_id);
create policy "points_insert_own" on public.points_ledger for insert with check (auth.uid() = user_id);

-- Recompensas de negocios socios (coalicion), canjeables con puntos
create table if not exists public.partner_rewards (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  category text not null,
  title text not null,
  description text,
  points_cost integer not null,
  active boolean not null default true
);
alter table public.partner_rewards enable row level security;
create policy "rewards_public_read" on public.partner_rewards for select using (true);

-- Canjes realizados
create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reward_id uuid not null references public.partner_rewards(id) on delete cascade,
  redeemed_at timestamptz not null default now()
);
alter table public.reward_redemptions enable row level security;
create policy "redemptions_select_own" on public.reward_redemptions for select using (auth.uid() = user_id);
create policy "redemptions_insert_own" on public.reward_redemptions for insert with check (auth.uid() = user_id);

-- Vistas de plan sin apuntarse (para el recordatorio tipo "carrito abandonado")
create table if not exists public.plan_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  viewed_at timestamptz not null default now()
);
alter table public.plan_views enable row level security;
create policy "views_select_own" on public.plan_views for select using (auth.uid() = user_id);
create policy "views_insert_own" on public.plan_views for insert with check (auth.uid() = user_id);
create index if not exists plan_views_user_idx on public.plan_views(user_id, plan_id);

-- Semilla de recompensas de ejemplo, ligadas a negocios reales del catalogo
insert into public.partner_rewards (company_name, category, title, description, points_cost) values
  ('BrewLab Cervecería', 'social', 'Caña gratis en tu próxima cata', 'Canjeable en cualquier cata de BrewLab Cervecería', 40),
  ('Surfcamp Cantabria', 'deporte', '10% en tu próxima clase de surf', 'Descuento sobre el precio de la clase compartida', 60),
  ('Coworking Utopicus', 'idiomas', 'Café gratis durante el Conversation Club', 'Uno por sesión, presentando la app', 20),
  ('Parque Natural Cazorla', 'aire_libre', 'Alquiler de tienda con 15% dto', 'Para tu próximo camping de fin de semana', 50),
  ('Museo Reina Sofía', 'cultura', 'Entrada 2x1 para acompañante', 'Válida en visitas guiadas organizadas por Quedada', 70)
on conflict do nothing;
