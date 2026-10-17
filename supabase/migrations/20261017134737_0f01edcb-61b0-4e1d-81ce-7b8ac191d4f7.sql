
CREATE OR REPLACE FUNCTION public.get_partner_programme_public()
RETURNS TABLE(is_open boolean, terms text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT is_open, terms FROM partner_programme_settings WHERE id = 1;
$$;
REVOKE ALL ON FUNCTION public.get_partner_programme_public() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_partner_programme_public() TO anon, authenticated;
