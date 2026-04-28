-- Enums
CREATE TYPE public.notification_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.notification_category AS ENUM (
  'message', 'swap_request', 'swap_update', 'match_suggestion', 'reward', 'system'
);

-- Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category public.notification_category NOT NULL,
  priority public.notification_priority NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  group_key TEXT,
  is_push_sent BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id, read_at, created_at DESC);
CREATE INDEX idx_notifications_user_group
  ON public.notifications (user_id, group_key, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Self-insert allowed (for client-side reward / suggestion notifications).
CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- ============================================================
-- Auto-dispatch triggers
-- ============================================================

-- Helper: notify recipient of a new message
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_a UUID; v_b UUID; v_recipient UUID;
  v_sender_name TEXT;
BEGIN
  SELECT participant_a, participant_b INTO v_a, v_b
  FROM public.conversations WHERE id = NEW.conversation_id;
  v_recipient := CASE WHEN NEW.sender_id = v_a THEN v_b ELSE v_a END;

  SELECT display_name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

  INSERT INTO public.notifications (user_id, category, priority, title, body, link, group_key, data)
  VALUES (
    v_recipient, 'message', 'high',
    COALESCE(v_sender_name, 'Someone') || ' sent you a message',
    LEFT(NEW.content, 140),
    '/chat/' || NEW.conversation_id::text,
    'conversation:' || NEW.conversation_id::text,
    jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id)
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_notify_on_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

-- New swap → notify provider
CREATE OR REPLACE FUNCTION public.notify_on_swap_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_requester_name TEXT;
BEGIN
  SELECT display_name INTO v_requester_name FROM public.profiles WHERE id = NEW.requester_id;

  INSERT INTO public.notifications (user_id, category, priority, title, body, link, group_key, data)
  VALUES (
    NEW.provider_id, 'swap_request', 'high',
    'New swap request from ' || COALESCE(v_requester_name, 'a user'),
    NEW.requester_offer_title || ' ⇄ ' || NEW.provider_offer_title,
    '/chat/swap/' || NEW.id::text,
    'swap:' || NEW.id::text,
    jsonb_build_object('swap_id', NEW.id)
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_notify_on_swap_insert
AFTER INSERT ON public.swaps
FOR EACH ROW EXECUTE FUNCTION public.notify_on_swap_insert();

-- Swap status change → notify the OTHER participant
CREATE OR REPLACE FUNCTION public.notify_on_swap_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor UUID; v_recipient UUID;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;
  v_actor := auth.uid();
  v_recipient := CASE WHEN v_actor = NEW.requester_id THEN NEW.provider_id ELSE NEW.requester_id END;
  IF v_recipient IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.notifications (user_id, category, priority, title, body, link, group_key, data)
  VALUES (
    v_recipient, 'swap_update', 'medium',
    'Swap ' || NEW.status::text,
    NEW.requester_offer_title || ' ⇄ ' || NEW.provider_offer_title,
    '/chat/swap/' || NEW.id::text,
    'swap:' || NEW.id::text,
    jsonb_build_object('swap_id', NEW.id, 'status', NEW.status)
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_notify_on_swap_status
AFTER UPDATE OF status ON public.swaps
FOR EACH ROW EXECUTE FUNCTION public.notify_on_swap_status();

-- New schedule proposal → notify the other participant
CREATE OR REPLACE FUNCTION public.notify_on_proposal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_req UUID; v_prov UUID; v_recipient UUID;
BEGIN
  SELECT requester_id, provider_id INTO v_req, v_prov FROM public.swaps WHERE id = NEW.swap_id;
  v_recipient := CASE WHEN NEW.proposed_by = v_req THEN v_prov ELSE v_req END;

  INSERT INTO public.notifications (user_id, category, priority, title, body, link, group_key, data)
  VALUES (
    v_recipient, 'swap_update', 'high',
    'New time proposed',
    to_char(NEW.proposed_for AT TIME ZONE 'UTC', 'Mon DD, HH24:MI') || ' UTC · ' || NEW.duration_minutes || ' min',
    '/chat/swap/' || NEW.swap_id::text,
    'swap:' || NEW.swap_id::text,
    jsonb_build_object('swap_id', NEW.swap_id, 'proposal_id', NEW.id)
  );
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_notify_on_proposal
AFTER INSERT ON public.swap_schedule_proposals
FOR EACH ROW EXECUTE FUNCTION public.notify_on_proposal();