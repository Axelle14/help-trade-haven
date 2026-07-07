
-- 1) Profile status
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active','suspended'));

-- 2) Audit log
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  target_label text,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins write audit"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs (created_at DESC);

-- 3) Helper: assert admin
CREATE OR REPLACE FUNCTION public._assert_admin()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden: admin only';
  END IF;
END $$;

-- 4) Audit writer
CREATE OR REPLACE FUNCTION public._write_audit(
  _action text, _target_type text, _target_id text,
  _target_label text, _reason text, _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, target_label, reason, metadata)
  VALUES (auth.uid(), _action, _target_type, _target_id, _target_label, _reason, COALESCE(_metadata,'{}'::jsonb));
END $$;

-- 5) Users list
CREATE OR REPLACE FUNCTION public.admin_list_users(
  _search text DEFAULT NULL, _limit int DEFAULT 100, _offset int DEFAULT 0
) RETURNS TABLE (
  id uuid, display_name text, email text, avatar_url text,
  role app_role, status text, created_at timestamptz, last_sign_in_at timestamptz,
  trust_score int, trust_status text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_admin();
  RETURN QUERY
  SELECT p.id, p.display_name, u.email::text, p.avatar_url,
         COALESCE((SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = p.id ORDER BY ur.role LIMIT 1), 'user'::app_role),
         p.status, p.created_at, u.last_sign_in_at,
         COALESCE(t.score, 100)::int, COALESCE(t.status, 'good')
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  LEFT JOIN public.trust_scores t ON t.user_id = p.id
  WHERE _search IS NULL OR _search = ''
     OR p.display_name ILIKE '%'||_search||'%'
     OR u.email::text ILIKE '%'||_search||'%'
  ORDER BY p.created_at DESC
  LIMIT _limit OFFSET _offset;
END $$;

-- 6) Suspend / activate
CREATE OR REPLACE FUNCTION public.admin_set_user_status(_user_id uuid, _status text, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_name text;
BEGIN
  PERFORM public._assert_admin();
  IF _status NOT IN ('active','suspended') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  UPDATE public.profiles SET status = _status WHERE id = _user_id RETURNING display_name INTO v_name;
  PERFORM public._write_audit(
    CASE WHEN _status='suspended' THEN 'user.suspend' ELSE 'user.activate' END,
    'user', _user_id::text, v_name, _reason, jsonb_build_object('status', _status));
END $$;

-- 7) Delete user
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_name text;
BEGIN
  PERFORM public._assert_admin();
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'You cannot delete yourself'; END IF;
  SELECT display_name INTO v_name FROM public.profiles WHERE id = _user_id;
  PERFORM public._write_audit('user.delete','user',_user_id::text, v_name, _reason);
  DELETE FROM auth.users WHERE id = _user_id;
END $$;

