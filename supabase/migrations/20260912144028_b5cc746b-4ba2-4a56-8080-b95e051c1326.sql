CREATE TABLE public.grant_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enquiry_id UUID NOT NULL REFERENCES public.contact_enquiries(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.grant_documents TO authenticated;
GRANT ALL ON public.grant_documents TO service_role;

ALTER TABLE public.grant_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants read own grant documents"
  ON public.grant_documents FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Applicants upload own grant documents"
  ON public.grant_documents FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Applicants delete own grant documents"
  ON public.grant_documents FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Applicants can see their own wizard enquiry (matched by sign-in email).
CREATE POLICY "Applicants read own enquiries"
  ON public.contact_enquiries FOR SELECT TO authenticated
  USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Applicants can update their own enquiry (used for the DPMK reference field).
CREATE POLICY "Applicants update own enquiries"
  ON public.contact_enquiries FOR UPDATE TO authenticated
  USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  WITH CHECK (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Private grant-documents bucket: users manage only objects inside their own folder.
CREATE POLICY "Applicants read own grant files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'grant-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Applicants upload own grant files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'grant-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Applicants delete own grant files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'grant-documents' AND (storage.foldername(name))[1] = auth.uid()::text);