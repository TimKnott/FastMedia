CREATE TABLE public.inbound_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mailgun_event_id text UNIQUE,
  from_address text NOT NULL,
  to_address text NOT NULL,
  subject text,
  body_plain text,
  body_html text,
  ai_reply text,
  status text NOT NULL DEFAULT 'received',
  error_message text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inbound_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inbound emails"
ON public.inbound_emails
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anon cannot access inbound emails"
ON public.inbound_emails
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE INDEX idx_inbound_emails_created_at ON public.inbound_emails (created_at DESC);
CREATE INDEX idx_inbound_emails_from ON public.inbound_emails (from_address);