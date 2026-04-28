-- ─────────────────────────────────────────────────────────────────────
-- 1. Wipe old user-pair chat data (no production data yet)
-- ─────────────────────────────────────────────────────────────────────
DELETE FROM public.messages;
DELETE FROM public.conversations;

-- ─────────────────────────────────────────────────────────────────────
-- 2. Swap status enum + swaps table
-- ─────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.swap_status AS ENUM
    ('pending', 'accepted', 'active', 'completed', 'cancelled', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  provider_id  UUID NOT NULL,
  requester_offer_title TEXT NOT NULL,
  provider_offer_title  TEXT NOT NULL,
  requester_skill TEXT,
  provider_skill  TEXT,
  status public.swap_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT swaps_distinct_parties CHECK (requester_id <> provider_id)
);

CREATE INDEX swaps_requester_idx ON public.swaps (requester_id);
CREATE INDEX swaps_provider_idx  ON public.swaps (provider_id);
CREATE INDEX swaps_status_idx    ON public.swaps (status);

ALTER TABLE public.swaps ENABLE ROW LEVEL SECURITY;

-- Reusable: am I a party to this swap?
CREATE OR REPLACE FUNCTION public.is_swap_participant(_swap_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.swaps
    WHERE id = _swap_id
      AND (_user_id = requester_id OR _user_id = provider_id)
  )
$$;

CREATE POLICY "Participants can view their swaps"
  ON public.swaps FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = provider_id);

CREATE POLICY "Users can create swaps they are part of"
  ON public.swaps FOR INSERT
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = provider_id);

CREATE POLICY "Participants can update their swaps"
  ON public.swaps FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = provider_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER swaps_touch_updated_at
  BEFORE UPDATE ON public.swaps
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 3. Pivot conversations to be 1:1 with a swap
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.conversations
  ADD COLUMN swap_id UUID NOT NULL
    REFERENCES public.swaps(id) ON DELETE CASCADE;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_swap_unique UNIQUE (swap_id);

CREATE INDEX conversations_swap_idx ON public.conversations (swap_id);

-- Replace participant check to derive from the swap (single source of truth)
CREATE OR REPLACE FUNCTION public.is_conversation_participant(
  _conversation_id UUID, _user_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations c
    JOIN public.swaps s ON s.id = c.swap_id
    WHERE c.id = _conversation_id
      AND (_user_id = s.requester_id OR _user_id = s.provider_id)
  )
$$;

-- Replace conversations RLS to use the swap as truth
DROP POLICY IF EXISTS "Participants can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations they are part of" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update last_message_at" ON public.conversations;

CREATE POLICY "Participants can view their swap conversation"
  ON public.conversations FOR SELECT
  USING (public.is_swap_participant(swap_id, auth.uid()));

CREATE POLICY "Participants can create swap conversation"
  ON public.conversations FOR INSERT
  WITH CHECK (
    public.is_swap_participant(swap_id, auth.uid())
    AND (auth.uid() = participant_a OR auth.uid() = participant_b)
  );

CREATE POLICY "Participants can update last_message_at"
  ON public.conversations FOR UPDATE
  USING (public.is_swap_participant(swap_id, auth.uid()));

-- ─────────────────────────────────────────────────────────────────────
-- 4. Realtime
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.swaps         REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages      REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.swaps;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;