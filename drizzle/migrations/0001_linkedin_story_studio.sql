CREATE TABLE public.linkedin_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode int,
  title text NOT NULL,
  story_type text NOT NULL DEFAULT 'service',
  purpose text,
  angle text,
  suggested_hook text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  draft jsonb,
  post text,
  status text NOT NULL DEFAULT 'questions_needed' CHECK (status IN ('idea','questions_needed','draft','needs_review','approved','published','repurpose')),
  planned_date date,
  posted_on jsonb NOT NULL DEFAULT '{}'::jsonb,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.linkedin_stories TO authenticated;
GRANT ALL ON public.linkedin_stories TO service_role;
ALTER TABLE public.linkedin_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage stories" ON public.linkedin_stories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));