create table if not exists public.internal_job_tokens (name text primary key, token text not null, created_at timestamptz not null default now());
grant all on public.internal_job_tokens to service_role;
alter table public.internal_job_tokens enable row level security;
insert into public.internal_job_tokens(name, token) values ('prospect_discovery', encode(extensions.gen_random_bytes(32),'hex')) on conflict (name) do nothing;