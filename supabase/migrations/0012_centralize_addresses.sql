-- Add addresses JSONB column to users table and drop the separate table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;

-- Note: We are keeping the user_addresses table for now to avoid breaking existing code,
-- but we will transition the frontend to use the users.addresses column.
