
-- Campaign Studio
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  objective text,
  audience text,
  industry text,
  offer text,
  cta text,
  destination_url text,
  hero_image_url text,
  copy jsonb NOT NULL DEFAULT '{}'::jsonb,
  assets jsonb NOT NULL DEFAULT '[]'::jsonb,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','finding','creating','sending','tracking','done','archived')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email','facebook','instagram','linkedin','tiktok','google','seznam','direct')),
  subject text,
  body text NOT NULL DEFAULT '',
  image_url text,
  cta text,
  destination_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','sent','published','failed')),
  approved_by uuid,
  approved_at timestamptz,
  sent_at timestamptz,
  outcome jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Partner programme
CREATE TABLE public.partner_programme_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_open boolean NOT NULL DEFAULT false,
  commission_type text NOT NULL DEFAULT 'percent' CHECK (commission_type IN ('percent','fixed')),
  commission_rate_bps int CHECK (commission_rate_bps IS NULL OR commission_rate_bps BETWEEN 0 AND 10000),
  fixed_commission_cents bigint CHECK (fixed_commission_cents IS NULL OR fixed_commission_cents >= 0),
  min_project_value_cents bigint NOT NULL DEFAULT 0,
  attribution_days int NOT NULL DEFAULT 90 CHECK (attribution_days BETWEEN 1 AND 730),
  terms text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.partner_programme_settings (id) VALUES (1);

CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  company text,
  website text,
  linkedin_url text,
  referral_code text NOT NULL UNIQUE DEFAULT upper(substr(md5(gen_random_uuid()::text), 1, 8)),
  status text NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect','applied','active','paused','rejected')),
  source text NOT NULL DEFAULT 'manual',
  consent_marketing boolean NOT NULL DEFAULT false,
  consent_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL,
  referral_code text,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  business_name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  website text,
  notes text,
  source text NOT NULL DEFAULT 'partner_form',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','contacted','qualified','won','lost')),
  project_value_cents bigint CHECK (project_value_cents IS NULL OR project_value_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  basis text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','void')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: admin only
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['campaigns','campaign_drafts','partner_programme_settings','partners','referrals','commissions'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format($p$CREATE POLICY "%s_admin_all" ON public.%I FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))$p$, t, t);
    EXECUTE format('CREATE TRIGGER %s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;

-- Public, validated entry points (no direct table access for visitors)
CREATE OR REPLACE FUNCTION public.register_partner(_name text, _email text, _phone text, _company text, _website text, _consent boolean)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE code text; recent int;
BEGIN
  IF coalesce(length(trim(_name)),0) < 2 OR length(_name) > 120 THEN RAISE EXCEPTION 'invalid name'; END IF;
  IF _email IS NULL OR _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(_email) > 255 THEN RAISE EXCEPTION 'invalid email'; END IF;
  SELECT count(*) INTO recent FROM partners WHERE created_at > now() - interval '1 hour' AND source = 'website';
  IF recent > 30 THEN RAISE EXCEPTION 'too many requests'; END IF;
  SELECT referral_code INTO code FROM partners WHERE lower(email) = lower(_email) LIMIT 1;
  IF code IS NOT NULL THEN RETURN code; END IF;
  INSERT INTO partners (name, email, phone, company, website, status, source, consent_marketing, consent_at)
  VALUES (trim(_name), lower(trim(_email)), left(_phone, 40), left(_company, 160), left(_website, 300), 'applied', 'website', coalesce(_consent,false), CASE WHEN _consent THEN now() END)
  RETURNING referral_code INTO code;
  RETURN code;
END $$;

CREATE OR REPLACE FUNCTION public.submit_referral(_code text, _business text, _contact text, _email text, _phone text, _website text, _notes text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid uuid; recent int;
BEGIN
  IF coalesce(length(trim(_business)),0) < 2 OR length(_business) > 160 THEN RAISE EXCEPTION 'invalid business'; END IF;
  IF _email IS NOT NULL AND _email <> '' AND _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'invalid email'; END IF;
  SELECT count(*) INTO recent FROM referrals WHERE created_at > now() - interval '1 hour';
  IF recent > 50 THEN RAISE EXCEPTION 'too many requests'; END IF;
  SELECT id INTO pid FROM partners WHERE referral_code = upper(trim(_code)) AND status IN ('applied','active');
  INSERT INTO referrals (partner_id, referral_code, business_name, contact_name, contact_email, contact_phone, website, notes, source)
  VALUES (pid, upper(left(trim(coalesce(_code,'')),20)), trim(_business), left(_contact,120), lower(left(_email,255)), left(_phone,40), left(_website,300), left(_notes,2000), CASE WHEN pid IS NULL THEN 'website_no_code' ELSE 'partner_form' END);
  RETURN pid IS NOT NULL;
END $$;

REVOKE ALL ON FUNCTION public.register_partner(text,text,text,text,text,boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_referral(text,text,text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_partner(text,text,text,text,text,boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_referral(text,text,text,text,text,text,text) TO anon, authenticated;
