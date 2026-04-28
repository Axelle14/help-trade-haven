-- Headline counters
CREATE OR REPLACE FUNCTION public.moderation_overview()
RETURNS TABLE (
  open_reports INT,
  reviewing_reports INT,
  actioned_last_7d INT,
  dismissed_last_7d INT,
  avg_resolution_hours NUMERIC,
  flagged_users_7d INT,
  banned_users INT,
  restricted_users INT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_moderator(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INT FROM public.reports WHERE status = 'open'),
    (SELECT COUNT(*)::INT FROM public.reports WHERE status = 'reviewing'),
    (SELECT COUNT(*)::INT FROM public.reports
       WHERE status = 'actioned' AND updated_at > now() - interval '7 days'),
    (SELECT COUNT(*)::INT FROM public.reports
       WHERE status = 'dismissed' AND updated_at > now() - interval '7 days'),
    (SELECT ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600.0)::NUMERIC, 1)
       FROM public.reports WHERE status IN ('actioned','dismissed')),
    (SELECT COUNT(DISTINCT user_id)::INT FROM public.moderation_flags
       WHERE created_at > now() - interval '7 days'),
    (SELECT COUNT(*)::INT FROM public.trust_scores WHERE status = 'banned'),
    (SELECT COUNT(*)::INT FROM public.trust_scores WHERE status = 'restricted');
END $$;

-- Trust score distribution buckets
CREATE OR REPLACE FUNCTION public.trust_distribution()
RETURNS TABLE (bucket TEXT, count INT)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_moderator(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  WITH buckets AS (
    SELECT CASE
      WHEN score < 20 THEN '0-19'
      WHEN score < 40 THEN '20-39'
      WHEN score < 60 THEN '40-59'
      WHEN score < 80 THEN '60-79'
      ELSE '80-100' END AS b
    FROM public.trust_scores
  )
  SELECT b, COUNT(*)::INT FROM buckets GROUP BY b ORDER BY b;
END $$;

-- Repeat offenders (most reports + flags combined)
CREATE OR REPLACE FUNCTION public.repeat_offenders(_limit INT DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  trust_score INT,
  trust_status TEXT,
  report_count INT,
  flag_count INT,
  total INT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_moderator(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  WITH r AS (
    SELECT reported_user_id AS uid, COUNT(*)::INT AS rc
    FROM public.reports GROUP BY reported_user_id
  ),
  f AS (
    SELECT user_id AS uid, COUNT(*)::INT AS fc
    FROM public.moderation_flags GROUP BY user_id
  ),
  combined AS (
    SELECT COALESCE(r.uid, f.uid) AS uid,
           COALESCE(r.rc, 0) AS rc,
           COALESCE(f.fc, 0) AS fc
    FROM r FULL OUTER JOIN f ON r.uid = f.uid
  )
  SELECT c.uid,
         p.display_name,
         p.avatar_url,
         COALESCE(t.score, 100)::INT,
         COALESCE(t.status, 'good'),
         c.rc,
         c.fc,
         (c.rc + c.fc) AS total
  FROM combined c
  LEFT JOIN public.profiles p ON p.id = c.uid
  LEFT JOIN public.trust_scores t ON t.user_id = c.uid
  ORDER BY total DESC, c.rc DESC
  LIMIT _limit;
END $$;