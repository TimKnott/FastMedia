-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Drop any existing admin insert policy to avoid conflict
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;

-- Create restrictive admin-only INSERT policy
-- Note: SECURITY DEFINER triggers bypass RLS entirely, so they don't need this policy
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));