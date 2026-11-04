create or replace function public.quote_status()
returns jsonb
language plpgsql volatile
security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid(); v_bal int; v_hist jsonb;
begin
  if v_user is null then return jsonb_build_object('auth', false); end if;
  insert into public.quote_credits (user_id) values (v_user) on conflict (user_id) do nothing;
  select balance into v_bal from public.quote_credits where user_id = v_user;
  select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'created_at', a.created_at, 'title', a.inputs->>'title', 'recommended_cents', a.result->'recommended_cents', 'currency', a.result->'currency', 'hours', a.result->'hours'->'total')), '[]'::jsonb)
    into v_hist
    from (select * from public.quote_assessments where user_id = v_user order by created_at desc limit 10) a;
  return jsonb_build_object('auth', true, 'balance', v_bal, 'assessments', v_hist);
end $$;