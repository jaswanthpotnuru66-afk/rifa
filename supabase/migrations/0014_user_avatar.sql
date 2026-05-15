-- Add avatar_url column to users table to store profile pictures
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
