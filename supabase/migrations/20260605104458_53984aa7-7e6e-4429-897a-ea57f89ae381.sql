
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'audit_logs','email_send_log','inbound_emails','invoices',
    'lead_activities','lead_emails','lead_notes','lead_score_history',
    'recurring_invoices','scoring_rules','seo_alerts_log','seo_properties',
    'shifts','suppressed_emails'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Restrict read to admins" ON public.%I;', t);
    EXECUTE format(
      'CREATE POLICY "Restrict read to admins" ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''admin''::app_role));',
      t
    );
  END LOOP;
END $$;
