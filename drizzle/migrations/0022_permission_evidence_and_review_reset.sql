ALTER TABLE public.marketing_permissions
  ADD COLUMN IF NOT EXISTS consent_method text,
  ADD COLUMN IF NOT EXISTS consent_text_version text,
  ADD COLUMN IF NOT EXISTS consent_proof_ref text;

CREATE OR REPLACE FUNCTION public.marketing_permissions_audit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  NEW.email := lower(trim(NEW.email));
  -- Any evidence change voids the prior review: a reviewer cannot keep an old stamp on new evidence.
  IF TG_OP = 'UPDATE' AND NEW.legal_review_at IS NOT DISTINCT FROM OLD.legal_review_at AND (
       (to_jsonb(NEW) - ARRAY['updated_at','legal_review_at','legal_review_by','notes'])
       IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['updated_at','legal_review_at','legal_review_by','notes'])) THEN
    NEW.legal_review_at := NULL; NEW.legal_review_by := NULL;
  END IF;
  -- A review stamp is always the current signed-in user and now(); it cannot be forged from the client.
  IF TG_OP = 'INSERT' OR NEW.legal_review_at IS DISTINCT FROM OLD.legal_review_at THEN
    IF NEW.legal_review_at IS NOT NULL THEN
      IF auth.uid() IS NULL THEN NEW.legal_review_at := NULL; NEW.legal_review_by := NULL;
      ELSE NEW.legal_review_by := auth.uid(); NEW.legal_review_at := now(); END IF;
    ELSE NEW.legal_review_by := NULL;
    END IF;
  END IF;
  INSERT INTO public.marketing_permission_audit(email, actor, old_row, new_row)
  VALUES (NEW.email, auth.uid(), CASE WHEN TG_OP='UPDATE' THEN to_jsonb(OLD) END, to_jsonb(NEW));
  RETURN NEW;
END $$;