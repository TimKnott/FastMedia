CREATE TABLE public.flowlu_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  flowlu_id text,
  status text NOT NULL DEFAULT 'pending',
  error text,
  direction text NOT NULL DEFAULT 'push',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, direction)
);
GRANT SELECT ON public.flowlu_sync_log TO authenticated;
GRANT ALL ON public.flowlu_sync_log TO service_role;
ALTER TABLE public.flowlu_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read flowlu log" ON public.flowlu_sync_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.flowlu_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  auto_sync_leads boolean NOT NULL DEFAULT true,
  auto_sync_calls boolean NOT NULL DEFAULT true,
  last_test_at timestamptz,
  last_test_ok boolean,
  last_test_message text,
  last_sync_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.flowlu_settings TO authenticated;
GRANT ALL ON public.flowlu_settings TO service_role;
ALTER TABLE public.flowlu_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read flowlu settings" ON public.flowlu_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update flowlu settings" ON public.flowlu_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.flowlu_settings (id) VALUES (1);
UPDATE public.voice_settings SET flowlu_enabled = true WHERE id = 1;