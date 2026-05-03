-- ============================================================
-- CLIENT PORTAL: private project review system
-- ============================================================

-- 1. client_projects -----------------------------------------
CREATE TABLE public.client_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  staging_url text NOT NULL,
  status text NOT NULL DEFAULT 'in_review',
  brand_color text DEFAULT '#0f3a7a',
  -- agreement
  agreement_template text,
  agreement_terms jsonb NOT NULL DEFAULT '{}'::jsonb,
  agreement_acknowledged_at timestamptz,
  agreement_ack_ip text,
  agreement_ack_user_agent text,
  -- meta
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors manage client projects"
  ON public.client_projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Anon no access to client projects"
  ON public.client_projects AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

CREATE TRIGGER trg_client_projects_updated
  BEFORE UPDATE ON public.client_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. project_access_tokens -----------------------------------
CREATE TABLE public.project_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  email text NOT NULL,
  require_email_code boolean NOT NULL DEFAULT false,
  email_code_hash text,
  email_code_expires_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pat_project ON public.project_access_tokens(project_id);
CREATE INDEX idx_pat_token ON public.project_access_tokens(token);

ALTER TABLE public.project_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors manage tokens"
  ON public.project_access_tokens FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Anon no access to tokens"
  ON public.project_access_tokens AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- 3. project_notes -------------------------------------------
CREATE TABLE public.project_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  -- positioning
  page_path text NOT NULL DEFAULT '/',
  selector text,
  x_pct numeric,
  y_pct numeric,
  viewport_w integer,
  viewport_h integer,
  -- content
  message text NOT NULL,
  color text NOT NULL DEFAULT '#f59e0b',
  status text NOT NULL DEFAULT 'todo', -- todo | in_progress | done
  -- author
  author_type text NOT NULL DEFAULT 'client', -- client | admin
  author_name text,
  author_email text,
  -- meta
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_project ON public.project_notes(project_id);
CREATE INDEX idx_notes_status ON public.project_notes(status);

ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors manage all notes"
  ON public.project_notes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Anon no direct note access"
  ON public.project_notes AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

CREATE TRIGGER trg_notes_updated
  BEFORE UPDATE ON public.project_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. project_snapshots ---------------------------------------
CREATE TABLE public.project_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  label text NOT NULL,
  staging_url text NOT NULL,
  screenshot_url text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_snap_project ON public.project_snapshots(project_id);

ALTER TABLE public.project_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors manage snapshots"
  ON public.project_snapshots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Anon no snapshot access"
  ON public.project_snapshots AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- 5. project_audit_log ---------------------------------------
CREATE TABLE public.project_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  actor_type text NOT NULL, -- client | admin | system
  actor_label text,
  action text NOT NULL,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_project ON public.project_audit_log(project_id, created_at DESC);

ALTER TABLE public.project_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit"
  ON public.project_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anon no audit"
  ON public.project_audit_log AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- 6. Storage bucket for snapshot screenshots -----------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-snapshots', 'project-snapshots', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read project snapshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-snapshots');

CREATE POLICY "Editors can upload project snapshots"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-snapshots' AND public.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editors can update project snapshots"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'project-snapshots' AND public.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editors can delete project snapshots"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-snapshots' AND public.has_role(auth.uid(), 'editor'::app_role));