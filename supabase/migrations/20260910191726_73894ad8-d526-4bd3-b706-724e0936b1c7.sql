ALTER TABLE public.contact_enquiries
  DROP CONSTRAINT IF EXISTS contact_enquiries_kind_check;

ALTER TABLE public.contact_enquiries
  ADD CONSTRAINT contact_enquiries_kind_check
  CHECK (kind IN ('contact', 'quote', 'offer'));