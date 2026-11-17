GRANT EXECUTE ON FUNCTION public.is_city_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_city_moderator(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_moderator(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_blocked_between(uuid, uuid) TO authenticated;