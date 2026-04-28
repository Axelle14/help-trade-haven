-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','moderator')
  )
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles - insert" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles - update" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles - delete" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ ENUMS ============
CREATE TYPE public.report_reason AS ENUM ('scam','inappropriate','no_show','harassment','spam','other');
CREATE TYPE public.report_status AS ENUM ('open','reviewing','actioned','dismissed');
CREATE TYPE public.flag_type AS ENUM ('scam','inappropriate','no_show','harassment','spam','other');

-- ============ REPORTS ============
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  reason public.report_reason NOT NULL,
  details TEXT,
  swap_id UUID REFERENCES public.swaps(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  status public.report_status NOT NULL DEFAULT 'open',
  severity SMALLINT NOT NULL DEFAULT 2 CHECK (severity BETWEEN 1 AND 5),
  reviewer_id UUID,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (reporter_id <> reported_user_id)
);
CREATE INDEX idx_reports_reported_user ON public.reports(reported_user_id);
CREATE INDEX idx_reports_status ON public.reports(status);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create their own reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users view their own reports" ON public.reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Mods view all reports" ON public.reports
  FOR SELECT TO authenticated USING (public.is_admin_or_moderator(auth.uid()));
CREATE POLICY "Mods update reports" ON public.reports
  FOR UPDATE TO authenticated USING (public.is_admin_or_moderator(auth.uid()));

CREATE TRIGGER reports_touch_updated
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ BLOCKED USERS ============
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  blocked_user_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, blocked_user_id),
  CHECK (user_id <> blocked_user_id)
);
CREATE INDEX idx_blocked_users_user ON public.blocked_users(user_id);
CREATE INDEX idx_blocked_users_blocked ON public.blocked_users(blocked_user_id);
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own blocks" ON public.blocked_users
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create their own blocks" ON public.blocked_users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their own blocks" ON public.blocked_users
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_blocked_between(_a UUID, _b UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (user_id = _a AND blocked_user_id = _b)
       OR (user_id = _b AND blocked_user_id = _a)
  )
$$;

-- ============ MODERATION FLAGS ============
CREATE TABLE public.moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flag_type public.flag_type NOT NULL,
  severity SMALLINT NOT NULL DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
  source_report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_moderation_flags_user ON public.moderation_flags(user_id);
ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mods view flags" ON public.moderation_flags
  FOR SELECT TO authenticated USING (public.is_admin_or_moderator(auth.uid()));
CREATE POLICY "Users view their own flags" ON public.moderation_flags
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Mods insert flags" ON public.moderation_flags
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_moderator(auth.uid()));
CREATE POLICY "Mods update flags" ON public.moderation_flags
  FOR UPDATE TO authenticated USING (public.is_admin_or_moderator(auth.uid()));
CREATE POLICY "Mods delete flags" ON public.moderation_flags
  FOR DELETE TO authenticated USING (public.is_admin_or_moderator(auth.uid()));

-- ============ TRUST SCORES ============
CREATE TABLE public.trust_scores (
  user_id UUID PRIMARY KEY,
  score SMALLINT NOT NULL DEFAULT 100 CHECK (score BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'good', -- good | watch | restricted | banned
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trust_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can read trust scores" ON public.trust_scores
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins update trust scores" ON public.trust_scores
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert trust scores" ON public.trust_scores
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed trust score on profile creation
CREATE OR REPLACE FUNCTION public.seed_trust_score()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.trust_scores (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER profiles_seed_trust
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.seed_trust_score();

-- Backfill existing profiles
INSERT INTO public.trust_scores (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- Recompute: 100 - (sum severity * weights). Confirmed (actioned) reports weigh more.
CREATE OR REPLACE FUNCTION public.recompute_trust_score(_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_flag_penalty INT;
  v_open_penalty INT;
  v_actioned_penalty INT;
  v_score INT;
  v_status TEXT;
BEGIN
  SELECT COALESCE(SUM(severity) * 5, 0) INTO v_flag_penalty
  FROM public.moderation_flags WHERE user_id = _user_id;

  SELECT COALESCE(SUM(severity) * 2, 0) INTO v_open_penalty
  FROM public.reports WHERE reported_user_id = _user_id AND status IN ('open','reviewing');

  SELECT COALESCE(SUM(severity) * 8, 0) INTO v_actioned_penalty
  FROM public.reports WHERE reported_user_id = _user_id AND status = 'actioned';

  v_score := GREATEST(0, LEAST(100, 100 - v_flag_penalty - v_open_penalty - v_actioned_penalty));
  v_status := CASE
    WHEN v_score = 0 THEN 'banned'
    WHEN v_score < 30 THEN 'restricted'
    WHEN v_score < 60 THEN 'watch'
    ELSE 'good' END;

  INSERT INTO public.trust_scores (user_id, score, status, updated_at)
  VALUES (_user_id, v_score, v_status, now())
  ON CONFLICT (user_id) DO UPDATE SET
    score = EXCLUDED.score, status = EXCLUDED.status, updated_at = now();
END; $$;

-- On report insert: auto-create a moderation flag at severity 1 and recompute trust
CREATE OR REPLACE FUNCTION public.on_report_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.moderation_flags (user_id, flag_type, severity, source_report_id, notes)
  VALUES (
    NEW.reported_user_id,
    CASE NEW.reason::text
      WHEN 'scam' THEN 'scam'::public.flag_type
      WHEN 'inappropriate' THEN 'inappropriate'::public.flag_type
      WHEN 'no_show' THEN 'no_show'::public.flag_type
      WHEN 'harassment' THEN 'harassment'::public.flag_type
      WHEN 'spam' THEN 'spam'::public.flag_type
      ELSE 'other'::public.flag_type
    END,
    GREATEST(1, LEAST(5, NEW.severity)),
    NEW.id,
    LEFT(COALESCE(NEW.details, ''), 500)
  );
  PERFORM public.recompute_trust_score(NEW.reported_user_id);

  -- Notify moderators (one row per admin/moderator) - low overhead, MVP
  INSERT INTO public.notifications (user_id, category, priority, title, body, link, group_key, data)
  SELECT ur.user_id, 'system', 'medium',
         'New user report: ' || NEW.reason::text,
         LEFT(COALESCE(NEW.details, 'No details provided'), 140),
         '/admin/moderation',
         'report:' || NEW.id::text,
         jsonb_build_object('report_id', NEW.id, 'reported_user_id', NEW.reported_user_id)
  FROM public.user_roles ur WHERE ur.role IN ('admin','moderator');

  RETURN NEW;
END; $$;
CREATE TRIGGER reports_after_insert
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.on_report_insert();

-- On report status change to 'actioned' or 'dismissed', recompute trust
CREATE OR REPLACE FUNCTION public.on_report_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.recompute_trust_score(NEW.reported_user_id);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER reports_after_status
AFTER UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.on_report_status_change();

-- ============ BLOCK ENFORCEMENT ON SWAPS ============
CREATE OR REPLACE FUNCTION public.prevent_blocked_swap()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_blocked_between(NEW.requester_id, NEW.provider_id) THEN
    RAISE EXCEPTION 'Cannot create swap: one of the users has blocked the other';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER swaps_block_check
BEFORE INSERT ON public.swaps
FOR EACH ROW EXECUTE FUNCTION public.prevent_blocked_swap();