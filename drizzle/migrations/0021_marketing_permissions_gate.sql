CREATE TABLE public.marketing_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(btrim(email))),
  country text,
  contact_type text NOT NULL DEFAULT 'unknown' CHECK (contact_type IN ('generic_business_inbox','named_business_contact','sole_trader_personal','existing_customer','explicit_opt_in','enquiry_transactional_only','unknown')),
  gdpr_lawful_basis text NOT NULL DEFAULT 'unassessed',
  email_route text NOT NULL DEFAULT 'none' CHECK (email_route IN ('none','consent','existing_customer')),
  consent_at timestamptz, consent_text text, consent_source text, consent_sender text, consent_scope text, consent_revoked_at timestamptz,
  customer_sale_ref text, customer_collected_at timestamptz, customer_sender text, customer_similar_products boolean, customer_optout_offered_at_collection boolean,
  objection_at timestamptz,
  legal_review_by uuid, legal_review_at timestamptz, country_assessment_ref text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.marketing_permissions TO authenticated;
GRANT ALL ON public.marketing_permissions TO service_role;
ALTER TABLE public.marketing_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read permissions" ON public.marketing_permissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert permissions" ON public.marketing_permissions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update permissions" ON public.marketing_permissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.marketing_permission_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL,
  actor uuid,
  old_row jsonb,
  new_row jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.marketing_permission_audit TO authenticated;
GRANT ALL ON public.marketing_permission_audit TO service_role;
ALTER TABLE public.marketing_permission_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read permission audit" ON public.marketing_permission_audit FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.marketing_permissions_audit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  -- A review stamp is always the current admin; it cannot be forged from the client.
  IF TG_OP = 'INSERT' OR NEW.legal_review_at IS DISTINCT FROM OLD.legal_review_at THEN
    IF NEW.legal_review_at IS NOT NULL THEN NEW.legal_review_by := auth.uid(); NEW.legal_review_at := now(); END IF;
  END IF;
  INSERT INTO public.marketing_permission_audit(email, actor, old_row, new_row)
  VALUES (NEW.email, auth.uid(), CASE WHEN TG_OP='UPDATE' THEN to_jsonb(OLD) END, to_jsonb(NEW));
  RETURN NEW;
END $$;
CREATE TRIGGER trg_marketing_permissions_audit BEFORE INSERT OR UPDATE ON public.marketing_permissions FOR EACH ROW EXECUTE FUNCTION public.marketing_permissions_audit();