-- 8) Change role
CREATE OR REPLACE FUNCTION public.admin_set_user_role(_user_id uuid, _role app_role, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_name text; v_old app_role;
BEGIN
  PERFORM public._assert_admin();
  SELECT display_name INTO v_name FROM public.profiles WHERE id = _user_id;
  SELECT role INTO v_old FROM public.user_roles WHERE user_id = _user_id ORDER BY role LIMIT 1;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  IF _role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
  END IF;
  PERFORM public._write_audit('user.role_change','user',_user_id::text, v_name, _reason,
    jsonb_build_object('from', v_old, 'to', _role));
END $$;

-- 9) Services list
CREATE OR REPLACE FUNCTION public.admin_list_services(
  _search text DEFAULT NULL, _only_active boolean DEFAULT NULL,
  _limit int DEFAULT 100, _offset int DEFAULT 0
) RETURNS TABLE (
  id uuid, title text, category text, point_price int,
  is_active boolean, created_at timestamptz,
  owner_id uuid, owner_name text, owner_email text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._assert_admin();
  RETURN QUERY
  SELECT s.id, s.title, s.category, s.point_price, s.is_active, s.created_at,
         s.user_id, p.display_name, u.email::text
  FROM public.services s
  JOIN public.profiles p ON p.id = s.user_id
  JOIN auth.users u ON u.id = s.user_id
  WHERE (_only_active IS NULL OR s.is_active = _only_active)
    AND (_search IS NULL OR _search = ''
         OR s.title ILIKE '%'||_search||'%'
         OR s.category ILIKE '%'||_search||'%'
         OR p.display_name ILIKE '%'||_search||'%')
  ORDER BY s.created_at DESC
  LIMIT _limit OFFSET _offset;
END $$;

-- 10) Toggle / delete / flag service
CREATE OR REPLACE FUNCTION public.admin_set_service_active(_service_id uuid, _active boolean, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_title text;
BEGIN
  PERFORM public._assert_admin();
  UPDATE public.services SET is_active = _active WHERE id = _service_id RETURNING title INTO v_title;
  PERFORM public._write_audit(
    CASE WHEN _active THEN 'service.activate' ELSE 'service.remove' END,
    'service', _service_id::text, v_title, _reason);
END $$;

CREATE OR REPLACE FUNCTION public.admin_delete_service(_service_id uuid, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_title text;
BEGIN
  PERFORM public._assert_admin();
  SELECT title INTO v_title FROM public.services WHERE id = _service_id;
  PERFORM public._write_audit('service.delete','service',_service_id::text, v_title, _reason);
  DELETE FROM public.services WHERE id = _service_id;
END $$;

CREATE OR REPLACE FUNCTION public.admin_flag_service(_service_id uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_title text; v_user uuid;
BEGIN
  PERFORM public._assert_admin();
  SELECT title, user_id INTO v_title, v_user FROM public.services WHERE id = _service_id;
  INSERT INTO public.moderation_flags (user_id, flag_type, severity, notes)
  VALUES (v_user, 'inappropriate', 2, COALESCE('Service "'||v_title||'": '||_reason, 'Flagged by admin'));
  PERFORM public._write_audit('service.flag','service',_service_id::text, v_title, _reason);
END $$;

-- 11) Overview and charts
CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS TABLE (
  total_users int, active_users_30d int, suspended_users int,
  total_services int, active_services int,
  active_requests int, completed_exchanges int
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._assert_admin();
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::int FROM public.profiles),
    (SELECT COUNT(*)::int FROM auth.users WHERE last_sign_in_at > now() - interval '30 days'),
    (SELECT COUNT(*)::int FROM public.profiles WHERE status = 'suspended'),
    (SELECT COUNT(*)::int FROM public.services),
    (SELECT COUNT(*)::int FROM public.services WHERE is_active),
    (SELECT COUNT(*)::int FROM public.swaps WHERE status IN ('pending','accepted','active')),
    (SELECT COUNT(*)::int FROM public.swaps WHERE status = 'completed');
END $$;

CREATE OR REPLACE FUNCTION public.admin_new_users_monthly(_months int DEFAULT 6)
RETURNS TABLE (month text, count int)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._assert_admin();
  RETURN QUERY
  SELECT to_char(date_trunc('month', gs), 'Mon YYYY') AS month,
         (SELECT COUNT(*)::int FROM public.profiles p
           WHERE date_trunc('month', p.created_at) = date_trunc('month', gs)) AS count
  FROM generate_series(
    date_trunc('month', now()) - make_interval(months => _months - 1),
    date_trunc('month', now()),
    interval '1 month'
  ) gs
  ORDER BY gs;
END $$;

CREATE OR REPLACE FUNCTION public.admin_services_by_category()
RETURNS TABLE (category text, count int)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._assert_admin();
  RETURN QUERY
  SELECT s.category, COUNT(*)::int
  FROM public.services s WHERE s.is_active
  GROUP BY s.category ORDER BY COUNT(*) DESC LIMIT 12;
END $$;

CREATE OR REPLACE FUNCTION public.admin_requests_by_status()
RETURNS TABLE (status text, count int)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._assert_admin();
  RETURN QUERY
  SELECT s.status::text, COUNT(*)::int
  FROM public.swaps s GROUP BY s.status::text ORDER BY COUNT(*) DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_audit(_limit int DEFAULT 100)
RETURNS TABLE (
  id uuid, admin_id uuid, admin_name text,
  action text, target_type text, target_id text, target_label text,
  reason text, metadata jsonb, created_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._assert_admin();
  RETURN QUERY
  SELECT a.id, a.admin_id, p.display_name,
         a.action, a.target_type, a.target_id, a.target_label,
         a.reason, a.metadata, a.created_at
  FROM public.audit_logs a
  LEFT JOIN public.profiles p ON p.id = a.admin_id
  ORDER BY a.created_at DESC
  LIMIT _limit;
END $$;
