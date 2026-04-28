REVOKE EXECUTE ON FUNCTION public.browse_services(uuid, int) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.city_marketplace_overview(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.browse_services(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.city_marketplace_overview(uuid) TO authenticated;