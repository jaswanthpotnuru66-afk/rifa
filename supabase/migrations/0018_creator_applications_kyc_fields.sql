-- Add missing KYC and operational fields to creator_applications table
ALTER TABLE public.creator_applications 
ADD COLUMN IF NOT EXISTS processing_time TEXT,
ADD COLUMN IF NOT EXISTS digital_proof_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pan_number TEXT,
ADD COLUMN IF NOT EXISTS account_holder TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
ADD COLUMN IF NOT EXISTS gstin TEXT,
ADD COLUMN IF NOT EXISTS pickup_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Update RLS policies just in case
ALTER TABLE public.creator_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to creator applications" ON public.creator_applications;
CREATE POLICY "Allow all access to creator applications" ON public.creator_applications FOR ALL USING (true);
