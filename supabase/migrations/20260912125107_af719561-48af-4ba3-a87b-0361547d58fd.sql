ALTER TABLE public.contact_enquiries DROP CONSTRAINT IF EXISTS contact_enquiries_status_check;
ALTER TABLE public.contact_enquiries ADD CONSTRAINT contact_enquiries_status_check
  CHECK (status IN ('new', 'in_progress', 'read', 'replied', 'archived', 'spam'));