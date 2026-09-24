CREATE OR REPLACE FUNCTION public.flowlu_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://aivnnjsrupmubcjsgulb.supabase.co/functions/v1/flowlu-admin',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' ||
        (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key')),
      body := '{"action":"sync","limit":5}'::jsonb);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NULL;
END; $$;
REVOKE EXECUTE ON FUNCTION public.flowlu_notify() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER flowlu_on_lead AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.flowlu_notify();
CREATE TRIGGER flowlu_on_enquiry AFTER INSERT ON public.contact_enquiries FOR EACH ROW EXECUTE FUNCTION public.flowlu_notify();
CREATE TRIGGER flowlu_on_call_end AFTER UPDATE OF ended_at ON public.voice_calls FOR EACH ROW WHEN (OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL) EXECUTE FUNCTION public.flowlu_notify();