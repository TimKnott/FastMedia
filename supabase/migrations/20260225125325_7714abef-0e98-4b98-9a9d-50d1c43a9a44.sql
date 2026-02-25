
-- Update has_role to support role hierarchy (super_admin >= admin >= moderator >= editor >= user)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND (
        CASE ur.role
          WHEN 'super_admin' THEN 100
          WHEN 'admin' THEN 80
          WHEN 'moderator' THEN 60
          WHEN 'editor' THEN 40
          WHEN 'user' THEN 20
          ELSE 0
        END
      ) >= (
        CASE _role
          WHEN 'super_admin' THEN 100
          WHEN 'admin' THEN 80
          WHEN 'moderator' THEN 60
          WHEN 'editor' THEN 40
          WHEN 'user' THEN 20
          ELSE 0
        END
      )
  )
$$;

-- Fix user_roles RLS: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Permissive: users can read their own role
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Permissive: admins+ can manage all roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
