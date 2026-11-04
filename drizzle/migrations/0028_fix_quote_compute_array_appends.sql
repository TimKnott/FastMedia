create or replace function public.quote_compute(v_inputs jsonb, v_rates jsonb, v_contingency numeric, v_margin numeric, v_country text, v_currency text)
returns jsonb
language plpgsql stable
security definer set search_path = public
as $$
declare
  line jsonb; rate numeric; hours numeric; v numeric;
  labour numeric := 0; base numeric; cont numeric; floor_c numeric; rec numeric;
  total_h numeric := 0; std_h numeric := 0; spec_h numeric := 0;
  missing text[] := '{}'; notes text[] := '{}';
  lines jsonb := '[]'::jsonb;
  observed int := 0; spread numeric; conf text; valid_b int := 0;
  bm record; bh_low numeric; bh_high numeric; bp_low numeric; bp_high numeric;
  citations jsonb := '[]'::jsonb;
  comp numeric; prem numeric;
begin
  if coalesce(jsonb_array_length(v_inputs->'packages'), 0) = 0 then
    missing := missing || ARRAY['work packages with hours'];
  end if;
  for line in select * from jsonb_array_elements(coalesce(v_inputs->'packages','[]'::jsonb)) loop
    rate := coalesce(nullif(v_rates ->> (line->>'role'), '')::numeric, 0);
    hours := coalesce(nullif(line->>'hours','')::numeric, 0);
    if rate is null or rate <= 0 then
      missing := missing || ARRAY['rate for role "' || coalesce(line->>'role','?') || '"'];
    end if;
    if hours > 0 then
      labour := labour + round(rate * hours);
      total_h := total_h + hours;
      if coalesce(line->>'tier','standard') = 'specialist' then
        spec_h := spec_h + hours;
      else
        std_h := std_h + hours;
      end if;
      lines := lines || jsonb_build_object('name', coalesce(line->>'name', line->>'role'), 'role', line->>'role', 'hours', hours, 'tier', coalesce(line->>'tier','standard'));
    end if;
  end loop;
  if v_margin is null then missing := missing || ARRAY['target margin %']; end if;
  base := labour + coalesce(nullif(v_inputs->>'fixed_costs_cents','')::numeric, 0);
  cont := round(base * coalesce(v_contingency, 0) / 100.0);
  floor_c := base + cont;
  if v_margin is not null then rec := round(floor_c * (1.0 + v_margin / 100.0)); end if;

  for bm in select * from quote_benchmarks where upper(country) = upper(coalesce(v_country, '')) loop
    if bm.low_cents is null and bm.high_cents is null then continue; end if;
    if bm.currency is distinct from '' and v_currency is not null and bm.currency <> v_currency then
      notes := notes || ARRAY['Benchmark in ' || bm.currency || ' (' || coalesce(bm.label,'benchmark') || ') shown as context only — not converted.'];
      citations := citations || jsonb_build_object('label', bm.label, 'kind', bm.kind, 'unit', bm.unit, 'currency', bm.currency, 'low_cents', bm.low_cents, 'high_cents', bm.high_cents, 'url', bm.url, 'date', bm.date, 'period', bm.period, 'source', bm.source, 'context_only', true);
      continue;
    end if;
    if bm.unit = 'month' then
      notes := notes || ARRAY['Monthly wage benchmarks are context only — not used in the price range.'];
      citations := citations || jsonb_build_object('label', bm.label, 'kind', bm.kind, 'unit', bm.unit, 'currency', bm.currency, 'low_cents', bm.low_cents, 'high_cents', bm.high_cents, 'url', bm.url, 'date', bm.date, 'period', bm.period, 'source', bm.source, 'context_only', true);
      continue;
    end if;
    valid_b := valid_b + 1;
    if bm.unit = 'day' then
      if bm.low_cents is not null then v := round(bm.low_cents / 8.0); if bh_low is null or v < bh_low then bh_low := v; end if; end if;
      if bm.high_cents is not null then v := round(bm.high_cents / 8.0); if bh_high is null or v > bh_high then bh_high := v; end if; end if;
      citations := citations || jsonb_build_object('label', bm.label, 'kind', bm.kind, 'unit', 'hour', 'currency', bm.currency, 'low_cents', case when bm.low_cents is null then null else round(bm.low_cents/8.0) end, 'high_cents', case when bm.high_cents is null then null else round(bm.high_cents/8.0) end, 'url', bm.url, 'date', bm.date, 'period', bm.period, 'source', bm.source, 'note', 'Day rate converted to hourly at 8 h/day (assumption).');
    else
      if bm.low_cents is not null then if bp_low is null or bm.low_cents < bp_low then bp_low := bm.low_cents; end if; end if;
      if bm.high_cents is not null then if bp_high is null or bm.high_cents > bp_high then bp_high := bm.high_cents; end if; end if;
      citations := citations || jsonb_build_object('label', bm.label, 'kind', bm.kind, 'unit', bm.unit, 'currency', bm.currency, 'low_cents', bm.low_cents, 'high_cents', bm.high_cents, 'url', bm.url, 'date', bm.date, 'period', bm.period, 'source', bm.source);
    end if;
    if bm.kind in ('advertised_rate','awarded_value') then observed := observed + 1; end if;
  end loop;

  conf := case when observed >= 3 then 'medium' when observed >= 1 then 'low' else 'insufficient' end;
  spread := case when conf = 'medium' then 0.10 when conf = 'low' then 0.20 else 0.30 end;
  if conf = 'insufficient' then notes := notes || ARRAY['No observed market benchmark for this country yet — range widened (±30 %) and pricing confidence is low.']; end if;
  if v_margin is not null then
    comp := greatest(floor_c, round(rec * (1.0 - spread)));
    prem := round(rec * (1.0 + spread));
  end if;

  return jsonb_build_object(
    'ok', (array_length(missing, 1) is null),
    'missing', to_jsonb(missing),
    'lines', lines,
    'hours', jsonb_build_object('total', total_h, 'standard', std_h, 'specialist', spec_h),
    'competitive_cents', comp, 'recommended_cents', rec, 'premium_cents', prem,
    'benchmark', jsonb_build_object('hourly_low', bh_low, 'hourly_high', bh_high, 'project_low', bp_low, 'project_high', bp_high, 'valid', valid_b),
    'benchmarks', citations,
    'confidence', conf,
    'notes', to_jsonb(notes),
    'currency', v_currency
  );
end $$;