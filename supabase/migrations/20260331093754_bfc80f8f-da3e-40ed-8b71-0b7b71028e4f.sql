
-- Defense-in-depth: prevent inserting/updating a role with higher privilege than the current user
CREATE OR REPLACE FUNCTION public.validate_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_role_score integer;
  current_user_max_score integer;
BEGIN
  -- Map the new role to its numeric score
  new_role_score := CASE NEW.role
    WHEN 'super_admin' THEN 100
    WHEN 'admin' THEN 80
    WHEN 'moderator' THEN 60
    WHEN 'editor' THEN 40
    WHEN 'user' THEN 20
    ELSE 0
  END;

  -- Get the current user's highest role score
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

  -- Block if the assigned role is higher than the assigner's role
  IF new_role_score > current_user_max_score THEN
    RAISE EXCEPTION 'Cannot assign a role with higher privileges than your own.';
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger for INSERT and UPDATE on user_roles
CREATE TRIGGER trg_validate_role_assignment
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_assignment();
