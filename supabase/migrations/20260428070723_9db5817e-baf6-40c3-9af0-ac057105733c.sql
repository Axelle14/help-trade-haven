-- ============ Category weights ============
-- Returns a multiplier for how harmful each report reason is.
CREATE OR REPLACE FUNCTION public.report_category_weight(_reason public.report_reason)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE _reason
    WHEN 'scam'          THEN 3.0
    WHEN 'harassment'    THEN 2.5
    WHEN 'inappropriate' THEN 2.0
    WHEN 'no_show'       THEN 1.5
    WHEN 'spam'          THEN 1.0
    WHEN 'other'         THEN 0.8
    ELSE 1.0
  END
$$;

CREATE OR REPLACE FUNCTION public.flag_category_weight(_flag public.flag_type)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE _flag
    WHEN 'scam'          THEN 3.0
    WHEN 'harassment'    THEN 2.5
    WHEN 'inappropriate' THEN 2.0
    WHEN 'no_show'       THEN 1.5
    WHEN 'spam'          THEN 1.0
    WHEN 'other'         THEN 0.8
    ELSE 1.0
  END
$$;

-- ============ Reporter credibility ============
-- Reporters whose reports are repeatedly dismissed lose weight.
-- Returns a 0..1 multiplier (1 = fully credible, 0 = totally untrusted).
CREATE OR REPLACE FUNCTION public.reporter_credibility(_reporter_id uuid)
RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_total INT;
  v_dismissed INT;
  v_actioned INT;
  v_ratio NUMERIC;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE status IN ('dismissed','actioned','reviewing','open')),
    COUNT(*) FILTER (WHERE status = 'dismissed'),
    COUNT(*) FILTER (WHERE status = 'actioned')
  INTO v_total, v_dismissed, v_actioned
  FROM public.reports WHERE reporter_id = _reporter_id;

  IF v_total < 3 THEN RETURN 1.0; END IF;  -- not enough history → trust them

  -- dismissed_ratio in 0..1; weight reduces linearly, but actioned reports add credibility back.
  v_ratio := v_dismissed::NUMERIC / GREATEST(1, v_total);
  RETURN GREATEST(0.1, LEAST(1.0, 1.0 - v_ratio + (v_actioned::NUMERIC * 0.05)));
END $$;

-- ============ Trust score v2 ============
CREATE OR REPLACE FUNCTION public.recompute_trust_score(_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_open_penalty NUMERIC := 0;
  v_actioned_penalty NUMERIC := 0;
  v_flag_penalty NUMERIC := 0;
  v_completed_swaps INT := 0;
  v_recovery_bonus NUMERIC := 0;
  v_score INT;
  v_status TEXT;
  v_banned BOOLEAN;
BEGIN
  -- 1) OPEN/REVIEWING reports → light pressure, weighted by reporter credibility,
  --    decayed by age (half-life ~60d), and category-weighted.
  --    base weight: 2 points per severity unit.
  SELECT COALESCE(SUM(
    severity
    * public.report_category_weight(reason)
    * public.reporter_credibility(reporter_id)
    * exp(- (EXTRACT(EPOCH FROM (now() - created_at)) / 86400.0) / 60.0)
    * 2.0
  ), 0)
  INTO v_open_penalty
  FROM public.reports
  WHERE reported_user_id = _user_id
    AND status IN ('open','reviewing');

  -- 2) ACTIONED reports → heavier, but still decay over time.
  --    base weight: 8 points per severity unit.
  SELECT COALESCE(SUM(
    severity
    * public.report_category_weight(reason)
    * public.reporter_credibility(reporter_id)
    * exp(- (EXTRACT(EPOCH FROM (now() - created_at)) / 86400.0) / 90.0)
    * 8.0
  ), 0)
  INTO v_actioned_penalty
  FROM public.reports
  WHERE reported_user_id = _user_id
    AND status = 'actioned';
  -- NOTE: dismissed reports are intentionally ignored (false-report protection).

  -- 3) Moderation flags → category-weighted, decayed by age.
  --    base weight: 5 points per severity unit.
  SELECT COALESCE(SUM(
    severity
    * public.flag_category_weight(flag_type)
    * exp(- (EXTRACT(EPOCH FROM (now() - created_at)) / 86400.0) / 75.0)
    * 5.0
  ), 0)
  INTO v_flag_penalty
  FROM public.moderation_flags
  WHERE user_id = _user_id;

  -- 4) Recovery bonus from completed swaps (capped to 25 points to prevent farming).
  SELECT COUNT(*) INTO v_completed_swaps
  FROM public.swaps
  WHERE status = 'completed'
    AND (requester_id = _user_id OR provider_id = _user_id);

  v_recovery_bonus := LEAST(25.0, v_completed_swaps * 2.0);

  -- 5) Final score
  v_score := GREATEST(0, LEAST(100,
    ROUND(100.0 - v_open_penalty - v_actioned_penalty - v_flag_penalty + v_recovery_bonus)
  ))::INT;

  -- 6) Hard ban override: if there's any actioned report with severity 5
  --    OR sum of recent actioned penalty is overwhelming.
  SELECT EXISTS (
    SELECT 1 FROM public.reports
    WHERE reported_user_id = _user_id
      AND status = 'actioned'
      AND severity >= 5
      AND created_at > now() - interval '180 days'
  ) INTO v_banned;

  v_status := CASE
    WHEN v_banned OR v_score = 0 THEN 'banned'
    WHEN v_score < 30 THEN 'restricted'
    WHEN v_score < 60 THEN 'watch'
    ELSE 'good' END;

  IF v_banned THEN v_score := LEAST(v_score, 5); END IF;

  INSERT INTO public.trust_scores (user_id, score, status, updated_at)
  VALUES (_user_id, v_score, v_status, now())
  ON CONFLICT (user_id) DO UPDATE
    SET score = EXCLUDED.score, status = EXCLUDED.status, updated_at = now();
END $$;

-- ============ Recovery: recompute on swap completion ============
CREATE OR REPLACE FUNCTION public.on_swap_completed_trust()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM public.recompute_trust_score(NEW.requester_id);
    PERFORM public.recompute_trust_score(NEW.provider_id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_swap_completed_trust ON public.swaps;
CREATE TRIGGER trg_swap_completed_trust
  AFTER UPDATE ON public.swaps
  FOR EACH ROW EXECUTE FUNCTION public.on_swap_completed_trust();

-- ============ Backfill: ensure every profile has a score and recompute all ============
INSERT INTO public.trust_scores (user_id)
SELECT p.id FROM public.profiles p
LEFT JOIN public.trust_scores t ON t.user_id = p.id
WHERE t.user_id IS NULL;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM public.trust_scores LOOP
    PERFORM public.recompute_trust_score(r.user_id);
  END LOOP;
END $$;