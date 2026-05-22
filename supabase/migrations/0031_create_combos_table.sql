CREATE TABLE IF NOT EXISTS public.combos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tier TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    price TEXT NOT NULL,
    tag TEXT,
    img_idx INTEGER DEFAULT 2,
    dark_mode BOOLEAN DEFAULT false,
    includes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;

-- Everyone can view combos
CREATE POLICY "Combos are viewable by everyone" ON public.combos
    FOR SELECT USING (true);

-- Only admins can modify combos
CREATE POLICY "Admins can insert combos" ON public.combos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update combos" ON public.combos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete combos" ON public.combos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
