CREATE OR REPLACE FUNCTION public.repository_suppress(_email text,_kind text,_reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE addr text:=lower(trim(_email)); BEGIN
 PERFORM public.repository_assert_admin(); IF _kind NOT IN ('objection','unsubscribe') OR addr !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR length(trim(_reason))=0 THEN RAISE EXCEPTION 'Invalid objection'; END IF;
 INSERT INTO public.suppressed_emails(email,reason,metadata) VALUES(addr,CASE WHEN _kind='objection' THEN 'complaint' ELSE 'unsubscribe' END,jsonb_build_object('source','lead_repository','kind',_kind,'evidence',_reason,'actor_id',auth.uid())) ON CONFLICT(email) DO NOTHING;
 INSERT INTO public.lead_repository_objections(email,kind,reason,actor_id) VALUES(addr,_kind,_reason,auth.uid());
 UPDATE public.lead_repository_emails SET compliance_status='SUPPRESSED',review=review || jsonb_build_object(CASE WHEN _kind='unsubscribe' THEN 'unsubscribed_at' ELSE 'objected_at' END,now()) WHERE email=addr;
 INSERT INTO public.lead_repository_events(action,actor_id,details) VALUES('suppression',auth.uid(),jsonb_build_object('kind',_kind));
END $$;
REVOKE ALL ON FUNCTION public.repository_suppress(text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.repository_suppress(text,text,text) TO authenticated;