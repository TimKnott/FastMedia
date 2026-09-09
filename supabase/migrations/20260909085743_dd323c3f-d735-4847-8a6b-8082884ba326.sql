CREATE TABLE public.tracker_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'manual',
  source_id text,
  title text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  stage text NOT NULL DEFAULT 'new',
  notes text,
  owner text,
  value numeric,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tracker_items_source_chk CHECK (source IN ('manual','enquiry','lead')),
  CONSTRAINT tracker_items_stage_chk CHECK (stage IN ('new','contacted','quoted','won','lost','in_progress','waiting_on_client','done'))
);

CREATE UNIQUE INDEX tracker_items_source_unique ON public.tracker_items (source, source_id) WHERE source_id IS NOT NULL;
CREATE INDEX tracker_items_stage_idx ON public.tracker_items (stage);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracker_items TO authenticated;
GRANT ALL ON public.tracker_items TO service_role;

ALTER TABLE public.tracker_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view tracker items" ON public.tracker_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'editor'));

CREATE POLICY "Staff can insert tracker items" ON public.tracker_items FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'editor'));

CREATE POLICY "Staff can update tracker items" ON public.tracker_items FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'editor'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'editor'));

CREATE POLICY "Admins can delete tracker items" ON public.tracker_items FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER update_tracker_items_updated_at BEFORE UPDATE ON public.tracker_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();