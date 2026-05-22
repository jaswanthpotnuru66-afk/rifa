-- Migration: Add artisan response columns to disputes
-- This ensures the artisan's response does not overwrite the buyer's original description.

ALTER TABLE disputes 
ADD COLUMN IF NOT EXISTS artisan_response TEXT,
ADD COLUMN IF NOT EXISTS artisan_evidence_urls TEXT[];
