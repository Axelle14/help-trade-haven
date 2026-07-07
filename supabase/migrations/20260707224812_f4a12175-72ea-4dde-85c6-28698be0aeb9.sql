
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'admin_list_users(text,int,int)',
    'admin_set_user_status(uuid,text,text)',
    'admin_delete_user(uuid,text)',
    'admin_set_user_role(uuid,app_role,text)',
    'admin_list_services(text,boolean,int,int)',
    'admin_set_service_active(uuid,boolean,text)',
    'admin_delete_service(uuid,text)',
    'admin_flag_service(uuid,text)',
    'admin_overview()',
    'admin_new_users_monthly(int)',
    'admin_services_by_category()',
    'admin_requests_by_status()',
    'admin_list_audit(int)',
    '_assert_admin()',
    '_write_audit(text,text,text,text,text,jsonb)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
  END LOOP;
END $$;
