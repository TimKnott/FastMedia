CREATE TABLE public.lead_repository_leads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lead_key text NOT NULL UNIQUE,
 person_name text NOT NULL DEFAULT '', company text NOT NULL DEFAULT '', segment text NOT NULL DEFAULT '', industry text NOT NULL DEFAULT '', location text NOT NULL DEFAULT '', country text NOT NULL DEFAULT '', linkedin_url text NOT NULL DEFAULT '',
 source_rows jsonb NOT NULL DEFAULT '[]', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lead_repository_leads TO authenticated;
GRANT ALL ON public.lead_repository_leads TO service_role;
ALTER TABLE public.lead_repository_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY repository_admin_read ON public.lead_repository_leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY repository_admin_boundary ON public.lead_repository_leads AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TABLE public.lead_repository_emails (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lead_id uuid NOT NULL REFERENCES public.lead_repository_leads(id) ON DELETE CASCADE,
 email text NOT NULL, validation_status text NOT NULL DEFAULT '', source_rows jsonb NOT NULL DEFAULT '[]', review jsonb NOT NULL DEFAULT '{}',
 compliance_status text NOT NULL DEFAULT 'UNASSESSED' CHECK (compliance_status IN ('UNASSESSED','REVIEWED','SUPPRESSED')),
 campaign_status text NOT NULL DEFAULT 'HOLD' CHECK (campaign_status='HOLD'), reviewed_by uuid, reviewed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(lead_id,email), CHECK(email=lower(trim(email)))
);
GRANT SELECT ON public.lead_repository_emails TO authenticated;
GRANT ALL ON public.lead_repository_emails TO service_role;
ALTER TABLE public.lead_repository_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY repository_admin_read ON public.lead_repository_emails FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY repository_admin_boundary ON public.lead_repository_emails AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX repository_email_lookup ON public.lead_repository_emails(email);
CREATE TABLE public.lead_repository_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), action text NOT NULL, entity_id text, details jsonb NOT NULL DEFAULT '{}', actor_id uuid, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lead_repository_events TO authenticated;
GRANT ALL ON public.lead_repository_events TO service_role;
ALTER TABLE public.lead_repository_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY repository_admin_read ON public.lead_repository_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY repository_admin_boundary ON public.lead_repository_events AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TABLE public.lead_repository_campaigns (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, message jsonb NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'DRY_RUN' CHECK(status='DRY_RUN'), created_by uuid, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lead_repository_campaigns TO authenticated;
GRANT ALL ON public.lead_repository_campaigns TO service_role;
ALTER TABLE public.lead_repository_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY repository_admin_read ON public.lead_repository_campaigns FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY repository_admin_boundary ON public.lead_repository_campaigns AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TABLE public.lead_repository_recipients (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), campaign_id uuid NOT NULL REFERENCES public.lead_repository_campaigns(id) ON DELETE CASCADE,
 email_id uuid REFERENCES public.lead_repository_emails(id) ON DELETE SET NULL, email text NOT NULL, decision jsonb NOT NULL, status text NOT NULL DEFAULT 'HOLD' CHECK(status='HOLD'), sent_at timestamptz CHECK(sent_at IS NULL), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(campaign_id,email)
);
GRANT SELECT ON public.lead_repository_recipients TO authenticated;
GRANT ALL ON public.lead_repository_recipients TO service_role;
ALTER TABLE public.lead_repository_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY repository_admin_read ON public.lead_repository_recipients FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY repository_admin_boundary ON public.lead_repository_recipients AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TABLE public.lead_repository_objections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL, kind text NOT NULL CHECK(kind IN ('objection','unsubscribe')), reason text NOT NULL, actor_id uuid, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lead_repository_objections TO authenticated;
GRANT ALL ON public.lead_repository_objections TO service_role;
ALTER TABLE public.lead_repository_objections ENABLE ROW LEVEL SECURITY;
CREATE POLICY repository_admin_read ON public.lead_repository_objections FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY repository_admin_boundary ON public.lead_repository_objections AS RESTRICTIVE FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.repository_assert_admin() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin authorization required' USING ERRCODE='42501'; END IF; END $$;
REVOKE ALL ON FUNCTION public.repository_assert_admin() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.repository_assert_admin() TO authenticated;
CREATE OR REPLACE FUNCTION public.repository_import(_kind text,_filename text,_rows jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb; lid uuid; eid uuid; k text; addr text; src jsonb; n int:=0; skipped int:=0; errors jsonb:='[]'; affected int; idx int:=0;
BEGIN
 PERFORM public.repository_assert_admin();
 IF _kind NOT IN ('leads','emails','compliance_review') OR jsonb_typeof(_rows)<>'array' OR jsonb_array_length(_rows)>1000 OR length(trim(_filename))=0 THEN RAISE EXCEPTION 'Invalid import batch'; END IF;
 FOR r IN SELECT value FROM jsonb_array_elements(_rows) LOOP
 idx:=idx+1;
 BEGIN
 k:=trim(coalesce(r->>'lead_key','')); IF k='' THEN RAISE EXCEPTION 'Missing lead_key'; END IF;
 src:=jsonb_build_object('file',_filename,'kind',_kind,'row',r);
 IF _kind='leads' THEN
 INSERT INTO public.lead_repository_leads(lead_key,person_name,company,segment,industry,location,country,linkedin_url,source_rows)
 VALUES(k,coalesce(r->>'person_name',r->>'full_name',r->>'name',concat_ws(' ',r->>'first_name',r->>'last_name'),''),coalesce(r->>'company',r->>'company_name',''),coalesce(r->>'segment',''),coalesce(r->>'industry',r->>'company_industry',''),coalesce(r->>'location',r->>'city',''),coalesce(r->>'country',''),coalesce(r->>'linkedin_url',r->>'linkedin',''),jsonb_build_array(src))
 ON CONFLICT(lead_key) DO UPDATE SET source_rows=lead_repository_leads.source_rows || EXCLUDED.source_rows WHERE NOT lead_repository_leads.source_rows @> EXCLUDED.source_rows;
 GET DIAGNOSTICS affected=ROW_COUNT;
 ELSE
 SELECT id INTO lid FROM public.lead_repository_leads WHERE lead_key=k; IF lid IS NULL THEN RAISE EXCEPTION 'Unknown lead_key'; END IF;
 addr:=lower(trim(coalesce(r->>'email',r->>'email_address',''))); IF addr !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Missing or malformed email'; END IF;
 INSERT INTO public.lead_repository_emails(lead_id,email,validation_status,source_rows)
 VALUES(lid,addr,coalesce(r->>'original_validation_status',r->>'validation_status',r->>'email_status',r->>'status',''),jsonb_build_array(src))
 ON CONFLICT(lead_id,email) DO UPDATE SET source_rows=lead_repository_emails.source_rows || EXCLUDED.source_rows WHERE NOT lead_repository_emails.source_rows @> EXCLUDED.source_rows;
 GET DIAGNOSTICS affected=ROW_COUNT;
 END IF;
 IF affected=0 THEN skipped:=skipped+1; ELSE n:=n+1; END IF;
 EXCEPTION WHEN OTHERS THEN errors:=errors || jsonb_build_array(jsonb_build_object('row',idx,'reason',SQLERRM)); END;
 END LOOP;
 INSERT INTO public.lead_repository_events(action,details,actor_id) VALUES('import',jsonb_build_object('file',_filename,'kind',_kind,'imported_or_provenance_updated',n,'skipped',skipped,'errors',errors),auth.uid());
 RETURN jsonb_build_object('imported_or_provenance_updated',n,'skipped',skipped,'errors',errors);
END $$;
REVOKE ALL ON FUNCTION public.repository_import(text,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.repository_import(text,text,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.repository_review(_email_id uuid,_review jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM public.repository_assert_admin(); IF jsonb_typeof(_review)<>'object' THEN RAISE EXCEPTION 'Invalid review'; END IF;
 UPDATE public.lead_repository_emails SET review=_review,reviewed_by=auth.uid(),reviewed_at=now(),compliance_status=CASE WHEN EXISTS(SELECT 1 FROM public.suppressed_emails s WHERE lower(trim(s.email))=lead_repository_emails.email) THEN 'SUPPRESSED' ELSE 'REVIEWED' END WHERE id=_email_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown email'; END IF;
 INSERT INTO public.lead_repository_events(action,entity_id,actor_id,details) VALUES('review',_email_id::text,auth.uid(),jsonb_build_object('changed_fields',(SELECT jsonb_agg(key) FROM jsonb_object_keys(_review) key)));
END $$;
REVOKE ALL ON FUNCTION public.repository_review(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.repository_review(uuid,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.repository_suppress(_email text,_kind text,_reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE addr text:=lower(trim(_email)); BEGIN
 PERFORM public.repository_assert_admin(); IF _kind NOT IN ('objection','unsubscribe') OR addr !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR length(trim(_reason))=0 THEN RAISE EXCEPTION 'Invalid objection'; END IF;
 INSERT INTO public.suppressed_emails(email,reason,metadata) VALUES(addr,_reason,jsonb_build_object('source','lead_repository','kind',_kind,'actor_id',auth.uid())) ON CONFLICT(email) DO NOTHING;
 INSERT INTO public.lead_repository_objections(email,kind,reason,actor_id) VALUES(addr,_kind,_reason,auth.uid());
 UPDATE public.lead_repository_emails SET compliance_status='SUPPRESSED',review=review || jsonb_build_object(CASE WHEN _kind='unsubscribe' THEN 'unsubscribed_at' ELSE 'objected_at' END,now()) WHERE email=addr;
 INSERT INTO public.lead_repository_events(action,actor_id,details) VALUES('suppression',auth.uid(),jsonb_build_object('kind',_kind));
END $$;
REVOKE ALL ON FUNCTION public.repository_suppress(text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.repository_suppress(text,text,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.repository_reasons(_email_id uuid,_message jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e public.lead_repository_emails; r jsonb; reasons jsonb:='["sending_disabled"]'; country text;
BEGIN
 PERFORM public.repository_assert_admin(); SELECT * INTO e FROM public.lead_repository_emails WHERE id=_email_id;
 IF NOT FOUND THEN RETURN reasons || '["missing_recipient"]'::jsonb; END IF;
 r:=e.review; SELECT lower(trim(coalesce(nullif(r->>'country',''),l.country))) INTO country FROM public.lead_repository_leads l WHERE l.id=e.lead_id;
 IF EXISTS(SELECT 1 FROM public.suppressed_emails WHERE lower(trim(email))=e.email) THEN reasons:=reasons || '["globally_suppressed"]'::jsonb; END IF;
 IF e.reviewed_by IS NULL OR trim(coalesce(r->>'legal_review',''))='' THEN reasons:=reasons || '["documented_legal_review_missing"]'::jsonb; END IF;
 IF coalesce(r->>'lawful_basis','unassessed') NOT IN ('consent','legitimate_interests','other') OR trim(coalesce(r->>'purpose',''))='' THEN reasons:=reasons || '["lawful_basis_or_purpose_missing"]'::jsonb; END IF;
 IF r->>'lawful_basis'='legitimate_interests' AND trim(coalesce(r->>'lia',''))='' THEN reasons:=reasons || '["lia_missing"]'::jsonb; END IF;
 IF coalesce(country,'')='' OR trim(coalesce(r->>'national_eprivacy_assessment',''))='' THEN reasons:=reasons || '["country_review_missing"]'::jsonb; END IF;
 IF coalesce(r->>'channel_permission','unassessed') NOT IN ('prior_consent','existing_customer_exception','other_national_permission') THEN reasons:=reasons || '["channel_permission_missing"]'::jsonb; END IF;
 IF country IN ('cz','czechia','czech republic','česko','česká republika') AND coalesce(r->>'channel_permission','') NOT IN ('prior_consent','existing_customer_exception') THEN reasons:=reasons || '["czech_prior_consent_or_customer_exception_required"]'::jsonb; END IF;
 IF trim(coalesce(r->>'permission_evidence',''))='' THEN reasons:=reasons || '["permission_evidence_missing"]'::jsonb; END IF;
 IF r->>'channel_permission'='prior_consent' AND (trim(coalesce(r->>'consent_source',''))='' OR trim(coalesce(r->>'consent_at',''))='' OR trim(coalesce(r->>'consent_scope',''))='' OR trim(coalesce(r->>'controller',''))='') THEN reasons:=reasons || '["consent_record_incomplete"]'::jsonb; END IF;
 IF trim(coalesce(r->>'notice_at',''))='' OR trim(coalesce(r->>'notice_route',''))='' THEN reasons:=reasons || '["privacy_notice_missing"]'::jsonb; END IF;
 IF trim(coalesce(_message->>'sender_identity',''))='' OR trim(coalesce(_message->>'promoted_entity',''))='' OR coalesce(_message->>'commercial_identification','false')<>'true' OR trim(coalesce(_message->>'optout_route',''))='' OR coalesce(_message->>'optout_verified','false')<>'true' THEN reasons:=reasons || '["message_compliance_incomplete"]'::jsonb; END IF;
 IF coalesce(r->>'objected_at','')<>'' OR coalesce(r->>'unsubscribed_at','')<>'' THEN reasons:=reasons || '["objection_recorded"]'::jsonb; END IF;
 RETURN reasons;
END $$;
REVOKE ALL ON FUNCTION public.repository_reasons(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.repository_reasons(uuid,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.repository_dry_run(_name text,_message jsonb,_email_ids uuid[]) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE cid uuid; eid uuid; addr text; reasons jsonb; BEGIN
 PERFORM public.repository_assert_admin(); IF length(trim(_name))=0 OR cardinality(_email_ids)>1000 THEN RAISE EXCEPTION 'Invalid dry run'; END IF;
 INSERT INTO public.lead_repository_campaigns(name,message,created_by) VALUES(_name,_message,auth.uid()) RETURNING id INTO cid;
 FOREACH eid IN ARRAY _email_ids LOOP
 SELECT email INTO addr FROM public.lead_repository_emails WHERE id=eid; IF addr IS NULL THEN RAISE EXCEPTION 'Unknown recipient'; END IF;
 reasons:=public.repository_reasons(eid,_message);
 INSERT INTO public.lead_repository_recipients(campaign_id,email_id,email,decision) VALUES(cid,eid,addr,reasons) ON CONFLICT(campaign_id,email) DO NOTHING;
 END LOOP;
 INSERT INTO public.lead_repository_events(action,entity_id,details,actor_id) VALUES('campaign_dry_run',cid::text,jsonb_build_object('recipients',cardinality(_email_ids)),auth.uid()); RETURN cid;
END $$;
REVOKE ALL ON FUNCTION public.repository_dry_run(text,jsonb,uuid[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.repository_dry_run(text,jsonb,uuid[]) TO authenticated;
CREATE OR REPLACE FUNCTION public.repository_export() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb; BEGIN
 PERFORM public.repository_assert_admin(); SELECT coalesce(jsonb_agg(jsonb_build_object('lead',to_jsonb(l),'emails',(SELECT coalesce(jsonb_agg(to_jsonb(e)),'[]') FROM public.lead_repository_emails e WHERE e.lead_id=l.id))),'[]') INTO result FROM public.lead_repository_leads l;
 INSERT INTO public.lead_repository_events(action,details,actor_id) VALUES('export',jsonb_build_object('lead_count',jsonb_array_length(result)),auth.uid()); RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.repository_export() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.repository_export() TO authenticated;