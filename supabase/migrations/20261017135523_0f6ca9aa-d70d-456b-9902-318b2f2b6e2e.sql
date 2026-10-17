
CREATE UNIQUE INDEX IF NOT EXISTS commissions_referral_unique ON public.commissions(referral_id) WHERE status <> 'void';

CREATE OR REPLACE FUNCTION public.enforce_draft_transition()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    IF OLD.status <> 'draft' AND (NEW.body IS DISTINCT FROM OLD.body OR NEW.subject IS DISTINCT FROM OLD.subject) THEN
      RAISE EXCEPTION 'Only drafts can be edited';
    END IF;
    RETURN NEW;
  END IF;
  IF NOT (
    (OLD.status = 'draft' AND NEW.status = 'approved') OR
    (OLD.status = 'approved' AND NEW.status IN ('draft','sent','published','failed')) OR
    (OLD.status = 'failed' AND NEW.status = 'draft')
  ) THEN
    RAISE EXCEPTION 'Invalid draft status change % -> %', OLD.status, NEW.status;
  END IF;
  IF NEW.status IN ('sent','published') AND NEW.approved_at IS NULL THEN
    RAISE EXCEPTION 'Draft must be approved first';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER campaign_drafts_transition BEFORE UPDATE ON public.campaign_drafts FOR EACH ROW EXECUTE FUNCTION public.enforce_draft_transition();

CREATE OR REPLACE FUNCTION public.enforce_draft_insert()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status <> 'draft' THEN RAISE EXCEPTION 'New drafts must start as draft'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER campaign_drafts_insert BEFORE INSERT ON public.campaign_drafts FOR EACH ROW EXECUTE FUNCTION public.enforce_draft_insert();

CREATE OR REPLACE FUNCTION public.register_partner(_name text, _email text, _phone text, _company text, _website text, _consent boolean)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE code text; recent int; open_ boolean;
BEGIN
  SELECT is_open INTO open_ FROM partner_programme_settings WHERE id = 1;
  IF NOT coalesce(open_, false) THEN RAISE EXCEPTION 'programme closed'; END IF;
  IF coalesce(length(trim(_name)),0) < 2 OR length(_name) > 120 THEN RAISE EXCEPTION 'invalid name'; END IF;
  IF _email IS NULL OR _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(_email) > 255 THEN RAISE EXCEPTION 'invalid email'; END IF;
  SELECT count(*) INTO recent FROM partners WHERE created_at > now() - interval '1 hour' AND source = 'website';
  IF recent > 30 THEN RAISE EXCEPTION 'too many requests'; END IF;
  IF EXISTS (SELECT 1 FROM partners WHERE lower(email) = lower(trim(_email))) THEN
    RETURN 'EXISTS';
  END IF;
  INSERT INTO partners (name, email, phone, company, website, status, source, consent_marketing, consent_at)
  VALUES (trim(_name), lower(trim(_email)), left(_phone, 40), left(_company, 160), left(_website, 300), 'applied', 'website', coalesce(_consent,false), CASE WHEN _consent THEN now() END)
  RETURNING referral_code INTO code;
  RETURN code;
END $$;
