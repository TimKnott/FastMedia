ALTER TABLE public.outreach_messages
  ADD COLUMN IF NOT EXISTS proposed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS edited_by uuid,
  ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS rejected_by uuid,
  ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS test_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delivered_to text;

ALTER TABLE public.outreach_messages DROP CONSTRAINT IF EXISTS outreach_messages_status_chk;
ALTER TABLE public.outreach_messages ADD CONSTRAINT outreach_messages_status_chk
  CHECK (status = ANY (ARRAY['draft','pending_approval','approved','scheduled','sent','skipped','failed','cancelled','rejected']));

ALTER TABLE public.prospects DROP CONSTRAINT IF EXISTS prospects_status_chk;
ALTER TABLE public.prospects ADD CONSTRAINT prospects_status_chk
  CHECK (status = ANY (ARRAY['new','researching','researched','drafted','approved','sequencing','replied','won','lost','unsubscribed','suppressed']));

ALTER TABLE public.visitor_signals ADD COLUMN IF NOT EXISTS simulated boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.outreach_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id uuid REFERENCES public.prospects(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.outreach_messages(id) ON DELETE SET NULL,
  step integer,
  action text NOT NULL,
  actor_type text NOT NULL DEFAULT 'staff',
  actor_id uuid,
  actor_label text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.outreach_events TO authenticated;
GRANT ALL ON public.outreach_events TO service_role;
ALTER TABLE public.outreach_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view outreach events" ON public.outreach_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can delete outreach events" ON public.outreach_events
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE INDEX IF NOT EXISTS outreach_events_prospect_idx ON public.outreach_events (prospect_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.outreach_settings (
  id integer NOT NULL DEFAULT 1 PRIMARY KEY,
  test_mode boolean NOT NULL DEFAULT false,
  test_inbox text,
  simulate_visitors boolean NOT NULL DEFAULT false,
  follow_up_days_step2 integer NOT NULL DEFAULT 4,
  follow_up_days_step3 integer NOT NULL DEFAULT 9,
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT outreach_settings_single_row CHECK (id = 1)
);

GRANT SELECT, UPDATE ON public.outreach_settings TO authenticated;
GRANT ALL ON public.outreach_settings TO service_role;
ALTER TABLE public.outreach_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view outreach settings" ON public.outreach_settings
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'editor'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update outreach settings" ON public.outreach_settings
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

INSERT INTO public.outreach_settings (id, test_inbox) VALUES (1, 'support@fastmedia.pro')
ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER outreach_settings_updated_at BEFORE UPDATE ON public.outreach_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();