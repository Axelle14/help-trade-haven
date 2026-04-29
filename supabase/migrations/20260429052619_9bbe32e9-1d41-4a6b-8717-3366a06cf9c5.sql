-- Device tokens for push notifications (APNs / FCM)
CREATE TABLE public.device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios','android','web')),
  device_name text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);
CREATE INDEX idx_device_tokens_user ON public.device_tokens(user_id);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tokens - select"
  ON public.device_tokens FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tokens - insert"
  ON public.device_tokens FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own tokens - update"
  ON public.device_tokens FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tokens - delete"
  ON public.device_tokens FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins read all tokens"
  ON public.device_tokens FOR SELECT TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

-- Notification preferences
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY,
  messages boolean NOT NULL DEFAULT true,
  booking_updates boolean NOT NULL DEFAULT true,
  new_requests boolean NOT NULL DEFAULT true,
  promotions boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own prefs"
  ON public.notification_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own prefs"
  ON public.notification_preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prefs"
  ON public.notification_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_notification_preferences_touch
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();