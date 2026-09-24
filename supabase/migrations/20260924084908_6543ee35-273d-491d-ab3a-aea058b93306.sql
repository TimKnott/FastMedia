UPDATE public.prospects SET email = lower(trim(email)) WHERE email <> lower(trim(email));
DROP INDEX IF EXISTS public.prospects_email_key;
DROP INDEX IF EXISTS public.prospects_email_plain_key;
ALTER TABLE public.prospects ADD CONSTRAINT prospects_email_key UNIQUE (email);