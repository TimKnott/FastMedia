CREATE OR REPLACE FUNCTION public.opportunity_import(_filename text, _hash text, _rows jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE bid uuid; r jsonb; n int:=0; nskip int:=0; errs jsonb:='[]'; idx int:=0; url text; norm text; k text; st text; contact text; affected int;
BEGIN
 PERFORM public.repository_assert_admin();
 IF jsonb_typeof(_rows)<>'array' OR jsonb_array_length(_rows)>1000 OR length(trim(coalesce(_filename,'')))=0 OR length(coalesce(_hash,''))<16 THEN RAISE EXCEPTION 'Invalid import batch'; END IF;
 IF EXISTS(SELECT 1 FROM opportunity_import_batches WHERE file_hash=_hash) THEN RETURN jsonb_build_object('duplicate_file',true,'accepted',0,'skipped',jsonb_array_length(_rows),'errors','[]'::jsonb); END IF;
 INSERT INTO opportunity_import_batches(filename,file_hash,row_count,created_by) VALUES(left(_filename,200),_hash,jsonb_array_length(_rows),auth.uid()) RETURNING id INTO bid;
 FOR r IN SELECT value FROM jsonb_array_elements(_rows) LOOP
  idx:=idx+1;
  BEGIN
   url:=trim(coalesce(r->>'source_url','')); IF url !~* '^https?://[^[:space:]/]+\.[^[:space:]]+$' THEN RAISE EXCEPTION 'Missing or invalid source_url'; END IF;
   norm:=lower(regexp_replace(regexp_replace(url,'^https?://(www\.)?','','i'),'[/#?]+$',''));
   k:=coalesce(r->>'kind',''); st:=lower(coalesce(r->>'source_type',''));
   IF k NOT IN ('active_buyer_request','prospect_hypothesis') THEN RAISE EXCEPTION 'Invalid kind'; END IF;
   IF k='active_buyer_request' AND st IN ('company_website','directory_listing','social_profile','') THEN RAISE EXCEPTION 'Buyer request needs a request/tender/post source, not a company website or listing'; END IF;
   contact:=lower(trim(coalesce(r->>'public_contact_route','')));
   IF contact ~ '@(gmail|seznam|email|outlook|hotmail|yahoo|icloud|centrum|post|volny|gmx|web)\.' AND coalesce(r->>'contact_published_by_business','false')<>'true' THEN RAISE EXCEPTION 'Personal-looking contact without published-business evidence'; END IF;
   IF length(trim(coalesce(r->>'title','')))=0 THEN RAISE EXCEPTION 'Missing title'; END IF;
   INSERT INTO opportunities(kind,title,company,source_url,source_url_norm,source_type,discovery_method,posted_at,deadline_at,retrieved_at,country,service_need,fit_reason,public_contact_route,deliverables,evidence,risks,score_breakdown,priority_score,batch_id,created_by)
   VALUES(k,left(r->>'title',300),left(r->>'company',200),url,norm,coalesce(nullif(st,''),'unknown'),coalesce(nullif(r->>'discovery_method',''),'manual_import'),
    nullif(r->>'posted_at','')::timestamptz,nullif(r->>'deadline_at','')::timestamptz,coalesce(nullif(r->>'retrieved_at','')::timestamptz,now()),
    left(r->>'country',60),left(r->>'service_need',300),left(r->>'fit_reason',2000),nullif(left(contact,300),''),
    coalesce(r->'deliverables','[]'),coalesce(r->'evidence','[]'),coalesce(r->'risks','[]'),coalesce(r->'score_breakdown','{}'),
    greatest(0,least(100,coalesce((r->>'priority_score')::int,0))),bid,auth.uid())
   ON CONFLICT(source_url_norm) DO NOTHING;
   GET DIAGNOSTICS affected=ROW_COUNT; IF affected=0 THEN nskip:=nskip+1; ELSE n:=n+1; END IF;
  EXCEPTION WHEN OTHERS THEN errs:=errs||jsonb_build_array(jsonb_build_object('row',idx,'reason',SQLERRM)); END;
 END LOOP;
 UPDATE opportunity_import_batches SET accepted=n,skipped=nskip,errors=errs WHERE id=bid;
 INSERT INTO opportunity_events(action,details,actor_id) VALUES('import',jsonb_build_object('batch',bid,'file',_filename,'accepted',n,'skipped',nskip,'errors',jsonb_array_length(errs)),auth.uid());
 RETURN jsonb_build_object('duplicate_file',false,'accepted',n,'skipped',nskip,'errors',errs);
END $$;