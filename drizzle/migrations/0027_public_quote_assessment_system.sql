-- ============ Public/reseller quote assessment: rate card, benchmarks, credits, log ============

create table if not exists public.quote_rate_card (
  id int primary key default 1 check (id = 1),
  currency text not null default 'CZK',
  rates jsonb not null default '{}'::jsonb,
  contingency_pct numeric not null default 15,
  margin_pct numeric,
  updated_at timestamptz not null default now()
);
insert into public.quote_rate_card (id) values (1) on conflict (id) do nothing;

create table if not exists public.quote_credits (
  user_id uuid primary key,
  balance integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_benchmarks (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  label text not null,
  kind text not null,
  unit text not null check (unit in ('hour','day','project','month')),
  currency text not null default '',
  low_cents bigint,
  high_cents bigint,
  url text not null,
  date date not null,
  period text,
  source text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.quote_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  inputs jsonb not null,
  result jsonb,
  created_at timestamptz not null default now()
);
create index if not exists quote_assessments_user_idx on public.quote_assessments (user_id, created_at desc);

grant select, update on public.quote_rate_card to authenticated;
grant all on public.quote_rate_card to service_role;
grant select on public.quote_credits to authenticated;
grant all on public.quote_credits to service_role;
grant select on public.quote_benchmarks to authenticated;
grant all on public.quote_benchmarks to service_role;
grant select, insert on public.quote_assessments to authenticated;
grant all on public.quote_assessments to service_role;

alter table public.quote_rate_card enable row level security;
alter table public.quote_credits enable row level security;
alter table public.quote_benchmarks enable row level security;
alter table public.quote_assessments enable row level security;

create policy "Admins manage quote rate card" on public.quote_rate_card
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Users read own quote credits" on public.quote_credits
  for select to authenticated using (user_id = auth.uid());
create policy "Signed-in users read quote benchmarks" on public.quote_benchmarks
  for select to authenticated using (true);
create policy "Users read own quote assessments" on public.quote_assessments
  for select to authenticated using (user_id = auth.uid());
create policy "Users insert own quote assessments" on public.quote_assessments
  for insert to authenticated with check (user_id = auth.uid());

create trigger quote_credits_touch before update on public.quote_credits
  for each row execute function public.update_updated_at_column();
create trigger quote_rate_card_touch before update on public.quote_rate_card
  for each row execute function public.update_updated_at_column();

-- Public, already-cited benchmarks (same entries as src/lib/marketBenchmarks.ts)
insert into public.quote_benchmarks (country, label, kind, unit, currency, low_cents, high_cents, url, date, period, source, note) values
('DE','Malt DE — front-end web developer day rate (0–2 yrs avg → 15+ yrs avg)','advertised_rate','day','EUR',33300,68600,'https://www.malt.de/t/tarifbarometer/it/frontend-webentwickler','2026-11-04','Rates listed on Malt in the last 3 months','Malt Tarifbarometer','Freelancer asking rates on one platform; experienced average €638/day. Not agency prices.'),
('CZ','CZSO — average gross monthly wage, software developers (2025)','salary_derived','month','CZK',11780000,11780000,'https://csu.gov.cz/ict-specialists-and-their-wages','2026-07-01','Year 2025','Czech Statistical Office','Employee wage, not a market quote or agency rate. Context only.'),
('CZ','CZSO — average gross monthly wage, ICT professionals, business sphere (2025)','salary_derived','month','CZK',10172900,10172900,'https://csu.gov.cz/ict-specialists-and-their-wages','2026-07-01','Year 2025','Czech Statistical Office','Employee wage, not a market quote or agency rate. Context only.');

-- ============ Server-side quote computation (public-safe output only) ============

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
    missing := missing || 'work packages with hours';
  end if;
  for line in select * from jsonb_array_elements(coalesce(v_inputs->'packages','[]'::jsonb)) loop
    rate := coalesce(nullif(v_rates ->> (line->>'role'), '')::numeric, 0);
    hours := coalesce(nullif(line->>'hours','')::numeric, 0);
    if rate is null or rate <= 0 then
      missing := missing || ('rate for role "' || coalesce(line->>'role','?') || '"');
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
  if v_margin is null then missing := missing || 'target margin %'; end if;
  base := labour + coalesce(nullif(v_inputs->>'fixed_costs_cents','')::numeric, 0);
  cont := round(base * coalesce(v_contingency, 0) / 100.0);
  floor_c := base + cont;
  if v_margin is not null then rec := round(floor_c * (1.0 + v_margin / 100.0)); end if;

  for bm in select * from quote_benchmarks where upper(country) = upper(coalesce(v_country, '')) loop
    if bm.low_cents is null and bm.high_cents is null then continue; end if;
    if bm.currency is distinct from '' and v_currency is not null and bm.currency <> v_currency then
      notes := notes || ('Benchmark in ' || bm.currency || ' (' || coalesce(bm.label,'benchmark') || ') shown as context only — not converted.');
      citations := citations || jsonb_build_object('label', bm.label, 'kind', bm.kind, 'unit', bm.unit, 'currency', bm.currency, 'low_cents', bm.low_cents, 'high_cents', bm.high_cents, 'url', bm.url, 'date', bm.date, 'period', bm.period, 'source', bm.source, 'context_only', true);
      continue;
    end if;
    if bm.unit = 'month' then
      notes := notes || 'Monthly wage benchmarks are context only — not used in the price range.';
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
  if conf = 'insufficient' then notes := notes || 'No observed market benchmark for this country yet — range widened (±30 %) and pricing confidence is low.'; end if;
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

-- Run one assessment: spends 1 credit only when the quote is complete
create or replace function public.quote_run(_inputs jsonb)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_bal int; v_rc record; v_res jsonb;
begin
  if v_user is null then return jsonb_build_object('ok', false, 'reason', 'auth_required'); end if;
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
end $$;

-- Balance + recent assessments for the signed-in user
create or replace function public.quote_status()
returns jsonb
language plpgsql stable
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

-- Admin-only rate card update
create or replace function public.quote_save_rate_card(_rates jsonb, _currency text, _contingency_pct numeric, _margin_pct numeric)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Admins only'; end if;
  update public.quote_rate_card
    set rates = _rates,
        currency = coalesce(_currency, currency),
        contingency_pct = coalesce(_contingency_pct, contingency_pct),
        margin_pct = _margin_pct,
        updated_at = now()
    where id = 1;
  return (select to_jsonb(r) from public.quote_rate_card r where id = 1);
end $$;

grant execute on function public.quote_run(jsonb) to authenticated;
grant execute on function public.quote_status() to authenticated;
grant execute on function public.quote_save_rate_card(jsonb, text, numeric, numeric) to authenticated;
revoke execute on function public.quote_save_rate_card(jsonb, text, numeric, numeric) from anon;
revoke execute on function public.quote_run(jsonb) from anon;
revoke execute on function public.quote_status() from anon;
grant execute on function public.quote_compute(jsonb, jsonb, numeric, numeric, text, text) to authenticated;
