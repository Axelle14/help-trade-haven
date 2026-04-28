-- 1. Extend delivery_type enum to include 'both'
ALTER TYPE public.delivery_type ADD VALUE IF NOT EXISTS 'both';

-- 2. Add service_radius_km to services (city_id and delivery_type already exist)
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS service_radius_km integer NOT NULL DEFAULT 25;

-- 3. Backfill city_id from creator's primary city membership where missing
UPDATE public.services s
SET city_id = cm.city_id
FROM (
  SELECT DISTINCT ON (user_id) user_id, city_id
  FROM public.city_memberships
  ORDER BY user_id, joined_at ASC
) cm
WHERE s.city_id IS NULL AND cm.user_id = s.user_id;

-- 4. Index for fast city + active marketplace queries
CREATE INDEX IF NOT EXISTS idx_services_city_active
  ON public.services (city_id, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_services_category_active
  ON public.services (category, is_active);

-- 5. Helper: enforce in_person listings have a city
CREATE OR REPLACE FUNCTION public.enforce_service_city()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign creator's primary city if none provided
  IF NEW.city_id IS NULL THEN
    SELECT city_id INTO NEW.city_id
    FROM public.city_memberships
    WHERE user_id = NEW.user_id
    ORDER BY joined_at ASC
    LIMIT 1;
  END IF;

  IF NEW.delivery_type IN ('in_person'::delivery_type, 'both'::delivery_type)
     AND NEW.city_id IS NULL THEN
    RAISE EXCEPTION 'In-person and hybrid listings require a city. Join a city first.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_service_city ON public.services;
CREATE TRIGGER trg_enforce_service_city
  BEFORE INSERT OR UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.enforce_service_city();

-- 6. City marketplace stats RPC (active listings + trending categories + top providers + newest)
CREATE OR REPLACE FUNCTION public.city_marketplace_overview(_city_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total int;
  v_trending jsonb;
  v_top_providers jsonb;
  v_newest jsonb;
BEGIN
  SELECT count(*) INTO v_total
  FROM services
  WHERE is_active = true
    AND (city_id = _city_id OR delivery_type = 'online'::delivery_type);

  SELECT coalesce(jsonb_agg(t), '[]'::jsonb) INTO v_trending FROM (
    SELECT category, count(*)::int AS listing_count
    FROM services
    WHERE is_active = true AND city_id = _city_id
    GROUP BY category
    ORDER BY listing_count DESC
    LIMIT 6
  ) t;

  SELECT coalesce(jsonb_agg(t), '[]'::jsonb) INTO v_top_providers FROM (
    SELECT p.id, p.display_name, p.avatar_url,
           coalesce(ts.score, 100)::int AS trust_score,
           count(s.id)::int AS active_listings
    FROM services s
    JOIN profiles p ON p.id = s.user_id
    LEFT JOIN trust_scores ts ON ts.user_id = s.user_id
    WHERE s.is_active = true AND s.city_id = _city_id
    GROUP BY p.id, p.display_name, p.avatar_url, ts.score
    ORDER BY trust_score DESC, active_listings DESC
    LIMIT 6
  ) t;

  SELECT coalesce(jsonb_agg(t), '[]'::jsonb) INTO v_newest FROM (
    SELECT s.id, s.title, s.category, s.point_price, s.delivery_type,
           s.created_at, p.display_name, p.avatar_url
    FROM services s
    JOIN profiles p ON p.id = s.user_id
    WHERE s.is_active = true AND s.city_id = _city_id
    ORDER BY s.created_at DESC
    LIMIT 8
  ) t;

  RETURN jsonb_build_object(
    'total_active', v_total,
    'trending_categories', v_trending,
    'top_providers', v_top_providers,
    'newest', v_newest
  );
END $$;

-- 7. Ranked browse: same city, then same province (by distance), then online
CREATE OR REPLACE FUNCTION public.browse_services(_user_city_id uuid DEFAULT NULL, _limit int DEFAULT 50)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  description text,
  category text,
  point_price int,
  delivery_type delivery_type,
  service_radius_km int,
  city_id uuid,
  city_name text,
  province text,
  created_at timestamptz,
  display_name text,
  avatar_url text,
  trust_score int,
  rank_bucket int,
  distance_km numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lat numeric; v_lng numeric; v_province text;
BEGIN
  IF _user_city_id IS NOT NULL THEN
    SELECT latitude, longitude, province INTO v_lat, v_lng, v_province
    FROM cities WHERE id = _user_city_id;
  END IF;

  RETURN QUERY
  SELECT
    s.id, s.user_id, s.title, s.description, s.category, s.point_price,
    s.delivery_type, s.service_radius_km, s.city_id,
    c.name AS city_name, c.province,
    s.created_at,
    p.display_name, p.avatar_url,
    coalesce(ts.score, 100)::int AS trust_score,
    CASE
      WHEN _user_city_id IS NOT NULL AND s.city_id = _user_city_id THEN 1
      WHEN v_province IS NOT NULL AND c.province = v_province
           AND s.delivery_type IN ('in_person'::delivery_type, 'both'::delivery_type) THEN 2
      WHEN s.delivery_type IN ('online'::delivery_type, 'both'::delivery_type) THEN 3
      ELSE 4
    END AS rank_bucket,
    CASE
      WHEN v_lat IS NOT NULL AND c.latitude IS NOT NULL THEN
        round((
          6371 * acos(
            least(1, greatest(-1,
              cos(radians(v_lat)) * cos(radians(c.latitude)) *
              cos(radians(c.longitude) - radians(v_lng)) +
              sin(radians(v_lat)) * sin(radians(c.latitude))
            ))
          )
        )::numeric, 1)
      ELSE NULL
    END AS distance_km
  FROM services s
  LEFT JOIN cities c ON c.id = s.city_id
  JOIN profiles p ON p.id = s.user_id
  LEFT JOIN trust_scores ts ON ts.user_id = s.user_id
  WHERE s.is_active = true
    AND (
      s.city_id = _user_city_id
      OR (v_province IS NOT NULL AND c.province = v_province)
      OR s.delivery_type IN ('online'::delivery_type, 'both'::delivery_type)
    )
  ORDER BY rank_bucket ASC,
           distance_km ASC NULLS LAST,
           trust_score DESC,
           s.created_at DESC
  LIMIT _limit;
END $$;