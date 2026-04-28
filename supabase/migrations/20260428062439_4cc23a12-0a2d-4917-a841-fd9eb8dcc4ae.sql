-- ─────────────────────────────────────────────────────────────────────
-- 1. AVAILABILITY — weekly recurring windows per user
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_of_week SMALLINT NOT NULL,   -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT availability_dow_range CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT availability_time_order CHECK (end_time > start_time)
);

CREATE INDEX availability_user_idx ON public.availability (user_id, day_of_week);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability is viewable by signed-in users"
  ON public.availability FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users manage their own availability — insert"
  ON public.availability FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own availability — update"
  ON public.availability FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage their own availability — delete"
  ON public.availability FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────
-- 2. SWAP — duration + timezone for the confirmed slot
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.swaps
  ADD COLUMN duration_minutes INT NOT NULL DEFAULT 60,
  ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC';

-- ─────────────────────────────────────────────────────────────────────
-- 3. SCHEDULE PROPOSALS — back-and-forth time negotiation per swap
-- ─────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.proposal_status AS ENUM
    ('pending', 'accepted', 'declined', 'superseded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.swap_schedule_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_id UUID NOT NULL REFERENCES public.swaps(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL,
  proposed_for TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  status public.proposal_status NOT NULL DEFAULT 'pending',
  note TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT proposal_future_time CHECK (proposed_for > created_at - interval '1 minute'),
  CONSTRAINT proposal_duration_pos CHECK (duration_minutes > 0)
);

CREATE INDEX proposals_swap_idx   ON public.swap_schedule_proposals (swap_id, created_at DESC);
CREATE INDEX proposals_status_idx ON public.swap_schedule_proposals (status);

ALTER TABLE public.swap_schedule_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Swap participants can view proposals"
  ON public.swap_schedule_proposals FOR SELECT TO authenticated
  USING (public.is_swap_participant(swap_id, auth.uid()));

CREATE POLICY "Swap participants can propose times"
  ON public.swap_schedule_proposals FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = proposed_by
    AND public.is_swap_participant(swap_id, auth.uid())
  );

CREATE POLICY "Swap participants can respond to proposals"
  ON public.swap_schedule_proposals FOR UPDATE TO authenticated
  USING (public.is_swap_participant(swap_id, auth.uid()));

-- ─────────────────────────────────────────────────────────────────────
-- 4. CONFLICT DETECTION — does a slot overlap an existing confirmed swap
--    for either of the two participants?
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.has_schedule_conflict(
  _swap_id UUID,
  _start TIMESTAMPTZ,
  _duration_minutes INT
) RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_req UUID;
  v_prov UUID;
  v_end TIMESTAMPTZ := _start + make_interval(mins => _duration_minutes);
BEGIN
  SELECT requester_id, provider_id INTO v_req, v_prov
  FROM public.swaps WHERE id = _swap_id;
  IF v_req IS NULL THEN RETURN false; END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.swaps s
    WHERE s.id <> _swap_id
      AND s.scheduled_at IS NOT NULL
      AND s.status IN ('accepted', 'active')
      AND (s.requester_id IN (v_req, v_prov) OR s.provider_id IN (v_req, v_prov))
      -- overlap test: new[start,end) overlaps existing[start,end)
      AND s.scheduled_at < v_end
      AND (s.scheduled_at + make_interval(mins => s.duration_minutes)) > _start
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.has_schedule_conflict(uuid, timestamptz, int) FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.has_schedule_conflict(uuid, timestamptz, int) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- 5. ACCEPT PROPOSAL — atomic, conflict-checked, supersedes others
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.accept_schedule_proposal(_proposal_id UUID)
RETURNS public.swap_schedule_proposals
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_p public.swap_schedule_proposals;
BEGIN
  SELECT * INTO v_p FROM public.swap_schedule_proposals WHERE id = _proposal_id FOR UPDATE;
  IF v_p.id IS NULL THEN RAISE EXCEPTION 'Proposal not found'; END IF;

  IF NOT public.is_swap_participant(v_p.swap_id, auth.uid()) THEN
    RAISE EXCEPTION 'Not a participant of this swap';
  END IF;
  IF v_p.proposed_by = auth.uid() THEN
    RAISE EXCEPTION 'You cannot accept your own proposal';
  END IF;
  IF v_p.status <> 'pending' THEN
    RAISE EXCEPTION 'Proposal is no longer pending';
  END IF;

  IF public.has_schedule_conflict(v_p.swap_id, v_p.proposed_for, v_p.duration_minutes) THEN
    RAISE EXCEPTION 'Time conflicts with another confirmed swap';
  END IF;

  -- Mark this one accepted, supersede other pending ones for the same swap.
  UPDATE public.swap_schedule_proposals
     SET status = 'accepted', responded_at = now(), responded_by = auth.uid()
   WHERE id = v_p.id
   RETURNING * INTO v_p;

  UPDATE public.swap_schedule_proposals
     SET status = 'superseded', responded_at = now(), responded_by = auth.uid()
   WHERE swap_id = v_p.swap_id AND id <> v_p.id AND status = 'pending';

  -- Write the confirmed slot onto the swap and move it to accepted if still pending.
  UPDATE public.swaps
     SET scheduled_at = v_p.proposed_for,
         duration_minutes = v_p.duration_minutes,
         status = CASE WHEN status = 'pending' THEN 'accepted'::public.swap_status ELSE status END
   WHERE id = v_p.swap_id;

  RETURN v_p;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.accept_schedule_proposal(uuid) FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.accept_schedule_proposal(uuid) TO authenticated;

-- Realtime
ALTER TABLE public.availability               REPLICA IDENTITY FULL;
ALTER TABLE public.swap_schedule_proposals    REPLICA IDENTITY FULL;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.availability;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.swap_schedule_proposals;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;