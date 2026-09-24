
-- Voice agent tables (staff-only)
CREATE TABLE public.voice_settings (
  id int primary key default 1 check (id = 1),
  enabled boolean not null default false,
  twilio_number text,
  forward_to_number text default '+420797864432',
  monthly_minute_cap int not null default 120,
  minutes_used numeric not null default 0,
  usage_month text not null default to_char(now(), 'YYYY-MM'),
  elevenlabs_voice_id text default 'onwK4e9ZLuTAKqWW03F9',
  flowlu_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
GRANT SELECT, UPDATE ON public.voice_settings TO authenticated;
GRANT ALL ON public.voice_settings TO service_role;
ALTER TABLE public.voice_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view voice settings" ON public.voice_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can update voice settings" ON public.voice_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
INSERT INTO public.voice_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE public.voice_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  script text not null,
  status text not null default 'draft' check (status in ('draft','pending_approval','approved','running','paused','done','cancelled')),
  created_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_campaigns TO authenticated;
GRANT ALL ON public.voice_campaigns TO service_role;
ALTER TABLE public.voice_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view campaigns" ON public.voice_campaigns FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Staff can create campaigns" ON public.voice_campaigns FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins can update campaigns" ON public.voice_campaigns FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can delete campaigns" ON public.voice_campaigns FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.voice_calls (
  id uuid primary key default gen_random_uuid(),
  direction text not null check (direction in ('inbound','outbound')),
  from_number text,
  to_number text,
  status text not null default 'ringing' check (status in ('ringing','in_progress','completed','failed','no_answer','forwarded','voicemail')),
  language text,
  twilio_call_sid text unique,
  campaign_id uuid references public.voice_campaigns(id) on delete set null,
  prospect_id uuid references public.prospects(id) on delete set null,
  summary text,
  outcome text,
  recording_url text,
  duration_seconds int,
  forwarded boolean not null default false,
  flowlu_synced boolean not null default false,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE ON public.voice_calls TO authenticated;
GRANT ALL ON public.voice_calls TO service_role;
ALTER TABLE public.voice_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view calls" ON public.voice_calls FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Staff can insert calls" ON public.voice_calls FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Staff can update calls" ON public.voice_calls FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.voice_call_turns (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.voice_calls(id) on delete cascade,
  role text not null check (role in ('caller','agent')),
  text text not null,
  created_at timestamptz not null default now()
);
CREATE INDEX voice_call_turns_call_idx ON public.voice_call_turns(call_id, created_at);
GRANT SELECT, INSERT ON public.voice_call_turns TO authenticated;
GRANT ALL ON public.voice_call_turns TO service_role;
ALTER TABLE public.voice_call_turns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view turns" ON public.voice_call_turns FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Staff can insert turns" ON public.voice_call_turns FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.voice_scan_reports (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  pages_checked int not null default 0,
  issues jsonb not null default '[]'::jsonb,
  summary text,
  emailed boolean not null default false
);
GRANT SELECT ON public.voice_scan_reports TO authenticated;
GRANT ALL ON public.voice_scan_reports TO service_role;
ALTER TABLE public.voice_scan_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view scan reports" ON public.voice_scan_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'editor'));
