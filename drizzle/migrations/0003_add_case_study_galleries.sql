ALTER TABLE public.case_studies
ADD COLUMN gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.case_studies.gallery_images IS 'Ordered case-study screenshots with URL and English alt/caption metadata.';