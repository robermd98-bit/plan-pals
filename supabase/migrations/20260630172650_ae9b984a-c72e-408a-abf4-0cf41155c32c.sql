
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  age INT,
  city TEXT,
  bio TEXT,
  avatar_url TEXT,
  interests TEXT[] NOT NULL DEFAULT '{}',
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_company BOOLEAN NOT NULL DEFAULT false,
  company_name TEXT,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- activities catalog
CREATE TABLE public.activities_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  commission_per_person NUMERIC(10,2) NOT NULL,
  suggested_location TEXT,
  suggested_max INT NOT NULL DEFAULT 8
);
GRANT SELECT ON public.activities_catalog TO authenticated, anon;
GRANT ALL ON public.activities_catalog TO service_role;
ALTER TABLE public.activities_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog_public_read" ON public.activities_catalog FOR SELECT USING (true);

-- plans
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  max_people INT NOT NULL,
  is_hosted BOOLEAN NOT NULL DEFAULT false,
  host_id UUID REFERENCES auth.users ON DELETE SET NULL,
  activity_id UUID REFERENCES public.activities_catalog ON DELETE SET NULL,
  company_name TEXT,
  commission_per_person NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT SELECT ON public.plans TO anon;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_select_all" ON public.plans FOR SELECT USING (true);
CREATE POLICY "plans_insert_own" ON public.plans FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "plans_update_own" ON public.plans FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "plans_delete_own" ON public.plans FOR DELETE USING (auth.uid() = creator_id);

-- participants
CREATE TABLE public.plan_participants (
  plan_id UUID NOT NULL REFERENCES public.plans ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (plan_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.plan_participants TO authenticated;
GRANT SELECT ON public.plan_participants TO anon;
GRANT ALL ON public.plan_participants TO service_role;
ALTER TABLE public.plan_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pp_select_all" ON public.plan_participants FOR SELECT USING (true);
CREATE POLICY "pp_insert_self" ON public.plan_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pp_delete_self" ON public.plan_participants FOR DELETE USING (auth.uid() = user_id);

-- messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select_participants" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.plan_participants pp WHERE pp.plan_id = messages.plan_id AND pp.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.plans p WHERE p.id = messages.plan_id AND p.creator_id = auth.uid())
);
CREATE POLICY "messages_insert_participants" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND (
    EXISTS (SELECT 1 FROM public.plan_participants pp WHERE pp.plan_id = messages.plan_id AND pp.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.plans p WHERE p.id = messages.plan_id AND p.creator_id = auth.uid())
  )
);

-- host reviews
CREATE TABLE public.host_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.host_reviews TO authenticated;
GRANT SELECT ON public.host_reviews TO anon;
GRANT ALL ON public.host_reviews TO service_role;
ALTER TABLE public.host_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all" ON public.host_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_company" ON public.host_reviews FOR INSERT WITH CHECK (
  auth.uid() = company_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_company = true)
);

-- ads
CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  impressions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO authenticated;
GRANT ALL ON public.ads TO service_role;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ads_select_auth" ON public.ads FOR SELECT TO authenticated USING (true);
CREATE POLICY "ads_insert_own" ON public.ads FOR INSERT WITH CHECK (auth.uid() = advertiser_id);
CREATE POLICY "ads_update_own" ON public.ads FOR UPDATE USING (auth.uid() = advertiser_id);
CREATE POLICY "ads_delete_own" ON public.ads FOR DELETE USING (auth.uid() = advertiser_id);

-- RPC to increment ad impressions (any authenticated)
CREATE OR REPLACE FUNCTION public.increment_ad_impression(ad_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.ads SET impressions = impressions + 1 WHERE id = ad_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_ad_impression(UUID) TO authenticated;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_participants;

-- Seed catalog
INSERT INTO public.activities_catalog (company_name, title, description, category, commission_per_person, suggested_location, suggested_max) VALUES
('Urban Padel Zaragoza','Partido de pádel','Pista cubierta, palas incluidas. Nivel iniciación-medio.','deporte',3.00,'Urban Padel, Zaragoza',4),
('Enigma Rooms','Escape Room en grupo','60 minutos de misterio en sala temática.','cultura',4.00,'Enigma Rooms, Centro',6),
('BrewLab Cervecería','Cata de cervezas artesanas','6 cervezas comentadas + tapeo.','social',5.00,'BrewLab, Casco Viejo',10),
('Karting Indoor Stadium','Tanda de karts','15 minutos de carrera + clasificación.','deporte',6.00,'Karting Indoor Stadium',8),
('Yoga Garden','Sesión de yoga al aire libre','Vinyasa para todos los niveles, esterilla incluida.','aire_libre',4.00,'Parque Grande',12),
('Climb Up Rocódromo','Iniciación a la escalada','Material y monitor incluidos.','aire_libre',7.00,'Climb Up, Polígono',8);
