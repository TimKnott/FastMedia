
-- ============================================================
-- 1. LEADS TABLE: Add constraints and rate-limiting trigger
-- ============================================================

-- Email format constraint
DO $$ BEGIN
  ALTER TABLE public.leads ADD CONSTRAINT leads_email_format
    CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Name length constraint
DO $$ BEGIN
  ALTER TABLE public.leads ADD CONSTRAINT leads_name_length
    CHECK (char_length(name) BETWEEN 1 AND 200);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Email length constraint
DO $$ BEGIN
  ALTER TABLE public.leads ADD CONSTRAINT leads_email_length
    CHECK (char_length(email) <= 255);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Trade length constraint
DO $$ BEGIN
  ALTER TABLE public.leads ADD CONSTRAINT leads_trade_length
    CHECK (char_length(trade) BETWEEN 1 AND 100);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Rate limiting trigger: max 5 leads per email per hour
CREATE OR REPLACE FUNCTION public.check_lead_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.leads
  WHERE email = NEW.email
    AND created_at > now() - interval '1 hour';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  -- Normalize email
  NEW.email := lower(trim(NEW.email));
  NEW.name := trim(NEW.name);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_lead_rate_limit ON public.leads;
CREATE TRIGGER tr_lead_rate_limit
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.check_lead_rate_limit();

-- ============================================================
-- 2. NEWSLETTER_SUBSCRIBERS: Rate limiting and normalization
-- ============================================================

-- Rate limiting trigger: max 3 subscriptions per email per hour
CREATE OR REPLACE FUNCTION public.check_newsletter_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.newsletter_subscribers
  WHERE email = NEW.email
    AND subscribed_at > now() - interval '1 hour';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  -- Normalize email
  NEW.email := lower(trim(NEW.email));

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_newsletter_rate_limit ON public.newsletter_subscribers;
CREATE TRIGGER tr_newsletter_rate_limit
  BEFORE INSERT ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_newsletter_rate_limit();

-- ============================================================
-- 3. AUDIT LOGGING TRIGGERS
-- ============================================================

-- Generic audit log function
CREATE OR REPLACE FUNCTION public.audit_log_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_action text;
  audit_details jsonb;
  entity_id_val text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    audit_action := TG_OP;
    entity_id_val := NEW.id::text;
    audit_details := jsonb_build_object('new', to_jsonb(NEW));
    INSERT INTO public.audit_logs (action, entity_type, entity_id, details, user_id)
    VALUES (audit_action, TG_TABLE_NAME, entity_id_val, audit_details, auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    audit_action := TG_OP;
    entity_id_val := NEW.id::text;
    audit_details := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
    INSERT INTO public.audit_logs (action, entity_type, entity_id, details, user_id)
    VALUES (audit_action, TG_TABLE_NAME, entity_id_val, audit_details, auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    audit_action := TG_OP;
    entity_id_val := OLD.id::text;
    audit_details := jsonb_build_object('old', to_jsonb(OLD));
    INSERT INTO public.audit_logs (action, entity_type, entity_id, details, user_id)
    VALUES (audit_action, TG_TABLE_NAME, entity_id_val, audit_details, auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Audit triggers for user_roles (role changes)
DROP TRIGGER IF EXISTS tr_audit_user_roles ON public.user_roles;
CREATE TRIGGER tr_audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_changes();

-- Audit triggers for leads (status/assignment changes)
DROP TRIGGER IF EXISTS tr_audit_leads ON public.leads;
CREATE TRIGGER tr_audit_leads
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_changes();

-- Audit triggers for bookings
DROP TRIGGER IF EXISTS tr_audit_bookings ON public.bookings;
CREATE TRIGGER tr_audit_bookings
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_changes();

-- Audit triggers for scoring_rules changes
DROP TRIGGER IF EXISTS tr_audit_scoring_rules ON public.scoring_rules;
CREATE TRIGGER tr_audit_scoring_rules
  AFTER INSERT OR UPDATE OR DELETE ON public.scoring_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_changes();

-- Audit triggers for newsletter subscriber deletions
DROP TRIGGER IF EXISTS tr_audit_newsletter ON public.newsletter_subscribers;
CREATE TRIGGER tr_audit_newsletter
  AFTER DELETE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_changes();

-- ============================================================
-- 4. Allow audit_logs INSERT from triggers (SECURITY DEFINER covers this)
-- Update the INSERT policy to also allow system/trigger inserts
-- ============================================================
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);
