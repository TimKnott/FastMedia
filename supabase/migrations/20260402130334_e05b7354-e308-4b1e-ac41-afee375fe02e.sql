-- Fix 1: Add RESTRICTIVE policy on user_roles to explicitly block non-super-admin writes
-- This ensures even if a future permissive policy is added, writes still require super_admin
CREATE POLICY "Only super admins can write roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Fix 2: Add explicit deny for anon role on employees table
-- RLS is enabled and no anon policy exists, but this makes the intent explicit
CREATE POLICY "Anon users cannot access employees"
ON public.employees
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);