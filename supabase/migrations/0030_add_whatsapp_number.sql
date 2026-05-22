-- Migration: Add whatsapp_number column to creator_applications and artisans
-- This enables direct contact between buyers and artisans via WhatsApp

ALTER TABLE public.creator_applications 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

ALTER TABLE public.artisans
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
