-- Link artisans to users
ALTER TABLE public.artisans ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);

-- Update RLS policies for artisans
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;

-- Allow artisans to update their own profile
CREATE POLICY "Artisans can update own profile" ON public.artisans
    FOR UPDATE USING (auth.uid() = user_id);

-- Public read access remains
-- CREATE POLICY "Public can read artisans" ON public.artisans FOR SELECT USING (true); -- Already exists likely
