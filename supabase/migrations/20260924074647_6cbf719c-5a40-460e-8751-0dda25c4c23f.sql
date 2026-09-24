CREATE OR REPLACE FUNCTION public.prospects_lower_email() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.email := lower(trim(NEW.email)); RETURN NEW; END; $$;
CREATE TRIGGER prospects_lower_email BEFORE INSERT OR UPDATE OF email ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.prospects_lower_email();
CREATE UNIQUE INDEX IF NOT EXISTS prospects_email_plain_key ON public.prospects (email);