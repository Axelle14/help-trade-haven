-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.appeal_action_type AS ENUM ('warning','restriction','ban','report_outcome','flag');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.appeal_status AS ENUM ('submitted','under_review','need_more_info','approved','denied','withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ APPEALS TABLE ============
CREATE TABLE IF NOT EXISTS public.appeals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,                               -- appellant
  action_type public.appeal_action_type NOT NULL,
  related_report_id UUID NULL,                         -- optional link to a report
  related_flag_id UUID NULL,                           -- optional link to a moderation_flag
  reason TEXT NOT NULL,                                -- why the action is unfair
  evidence TEXT NULL,                                  -- supporting context / links
  status public.appeal_status NOT NULL DEFAULT 'submitted',
  reviewer_id UUID NULL,
  decision TEXT NULL,                                  -- short outcome summary
  decision_reason TEXT NULL,                           -- detailed reasoning
  decided_at TIMESTAMPTZ NULL,
  cooldown_until TIMESTAMPTZ NULL,                     -- when user can re-appeal same action_type
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appeals_user ON public.appeals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON public.appeals(status, created_at DESC);

ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own appeals" ON public.appeals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Mods view all appeals" ON public.appeals
  FOR SELECT TO authenticated USING (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users create their own appeals" ON public.appeals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users withdraw their own appeals" ON public.appeals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status IN ('submitted','need_more_info','withdrawn'));

CREATE POLICY "Mods update appeals" ON public.appeals
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()))
  WITH CHECK (public.is_admin_or_moderator(auth.uid()));

CREATE TRIGGER trg_appeals_updated_at
  BEFORE UPDATE ON public.appeals
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ COOLDOWN + DUPLICATE GUARD ============
CREATE OR REPLACE FUNCTION public.enforce_appeal_cooldown()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_open INT;
  v_recent_cooldown TIMESTAMPTZ;
BEGIN
  -- block if user already has an open appeal for the same action_type
  SELECT COUNT(*) INTO v_open
  FROM public.appeals
  WHERE user_id = NEW.user_id
    AND action_type = NEW.action_type
    AND status IN ('submitted','under_review','need_more_info');
  IF v_open > 0 THEN
    RAISE EXCEPTION 'You already have an open appeal for this action.';
  END IF;

  -- block if a previous denial set a cooldown that hasn't elapsed
  SELECT MAX(cooldown_until) INTO v_recent_cooldown
  FROM public.appeals
  WHERE user_id = NEW.user_id
    AND action_type = NEW.action_type
    AND status = 'denied';
  IF v_recent_cooldown IS NOT NULL AND v_recent_cooldown > now() THEN
    RAISE EXCEPTION 'You can submit another appeal after %', v_recent_cooldown;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER trg_appeals_cooldown
  BEFORE INSERT ON public.appeals
  FOR EACH ROW EXECUTE FUNCTION public.enforce_appeal_cooldown();

-- ============ DECISION SIDE EFFECTS ============
CREATE OR REPLACE FUNCTION public.on_appeal_decision()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('approved','denied','withdrawn') THEN
    NEW.decided_at := now();
    -- auto cooldown of 14 days on denial if not explicitly set
    IF NEW.status = 'denied' AND NEW.cooldown_until IS NULL THEN
      NEW.cooldown_until := now() + interval '14 days';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_appeals_decision_pre
  BEFORE UPDATE ON public.appeals
  FOR EACH ROW EXECUTE FUNCTION public.on_appeal_decision();

CREATE OR REPLACE FUNCTION public.after_appeal_decision()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
    -- If approved, mark linked report as dismissed (if any) and recompute trust
    IF NEW.related_report_id IS NOT NULL THEN
      UPDATE public.reports
        SET status = 'dismissed', reviewer_notes = COALESCE(reviewer_notes,'') || E'\n[appeal approved]'
        WHERE id = NEW.related_report_id;
    END IF;
    IF NEW.related_flag_id IS NOT NULL THEN
      DELETE FROM public.moderation_flags WHERE id = NEW.related_flag_id;
    END IF;
    PERFORM public.recompute_trust_score(NEW.user_id);
  END IF;

  -- Notify the appellant of the decision
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, category, priority, title, body, link, group_key, data)
    VALUES (
      NEW.user_id, 'system', 'high',
      'Appeal ' || NEW.status::text,
      COALESCE(NEW.decision, 'Your appeal status was updated.'),
      '/appeals/' || NEW.id::text,
      'appeal:' || NEW.id::text,
      jsonb_build_object('appeal_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_appeals_decision_post
  AFTER UPDATE ON public.appeals
  FOR EACH ROW EXECUTE FUNCTION public.after_appeal_decision();

-- ============ APPEAL NOTES (history) ============
CREATE TABLE IF NOT EXISTS public.appeal_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appeal_id UUID NOT NULL REFERENCES public.appeals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  body TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,  -- internal = mods only
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appeal_notes_appeal ON public.appeal_notes(appeal_id, created_at);

ALTER TABLE public.appeal_notes ENABLE ROW LEVEL SECURITY;

-- Owner of the appeal sees public notes; mods see all
CREATE POLICY "Appellant views public notes" ON public.appeal_notes
  FOR SELECT TO authenticated
  USING (
    NOT is_internal
    AND EXISTS (SELECT 1 FROM public.appeals a WHERE a.id = appeal_id AND a.user_id = auth.uid())
  );

CREATE POLICY "Mods view all notes" ON public.appeal_notes
  FOR SELECT TO authenticated USING (public.is_admin_or_moderator(auth.uid()));

-- Appellant can post non-internal notes on their own appeal
CREATE POLICY "Appellant posts notes" ON public.appeal_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND is_internal = false
    AND EXISTS (SELECT 1 FROM public.appeals a WHERE a.id = appeal_id AND a.user_id = auth.uid())
  );

-- Mods can post any note (internal or public)
CREATE POLICY "Mods post notes" ON public.appeal_notes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id AND public.is_admin_or_moderator(auth.uid()));
