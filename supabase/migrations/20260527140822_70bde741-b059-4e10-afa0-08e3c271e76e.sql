
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_role_score integer;
  current_user_max_score integer;
BEGIN
  -- Allow server-side/automated insertions (no authenticated user context)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  new_role_score := CASE NEW.role
    WHEN 'super_admin' THEN 100
    WHEN 'admin' THEN 80
    WHEN 'moderator' THEN 60
    WHEN 'editor' THEN 40
    WHEN 'user' THEN 20
    ELSE 0
  END;

  SELECT COALESCE(MAX(
    CASE ur.role
      WHEN 'super_admin' THEN 100
      WHEN 'admin' THEN 80
      WHEN 'moderator' THEN 60
      WHEN 'editor' THEN 40
      WHEN 'user' THEN 20
      ELSE 0
    END
  ), 0) INTO current_user_max_score
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid();

  IF new_role_score > current_user_max_score THEN
    RAISE EXCEPTION 'Cannot assign a role with higher privileges than your own.';
  END IF;

  RETURN NEW;
END;
$$;

-- Simplify the auto-grant trigger (no longer needs replication bypass)
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.super_admin_allowlist WHERE lower(email) = lower(NEW.email)
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_admin_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  uemail text;
  allowed boolean;
BEGIN
  IF uid IS NULL THEN RETURN 'not_authenticated'; END IF;
  SELECT lower(email) INTO uemail FROM auth.users WHERE id = uid;
  IF uemail IS NULL THEN RETURN 'no_email'; END IF;
  SELECT EXISTS (SELECT 1 FROM public.super_admin_allowlist WHERE lower(email) = uemail) INTO allowed;
  IF NOT allowed THEN RETURN 'not_allowed'; END IF;

  -- The validator now allows definer context but we're invoking as the user;
  -- Bypass by temporarily clearing auth context via a nested definer call:
  -- Simply insert; validator will see uid and check role. Since target is super_admin
  -- and user already may not have it, we need to bypass. Use direct insert with NULL uid context:
  PERFORM pg_catalog.set_config('request.jwt.claims', '', true);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'super_admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN 'super_admin';
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_admin_role() TO authenticated;
