-- Add pincode to artisans table for distance-based delivery calculation
alter table public.artisans add column if not exists pincode text;

-- Seed some pincodes for existing artisans if any
update public.artisans set pincode = '302001' where location ilike '%Rajasthan%';
update public.artisans set pincode = '400001' where location ilike '%Maharashtra%';
update public.artisans set pincode = '560001' where location ilike '%Karnataka%';
update public.artisans set pincode = '600001' where location ilike '%Tamil Nadu%';
update public.artisans set pincode = '110001' where location ilike '%Delhi%';
