
-- ===== Storage: drop broad public SELECT policies (public buckets still serve direct URLs) =====
DROP POLICY IF EXISTS "Anyone can read site images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read blog images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can read demo images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read project snapshots" ON storage.objects;
DROP POLICY IF EXISTS "Public read blog audio" ON storage.objects;
DROP POLICY IF EXISTS "Deny anon list of storage objects" ON storage.objects;

-- ===== Revoke EXECUTE on internal SECURITY DEFINER functions =====
-- Trigger-only / server-only functions: no API caller should invoke these.
REVOKE EXECUTE ON FUNCTION public.audit_log_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_site_content_version() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_lead_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_newsletter_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_role_assignment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.client_projects_set_slug() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_admin_user() FROM PUBLIC, anon, authenticated;

-- Email queue helpers: only edge functions (service_role) need them.
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- Scheduler: invoked by cron / service_role only.
REVOKE EXECUTE ON FUNCTION public.publish_scheduled_blog_posts() FROM PUBLIC, anon, authenticated;

-- has_role and ensure_admin_role stay callable by signed-in users (needed by RLS + admin login self-heal).
-- Explicitly tighten anon for has_role since it's not needed there.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.ensure_admin_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_admin_role() TO authenticated, service_role;
