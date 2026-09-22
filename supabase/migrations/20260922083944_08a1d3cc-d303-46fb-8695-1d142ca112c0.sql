-- Prospects for outbound prospecting
CREATE TABLE public.prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  contact_name text,
  email text NOT NULL,
  phone text,
  website text,
  region text,
  trade text,
  language text NOT NULL DEFAULT 'en',
  source text NOT NULL DEFAULT 'manual',
  source_id text,
  notes text,
  research jsonb NOT NULL DEFAULT '{}'::jsonb,
  fit_score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new',
  owner text,
  created_by uuid,
  last_contacted_at timestamptz,
  replied_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prospects_status_chk CHECK (status IN ('new','researching','researched','drafted','approved','sequencing','replied','won','lost','unsubscribed')),
  CONSTRAINT prospects_source_chk CHECK (source IN ('manual','import','enquiry','lead','visitor'))
);
CREATE UNIQUE INDEX prospects_email_key ON public.prospects (lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospects TO authenticated;
GRANT ALL ON public.prospects TO service_role;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view prospects" ON public.prospects FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "Staff can insert prospects" ON public.prospects FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "Staff can update prospects" ON public.prospects FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'))
  WITH CHECK (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "Admins can delete prospects" ON public.prospects FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));

CREATE TRIGGER prospects_updated_at BEFORE UPDATE ON public.prospects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Outbound messages (opener + autonomous follow-ups)
CREATE TABLE public.outreach_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  step integer NOT NULL DEFAULT 1,
  subject text NOT NULL,
  body text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  status text NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  error_message text,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT outreach_messages_status_chk CHECK (status IN ('draft','approved','scheduled','sent','skipped','failed','cancelled')),
  CONSTRAINT outreach_messages_step_uniq UNIQUE (prospect_id, step)
);
CREATE INDEX outreach_messages_due_idx ON public.outreach_messages (status, scheduled_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.outreach_messages TO authenticated;
GRANT ALL ON public.outreach_messages TO service_role;
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view outreach messages" ON public.outreach_messages FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "Staff can insert outreach messages" ON public.outreach_messages FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "Staff can update outreach messages" ON public.outreach_messages FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'))
  WITH CHECK (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "Admins can delete outreach messages" ON public.outreach_messages FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));

CREATE TRIGGER outreach_messages_updated_at BEFORE UPDATE ON public.outreach_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- On-site visitor conversion safeguards
CREATE TABLE public.visitor_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  page_path text NOT NULL DEFAULT '/',
  form_id text,
  name text,
  email text,
  phone text,
  language text NOT NULL DEFAULT 'cs',
  session_key text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  recovery_status text NOT NULL DEFAULT 'pending',
  recovered_at timestamptz,
  alerted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visitor_signals_kind_chk CHECK (kind IN ('exit_intent','form_abandoned','high_value')),
  CONSTRAINT visitor_signals_recovery_chk CHECK (recovery_status IN ('pending','emailed','skipped','converted','failed'))
);
CREATE INDEX visitor_signals_recovery_idx ON public.visitor_signals (recovery_status, created_at);
CREATE INDEX visitor_signals_session_idx ON public.visitor_signals (session_key);

GRANT SELECT, UPDATE ON public.visitor_signals TO authenticated;
GRANT ALL ON public.visitor_signals TO service_role;
ALTER TABLE public.visitor_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view visitor signals" ON public.visitor_signals FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));
CREATE POLICY "Staff can update visitor signals" ON public.visitor_signals FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'))
  WITH CHECK (has_role(auth.uid(),'editor') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin'));

CREATE TRIGGER visitor_signals_updated_at BEFORE UPDATE ON public.visitor_signals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();