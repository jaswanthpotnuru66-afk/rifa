-- Add Latitude and Longitude to user_addresses for Map Pinning
ALTER TABLE public.user_addresses 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
