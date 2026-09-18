CREATE TABLE public.case_studies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  brand text NOT NULL,
  tag_cs text NOT NULL DEFAULT '',
  tag_en text NOT NULL DEFAULT '',
  summary_cs text NOT NULL DEFAULT '',
  summary_en text NOT NULL DEFAULT '',
  body_cs text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url text,
  pdf_url text,
  pdf_path text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.case_studies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_studies TO authenticated;
GRANT ALL ON public.case_studies TO service_role;

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published case studies are public"
ON public.case_studies FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Staff can view all case studies"
ON public.case_studies FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Staff can insert case studies"
ON public.case_studies FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Staff can update case studies"
ON public.case_studies FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete case studies"
ON public.case_studies FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_case_studies_updated_at
BEFORE UPDATE ON public.case_studies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.case_studies (slug, brand, tag_cs, tag_en, summary_cs, summary_en, body_cs, body_en, stats, thumbnail_url, is_published, sort_order) VALUES
('northwater-plumbing', 'Northwater — instalatérství a topení', 'Řemesla', 'Trades',
 'Web s okamžitou odpovědí na poptávku a nouzovou linkou. Poptávky se přestaly ztrácet v e-mailu.',
 'Instant enquiry response and an emergency call-out line. Leads stopped disappearing into an inbox.',
 'V každém okrese pracujeme jen s jedním instalatérem. Web kombinuje nouzovou linku, poptávkový formulář s automatickou odpovědí do 30 sekund a přehled realizací.',
 'We work with one plumber per district. The site combines an emergency line, an enquiry form with an automatic reply inside 30 seconds, and a portfolio of completed work.',
 '[{"value":"+312 %","label_cs":"poptávek za 90 dnů","label_en":"enquiries in 90 days"},{"value":"28 s","label_cs":"průměrná odezva","label_en":"average response"},{"value":"1,1 s","label_cs":"načtení na mobilu","label_en":"mobile load time"}]'::jsonb,
 '/case-studies/case-plumbing.jpg', true, 1),
('lumiere-beauty-salon', 'Lumière — beauty salon', 'Beauty & wellness', 'Beauty & wellness',
 'Online rezervace s platbou předem. Storna klesla, kalendář se plní i po zavíračce.',
 'Online booking with prepayment. No-shows fell and the diary fills up long after closing time.',
 'Rezervační modul s platbou předem, automatickými připomínkami a synchronizací kalendáře. Většina rezervací dnes vzniká mimo pracovní dobu.',
 'A booking module with prepayment, automatic reminders and calendar sync. Most bookings now happen outside working hours.',
 '[{"value":"64 %","label_cs":"rezervací mimo pracovní dobu","label_en":"bookings out of hours"},{"value":"−41 %","label_cs":"nedostavení se","label_en":"no-shows"},{"value":"4,9★","label_cs":"hodnocení klientek","label_en":"client rating"}]'::jsonb,
 '/case-studies/case-salon.jpg', true, 2),
('nordic-homeware-store', 'Nordic — e-shop s bydlením', 'E-commerce', 'E-commerce',
 'Kompletní e-shop s vícekrokovou pokladnou, oblíbenými položkami a e-mailovou automatizací.',
 'A full shop with multi-step checkout, wishlists and email automation behind it.',
 'Kompletní e-shop s vícekrokovou pokladnou, oblíbenými položkami, doporučeními a e-mailovou automatizací opuštěného košíku.',
 'A complete shop with multi-step checkout, wishlists, recommendations and abandoned-basket email automation.',
 '[{"value":"+87 %","label_cs":"dokončených objednávek","label_en":"completed orders"},{"value":"2,3×","label_cs":"hodnota košíku","label_en":"basket value"},{"value":"0","label_cs":"poplatků za transakci navíc","label_en":"extra transaction fees"}]'::jsonb,
 '/case-studies/case-eshop.jpg', true, 3),
('summit-construction-roofing', 'Summit — stavby a střechy', 'Stavebnictví', 'Construction',
 'Galerie realizací a poptávkový formulář s odhadem ceny. Kvalifikované poptávky místo zvědavců.',
 'A portfolio gallery and an enquiry form with a price estimate. Qualified leads instead of window shoppers.',
 'Galerie realizací, poptávkový formulář s okamžitým odhadem ceny a rozpočtovým polem. Tři čtvrtiny poptávek dnes přicházejí s rozpočtem.',
 'A portfolio gallery plus an enquiry form with an instant price estimate and a budget field. Three quarters of enquiries now arrive with a budget.',
 '[{"value":"+5,4 mil. Kč","label_cs":"v poptávkách za rok","label_en":"in enquiries per year"},{"value":"73 %","label_cs":"poptávek s rozpočtem","label_en":"enquiries with a budget"},{"value":"10 dnů","label_cs":"do spuštění","label_en":"to launch"}]'::jsonb,
 '/case-studies/case-building.jpg', true, 4);