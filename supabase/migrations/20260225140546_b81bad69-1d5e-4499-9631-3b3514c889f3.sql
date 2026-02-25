-- Add status column to site_content
ALTER TABLE public.site_content
  ADD COLUMN status text NOT NULL DEFAULT 'published';

-- Drop existing unique constraint/index on (content_key, language)
-- First find and drop it
DROP INDEX IF EXISTS site_content_content_key_language_idx;
ALTER TABLE public.site_content DROP CONSTRAINT IF EXISTS site_content_content_key_language_key;

-- Create new unique constraint including status
ALTER TABLE public.site_content
  ADD CONSTRAINT site_content_content_key_language_status_key
  UNIQUE (content_key, language, status);