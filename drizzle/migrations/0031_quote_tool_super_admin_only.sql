REVOKE EXECUTE ON FUNCTION public.quote_compute(jsonb, jsonb, numeric, numeric, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.quote_compute(jsonb, jsonb, numeric, numeric, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.quote_run(_inputs jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user uuid := auth.uid();
  v_bal int; v_rc record; v_res jsonb;
begin
  if v_user is null then return jsonb_build_object('ok', false, 'reason', 'auth_required'); end if;
  -- The quote tool and its benchmark citations are Super Admin-only.
  if not public.has_role(v_user, 'super_admin'::app_role) then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;
  insert into public.quote_credits (user_id) values (v_user) on conflict (user_id) do nothing;
  select balance into v_bal from public.quote_credits where user_id = v_user for update;
  if v_bal is null or v_bal <= 0 then
    return jsonb_build_object('ok', false, 'reason', 'no_credits', 'balance', coalesce(v_bal, 0));
  end if;
  select * into v_rc from public.quote_rate_card where id = 1;
  v_res := public.quote_compute(_inputs, v_rc.rates, v_rc.contingency_pct, v_rc.margin_pct, _inputs->>'country', v_rc.currency);
  if coalesce((v_res->>'ok')::boolean, false) then
    update public.quote_credits set balance = balance - 1, updated_at = now() where user_id = v_user returning balance into v_bal;
    insert into public.quote_assessments (user_id, inputs, result) values (v_user, _inputs, v_res);
  else
    v_res := v_res || jsonb_build_object('reason', 'incomplete', 'balance', v_bal);
  end if;
  return v_res || jsonb_build_object('balance', v_bal);
end $function$;

REVOKE EXECUTE ON FUNCTION public.quote_run(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.quote_run(jsonb) TO authenticated, service_role;