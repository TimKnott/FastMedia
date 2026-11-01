CREATE OR REPLACE FUNCTION public.repository_verify_safeguards() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE key text:='__repository_rollback_qa_'||gen_random_uuid()::text; lid uuid; eid uuid; cid uuid; first_result jsonb; second_result jsonb; reasons jsonb; report jsonb; addr text:='rollback-'||gen_random_uuid()::text||'@example.invalid';
BEGIN
 PERFORM public.repository_assert_admin();
 BEGIN
 first_result:=public.repository_import('leads','rollback-qa.csv',jsonb_build_array(jsonb_build_object('lead_key',key,'person_name','Jiří Šťastný','country','CZ','custom_field','Český původ')));
 second_result:=public.repository_import('leads','rollback-qa.csv',jsonb_build_array(jsonb_build_object('lead_key',key,'person_name','Jiří Šťastný','country','CZ','custom_field','Český původ')));
 IF (first_result->>'imported_or_provenance_updated')::int<>1 OR (second_result->>'skipped')::int<>1 THEN RAISE EXCEPTION 'Lead import idempotency failed'; END IF;
 SELECT id INTO lid FROM public.lead_repository_leads WHERE lead_key=key AND person_name='Jiří Šťastný' AND source_rows->0->'row'->>'custom_field'='Český původ';
 IF lid IS NULL THEN RAISE EXCEPTION 'UTF-8/source preservation failed'; END IF;
 PERFORM public.repository_import('emails','rollback-qa-emails.csv',jsonb_build_array(jsonb_build_object('lead_key',key,'email',' '||upper(addr)||' ','validation_status','valid','campaign_status','ACTIVE')));
 second_result:=public.repository_import('emails','rollback-qa-emails.csv',jsonb_build_array(jsonb_build_object('lead_key',key,'email',' '||upper(addr)||' ','validation_status','valid','campaign_status','ACTIVE')));
 SELECT id INTO eid FROM public.lead_repository_emails WHERE lead_id=lid AND email=addr AND campaign_status='HOLD' AND compliance_status='UNASSESSED';
 IF eid IS NULL OR (second_result->>'skipped')::int<>1 THEN RAISE EXCEPTION 'Email default/idempotency failed'; END IF;
 PERFORM public.repository_review(eid,jsonb_build_object('country','CZ','lawful_basis','legitimate_interests','channel_permission','other_national_permission','legal_review','QA documented review','purpose','QA','lia','QA assessment'));
 reasons:=public.repository_reasons(eid,'{}');
 IF NOT reasons @> '["czech_prior_consent_or_customer_exception_required","sending_disabled"]'::jsonb THEN RAISE EXCEPTION 'Czech permission gate failed'; END IF;
 cid:=public.repository_dry_run('Rollback QA','{}',ARRAY[eid]);
 BEGIN UPDATE public.lead_repository_campaigns SET status='ACTIVE' WHERE id=cid; RAISE EXCEPTION 'Activation bypass'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN UPDATE public.lead_repository_recipients SET sent_at=now() WHERE campaign_id=cid; RAISE EXCEPTION 'Send timestamp bypass'; EXCEPTION WHEN check_violation THEN NULL; END;
 PERFORM public.repository_suppress(addr,'objection','Rollback QA');
 IF NOT public.repository_reasons(eid,'{}') @> '["globally_suppressed"]'::jsonb THEN RAISE EXCEPTION 'Suppression gate failed'; END IF;
 DELETE FROM public.lead_repository_leads WHERE id=lid;
 IF NOT EXISTS(SELECT 1 FROM public.suppressed_emails WHERE email=addr) OR NOT EXISTS(SELECT 1 FROM public.lead_repository_objections WHERE email=addr) THEN RAISE EXCEPTION 'Suppression did not survive deletion'; END IF;
 report:=jsonb_build_object('idempotent_leads',true,'idempotent_emails',true,'utf8_and_all_fields',true,'valid_email_stays_hold',true,'czech_gate',true,'activation_disabled',true,'send_timestamp_disabled',true,'global_suppression',true,'suppression_survives_deletion',true);
 RAISE EXCEPTION USING ERRCODE='ZQ001',MESSAGE='Rollback successful QA';
 EXCEPTION WHEN SQLSTATE 'ZQ001' THEN RETURN report; END;
END $$;
REVOKE ALL ON FUNCTION public.repository_verify_safeguards() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.repository_verify_safeguards() TO authenticated;
COMMENT ON FUNCTION public.repository_verify_safeguards() IS 'Admin-only diagnostic. All synthetic rows, review and suppression changes are rolled back in an exception subtransaction; no real records or outbound actions.';