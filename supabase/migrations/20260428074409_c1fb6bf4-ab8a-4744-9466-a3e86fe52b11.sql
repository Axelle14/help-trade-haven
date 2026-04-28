-- ============================================================
-- SERVICES (what each user offers)
-- ============================================================
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  city_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT services_title_len CHECK (length(btrim(title)) BETWEEN 2 AND 120),
  CONSTRAINT services_category_len CHECK (length(btrim(category)) BETWEEN 2 AND 60)
);

CREATE INDEX idx_services_user ON public.services(user_id);
CREATE INDEX idx_services_browse ON public.services(is_active, city_id, category);
CREATE INDEX idx_services_tags ON public.services USING GIN(tags);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active services viewable by signed-in users"
ON public.services FOR SELECT TO authenticated
USING (is_active = true OR auth.uid() = user_id);

CREATE POLICY "Users create their own services"
ON public.services FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own services"
ON public.services FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own services"
ON public.services FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Mods moderate services"
ON public.services FOR UPDATE TO authenticated
USING (public.is_admin_or_moderator(auth.uid()))
WITH CHECK (public.is_admin_or_moderator(auth.uid()));

CREATE TRIGGER trg_services_updated
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- REVIEWS (after completed swap)
-- ============================================================
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  swap_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  rating SMALLINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_comment_len CHECK (comment IS NULL OR length(comment) <= 1000),
  CONSTRAINT reviews_no_self CHECK (reviewer_id <> reviewee_id),
  CONSTRAINT reviews_unique_per_swap UNIQUE (swap_id, reviewer_id)
);

CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_swap ON public.reviews(swap_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by signed-in users"
ON public.reviews FOR SELECT TO authenticated USING (true);

CREATE POLICY "Participants leave reviews"
ON public.reviews FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = reviewer_id
  AND public.is_swap_participant(swap_id, auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.swaps s
    WHERE s.id = swap_id
      AND s.status = 'completed'
      AND reviewee_id IN (s.requester_id, s.provider_id)
      AND reviewee_id <> auth.uid()
  )
);

CREATE POLICY "Reviewer edits their review"
ON public.reviews FOR UPDATE TO authenticated
USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);

-- Recompute reviewee trust score on new/updated review
CREATE OR REPLACE FUNCTION public.on_review_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recompute_trust_score(NEW.reviewee_id);
  RETURN NEW;
END $$;

CREATE TRIGGER trg_review_trust
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.on_review_change();

-- Aggregate helper for profile pages
CREATE OR REPLACE FUNCTION public.user_review_summary(_user_id UUID)
RETURNS TABLE(avg_rating NUMERIC, review_count INT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT ROUND(AVG(rating)::NUMERIC, 2), COUNT(*)::INT
  FROM public.reviews WHERE reviewee_id = _user_id
$$;