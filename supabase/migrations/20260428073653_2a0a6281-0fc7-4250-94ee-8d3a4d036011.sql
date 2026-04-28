-- City waitlist + referral system
CREATE TABLE public.city_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  skill_offered TEXT NOT NULL,
  skill_needed TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  referred_by_code TEXT,
  status TEXT NOT NULL DEFAULT 'waitlisted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT city_waitlist_email_city_unique UNIQUE (city_id, email)
);

CREATE INDEX idx_city_waitlist_city ON public.city_waitlist(city_id);
CREATE INDEX idx_city_waitlist_referral_code ON public.city_waitlist(referral_code);
CREATE INDEX idx_city_waitlist_referred_by ON public.city_waitlist(referred_by_code);

ALTER TABLE public.city_waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon visitors) can join the waitlist
CREATE POLICY "Anyone can join waitlist"
ON public.city_waitlist FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 100
  AND length(btrim(email)) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(btrim(skill_offered)) BETWEEN 1 AND 200
  AND length(btrim(skill_needed)) BETWEEN 1 AND 200
  AND (phone IS NULL OR length(phone) <= 30)
);

-- Mods see all signups
CREATE POLICY "Mods view all waitlist"
ON public.city_waitlist FOR SELECT TO authenticated
USING (public.is_admin_or_moderator(auth.uid()));

-- Authenticated users can view their own signup
CREATE POLICY "Users view own waitlist"
ON public.city_waitlist FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Aggregated public counters function (so we never expose emails)
CREATE OR REPLACE FUNCTION public.city_waitlist_count(_city_id UUID)
RETURNS INT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(*)::INT FROM public.city_waitlist WHERE city_id = _city_id
$$;

-- Referral progress lookup (by code) — returns count of signups using this code
CREATE OR REPLACE FUNCTION public.referral_progress(_code TEXT)
RETURNS INT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(*)::INT FROM public.city_waitlist WHERE referred_by_code = _code
$$;