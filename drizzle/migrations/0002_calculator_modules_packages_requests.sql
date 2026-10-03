CREATE TABLE public.calculator_modules (
  id text PRIMARY KEY,
  icon text NOT NULL DEFAULT '🧩',
  name_en text NOT NULL,
  name_cs text NOT NULL DEFAULT '',
  desc_en text NOT NULL DEFAULT '',
  desc_cs text NOT NULL DEFAULT '',
  one_time_price integer NOT NULL DEFAULT 0 CHECK (one_time_price >= 0),
  monthly_price integer NOT NULL DEFAULT 0 CHECK (monthly_price >= 0),
  labor_hours numeric NOT NULL DEFAULT 0 CHECK (labor_hours >= 0),
  category text NOT NULL DEFAULT 'essential' CHECK (category IN ('essential','marketing','advanced','premium')),
  allow_multiple boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.calculator_modules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.calculator_modules TO authenticated;
GRANT ALL ON public.calculator_modules TO service_role;
ALTER TABLE public.calculator_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active modules" ON public.calculator_modules FOR SELECT TO anon, authenticated USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage modules" ON public.calculator_modules FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER calculator_modules_updated BEFORE UPDATE ON public.calculator_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.calculator_packages (
  slug text PRIMARY KEY,
  name text NOT NULL,
  module_ids text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.calculator_packages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.calculator_packages TO authenticated;
GRANT ALL ON public.calculator_packages TO service_role;
ALTER TABLE public.calculator_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads packages" ON public.calculator_packages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage packages" ON public.calculator_packages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER calculator_packages_updated BEFORE UPDATE ON public.calculator_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.module_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade text,
  selected_modules text[] NOT NULL DEFAULT '{}',
  conversation jsonb NOT NULL DEFAULT '[]',
  summary text,
  suggested_min integer,
  suggested_max integer,
  covered_by text[] NOT NULL DEFAULT '{}',
  contact_name text,
  contact_email text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','quoted','converted','declined')),
  admin_notes text,
  converted_module_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.module_requests TO authenticated;
GRANT ALL ON public.module_requests TO service_role;
ALTER TABLE public.module_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage module requests" ON public.module_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER module_requests_updated BEFORE UPDATE ON public.module_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();