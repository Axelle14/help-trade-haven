-- =========================================
-- LOCAL COMMUNITIES — schema + RLS + seed
-- =========================================

CREATE TYPE public.city_role AS ENUM ('member','moderator','ambassador');
CREATE TYPE public.city_message_status AS ENUM ('active','hidden','deleted');

-- ---------- cities ----------
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Canada',
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  member_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are readable by signed-in users"
  ON public.cities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Cities are readable publicly"
  ON public.cities FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Admins manage cities - insert"
  ON public.cities FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage cities - update"
  ON public.cities FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ---------- city_memberships ----------
CREATE TABLE public.city_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  role public.city_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, city_id)
);
CREATE INDEX idx_city_memberships_city ON public.city_memberships(city_id);
CREATE INDEX idx_city_memberships_user ON public.city_memberships(user_id);
ALTER TABLE public.city_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Memberships viewable by signed-in users"
  ON public.city_memberships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users join cities themselves"
  ON public.city_memberships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave cities themselves"
  ON public.city_memberships FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins manage memberships"
  ON public.city_memberships FOR UPDATE TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

-- helper: is current user a member of this city?
CREATE OR REPLACE FUNCTION public.is_city_member(_city_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.city_memberships
                WHERE city_id = _city_id AND user_id = _user_id)
$$;

-- helper: is current user a city moderator OR a global mod/admin?
CREATE OR REPLACE FUNCTION public.is_city_moderator(_city_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin_or_moderator(_user_id)
      OR EXISTS(SELECT 1 FROM public.city_memberships
                WHERE city_id = _city_id AND user_id = _user_id
                  AND role IN ('moderator','ambassador'))
$$;

-- bump member_count cache
CREATE OR REPLACE FUNCTION public.bump_city_member_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.cities SET member_count = member_count + 1 WHERE id = NEW.city_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.cities SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.city_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_city_member_count
AFTER INSERT OR DELETE ON public.city_memberships
FOR EACH ROW EXECUTE FUNCTION public.bump_city_member_count();

-- ---------- city_messages ----------
CREATE TABLE public.city_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  status public.city_message_status NOT NULL DEFAULT 'active',
  hidden_by UUID,
  hidden_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_city_messages_city_created ON public.city_messages(city_id, created_at DESC);
ALTER TABLE public.city_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active messages viewable by city members"
  ON public.city_messages FOR SELECT TO authenticated
  USING (
    status = 'active'
    AND public.is_city_member(city_id, auth.uid())
  );
CREATE POLICY "Mods view all messages"
  ON public.city_messages FOR SELECT TO authenticated
  USING (public.is_city_moderator(city_id, auth.uid()));
CREATE POLICY "Members post messages"
  ON public.city_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_city_member(city_id, auth.uid())
    AND length(btrim(message)) BETWEEN 1 AND 1000
  );
CREATE POLICY "Author edits own message"
  ON public.city_messages FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Mods moderate messages"
  ON public.city_messages FOR UPDATE TO authenticated
  USING (public.is_city_moderator(city_id, auth.uid()))
  WITH CHECK (public.is_city_moderator(city_id, auth.uid()));

-- anti-spam: 5s cooldown between messages
CREATE OR REPLACE FUNCTION public.enforce_city_chat_cooldown()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_last TIMESTAMPTZ;
BEGIN
  SELECT MAX(created_at) INTO v_last
    FROM public.city_messages
   WHERE sender_id = NEW.sender_id;
  IF v_last IS NOT NULL AND v_last > now() - interval '5 seconds' THEN
    RAISE EXCEPTION 'Slow down — wait a few seconds before sending another message.';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_city_chat_cooldown
BEFORE INSERT ON public.city_messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_city_chat_cooldown();

-- ---------- city_message_reactions ----------
CREATE TABLE public.city_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.city_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);
ALTER TABLE public.city_message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions viewable by signed-in users"
  ON public.city_message_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users add own reactions"
  ON public.city_message_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own reactions"
  ON public.city_message_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---------- city_stats (cached weekly) ----------
CREATE TABLE public.city_stats (
  city_id UUID PRIMARY KEY REFERENCES public.cities(id) ON DELETE CASCADE,
  swaps_completed INT NOT NULL DEFAULT 0,
  active_members INT NOT NULL DEFAULT 0,
  trending_skills TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.city_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "City stats readable by signed-in users"
  ON public.city_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "City stats readable publicly"
  ON public.city_stats FOR SELECT TO anon USING (true);
CREATE POLICY "Mods write city stats - insert"
  ON public.city_stats FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_moderator(auth.uid()));
CREATE POLICY "Mods write city stats - update"
  ON public.city_stats FOR UPDATE TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

-- realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.city_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.city_message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.city_memberships;

-- ---------- seed BC cities + demo stats ----------
INSERT INTO public.cities (slug,name,province,country,latitude,longitude) VALUES
  ('vancouver','Vancouver','BC','Canada',49.2827,-123.1207),
  ('surrey','Surrey','BC','Canada',49.1913,-122.8490),
  ('burnaby','Burnaby','BC','Canada',49.2488,-122.9805),
  ('richmond','Richmond','BC','Canada',49.1666,-123.1336),
  ('coquitlam','Coquitlam','BC','Canada',49.2838,-122.7932),
  ('langley','Langley','BC','Canada',49.1044,-122.6604),
  ('victoria','Victoria','BC','Canada',48.4284,-123.3656),
  ('kelowna','Kelowna','BC','Canada',49.8880,-119.4960),
  ('abbotsford','Abbotsford','BC','Canada',49.0504,-122.3045),
  ('nanaimo','Nanaimo','BC','Canada',49.1659,-123.9401)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.city_stats (city_id, swaps_completed, active_members, trending_skills)
SELECT c.id,
       (random()*60+18)::INT,
       (random()*120+30)::INT,
       (ARRAY['Tutoring','Graphic Design','Resume Help','Fitness Coaching','Coding Help','Photography','Yoga','Dog Walking'])[1:5]
FROM public.cities c
ON CONFLICT (city_id) DO NOTHING;