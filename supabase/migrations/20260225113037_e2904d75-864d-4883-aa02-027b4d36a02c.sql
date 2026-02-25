-- Remove the overly permissive INSERT policy on audit_logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- The audit_log_changes() trigger function uses SECURITY DEFINER which bypasses RLS entirely.
-- No INSERT policy is needed for the trigger to work.
-- Only admins should be able to manually insert audit logs if needed.
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));