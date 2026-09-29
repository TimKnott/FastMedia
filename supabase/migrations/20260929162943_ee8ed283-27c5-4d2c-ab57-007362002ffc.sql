CREATE TABLE public.flowlu_leads (
  id bigint PRIMARY KEY,
  name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  contact_company text,
  budget numeric,
  flowlu_created_at timestamptz,
  score integer NOT NULL DEFAULT 0,
  priority text NOT NULL DEFAULT 'low',
  score_reasons text[] NOT NULL DEFAULT '{}',
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  synced_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.flowlu_leads TO authenticated;
GRANT ALL ON public.flowlu_leads TO service_role;
ALTER TABLE public.flowlu_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view Flowlu leads" ON public.flowlu_leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.flowlu_lead_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flowlu_lead_id bigint NOT NULL,
  to_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  error text,
  flowlu_logged boolean NOT NULL DEFAULT false,
  sent_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flowlu_lead_replies TO authenticated;
GRANT ALL ON public.flowlu_lead_replies TO service_role;
ALTER TABLE public.flowlu_lead_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage Flowlu replies" ON public.flowlu_lead_replies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER flowlu_lead_replies_updated BEFORE UPDATE ON public.flowlu_lead_replies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

SELECT cron.schedule('flowlu-leads-daily', '15 5 * * *', $cron$
  SELECT net.http_post(
    url := 'https://aivnnjsrupmubcjsgulb.supabase.co/functions/v1/flowlu-admin',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' ||
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key')),
    body := '{"action":"pull_leads"}'::jsonb);
$cron$);