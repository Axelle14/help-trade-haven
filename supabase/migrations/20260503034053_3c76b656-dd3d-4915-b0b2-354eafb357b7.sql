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
    SELECT c.latitude, c.longitude, c.province INTO v_lat, v_lng, v_province
    FROM cities c WHERE c.id = _user_city_id;
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
  ORDER BY rank_bucket ASC,
           distance_km ASC NULLS LAST,
           coalesce(ts.score, 100) DESC,
           s.created_at DESC
  LIMIT _limit;
END;
$$;