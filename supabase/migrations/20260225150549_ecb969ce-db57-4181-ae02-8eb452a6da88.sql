-- Fix: Replace overly permissive audit_logs INSERT policy with admin-only policy
-- The audit_log_changes() trigger uses SECURITY DEFINER which bypasses RLS,
-- so this permissive policy is unnecessary and creates a security hole.

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;

CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));