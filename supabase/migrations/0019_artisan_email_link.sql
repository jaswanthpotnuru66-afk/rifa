-- Add email to artisans table to allow linking when user hasn't registered yet
ALTER TABLE public.artisans ADD COLUMN IF NOT EXISTS email TEXT;

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS artisans_email_idx ON public.artisans (email);
