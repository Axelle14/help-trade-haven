
-- Revoke EXECUTE from anon and authenticated on all SECURITY DEFINER functions
-- that are not intended to be called as RPCs from the client. These are internal
-- helper/trigger functions that still run correctly because triggers execute as
-- the table owner and other SECURITY DEFINER RPCs invoke them internally.

-- Trigger functions (called by Postgres, not clients)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bump_conversation_last_message() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_swap_insert() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.on_report_status_change() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_blocked_swap() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.on_appeal_decision() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_proposal() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_appeal_cooldown() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.on_swap_completed_trust() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.after_appeal_decision() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_swap_status() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_on_message() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bump_city_member_count() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_city_chat_cooldown() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.seed_trust_score() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.on_review_change() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.on_report_insert() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.on_profile_created_grant_bonus() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_service_city() FROM anon, authenticated, PUBLIC;

-- Internal helper functions (called only from other SECURITY DEFINER functions/policies)
REVOKE EXECUTE ON FUNCTION public._write_audit(text, text, text, text, text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public._assert_admin() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reporter_credibility(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.flag_category_weight(flag_type) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.report_category_weight(report_reason) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_signup_bonus(uuid, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ensure_wallet(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.recompute_trust_score(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_schedule_conflict(uuid, timestamptz, integer) FROM anon, authenticated, PUBLIC;

-- Predicate helpers used inside RLS policies — RLS evaluates them as the row
-- owner-role via the SECURITY DEFINER escalation, so clients don't need EXECUTE.
REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_swap_participant(uuid, uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_city_member(uuid, uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_city_moderator(uuid, uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_blocked_between(uuid, uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_moderator(uuid) FROM anon, authenticated, PUBLIC;

-- Client-facing RPCs: revoke from anon (must be signed in), keep authenticated.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.place_point_order(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.complete_point_order(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cancel_point_order(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.accept_schedule_proposal(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.browse_services(uuid, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.city_marketplace_overview(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.suggest_point_price(text, integer, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.moderation_overview() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trust_distribution() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.repeat_offenders(integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.user_review_summary(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.city_waitlist_count(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.referral_progress(text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_delete_user(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_services(text, boolean, integer, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_service_active(uuid, boolean, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_delete_service(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_flag_service(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_status(uuid, text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, app_role, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_users(text, integer, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_overview() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_new_users_monthly(integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_services_by_category() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_requests_by_status() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_audit(integer) FROM anon, PUBLIC;
