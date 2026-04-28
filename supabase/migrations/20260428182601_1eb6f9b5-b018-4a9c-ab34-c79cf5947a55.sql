-- 1) Fix city_waitlist: require authentication + bind user_id to auth.uid()
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.city_waitlist;

CREATE POLICY "Authenticated users join waitlist"
ON public.city_waitlist
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND length(btrim(name)) BETWEEN 1 AND 100
  AND length(btrim(email)) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(btrim(skill_offered)) BETWEEN 1 AND 200
  AND length(btrim(skill_needed)) BETWEEN 1 AND 200
  AND (phone IS NULL OR length(phone) <= 30)
);

-- Enforce non-null user_id going forward (existing rows untouched)
ALTER TABLE public.city_waitlist
  ALTER COLUMN user_id SET NOT NULL;

-- 2) Fix notifications: remove self-insert policy.
-- Triggers are SECURITY DEFINER and bypass RLS, so legitimate notification
-- creation continues to work. Service role also bypasses RLS.
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
