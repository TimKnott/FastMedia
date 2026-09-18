CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'grants',
  title_cs TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  subtitle_cs TEXT NOT NULL DEFAULT '',
  subtitle_en TEXT NOT NULL DEFAULT '',
  intro_cs TEXT NOT NULL DEFAULT '',
  intro_en TEXT NOT NULL DEFAULT '',
  learn_cs TEXT[] NOT NULL DEFAULT '{}',
  learn_en TEXT[] NOT NULL DEFAULT '{}',
  embed_url TEXT,
  embed_html TEXT,
  cover_image TEXT,
  level_label_cs TEXT NOT NULL DEFAULT '',
  level_label_en TEXT NOT NULL DEFAULT '',
  duration_label_cs TEXT NOT NULL DEFAULT '',
  duration_label_en TEXT NOT NULL DEFAULT '',
  is_free BOOLEAN NOT NULL DEFAULT true,
  price_czk INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published courses"
ON public.courses FOR SELECT
USING (is_published = true);

CREATE POLICY "Staff can read all courses"
ON public.courses FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "Staff can insert courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "Staff can update courses"
ON public.courses FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
WITH CHECK (public.has_role(auth.uid(),'editor') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "Staff can delete courses"
ON public.courses FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.courses (
  slug, category, title_cs, title_en, subtitle_cs, subtitle_en, intro_cs, intro_en,
  learn_cs, learn_en, level_label_cs, level_label_en, duration_label_cs, duration_label_en,
  is_free, price_czk, is_published, sort_order
) VALUES (
  'eu-creative-grants',
  'grants',
  'Kreativní vouchery EU: jak získat až 85 % na nový web',
  'EU creative grants: how to fund up to 85% of a new website',
  'Praktický kurz pro české podnikatele, kteří chtějí financovat web z kreativních voucherů.',
  'A practical course for Czech businesses that want to fund a website through creative vouchers.',
  '<p>Kreativní vouchery jsou jedním z nejpřístupnějších nástrojů podpory pro malé firmy v Česku. Tento kurz vás provede pravidly programu, dokumenty i tím, jak připravit projekt, který obstojí.</p><p>Než začnete, projděte si <a href="/grant-eligibility">podmínky způsobilosti</a> a <a href="/eugrants">mapu regionálních partnerů</a>.</p>',
  '<p>Creative vouchers are one of the most accessible funding tools for small businesses in the Czech Republic. This course walks you through the rules, the paperwork and how to prepare a project that stands up to scrutiny.</p><p>Before you begin, read the <a href="/grant-eligibility">eligibility rules</a> and check the <a href="/eugrants">regional partner map</a>.</p>',
  ARRAY['Co kreativní vouchery jsou a co program podporuje','Kdo je způsobilý a jaké podmínky musíte splnit','Jak spočítat 85 % podpory a strop 150 000 Kč','Jaké dokumenty si připravit před podáním','Jak popsat projekt, aby uspěl u hodnotitelů'],
  ARRAY['What creative vouchers are and what the programme funds','Who is eligible and which conditions you must meet','How to calculate the 85% support and the CZK 150,000 cap','Which documents to prepare before applying','How to describe a project so assessors approve it'],
  'Pro začátečníky', 'Beginner friendly', 'Přibližně 45 minut', 'About 45 minutes',
  true, 0, true, 1
);