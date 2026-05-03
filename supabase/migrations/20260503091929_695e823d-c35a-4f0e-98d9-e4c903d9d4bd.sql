-- Revoke public/anon/authenticated EXECUTE on internal SECURITY DEFINER functions
-- These are only meant to be called by triggers or edge functions (service_role)

-- Email queue helpers (called by edge functions via service_role)
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- Trigger-only functions (never called directly by clients)
REVOKE EXECUTE ON FUNCTION public.audit_log_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_site_content_version() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_lead_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_newsletter_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_role_assignment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role: keep callable by authenticated users (RLS policies use it).
-- Revoke from anon since unauthenticated users have no role to check.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;