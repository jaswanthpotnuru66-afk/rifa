import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'ALTER TABLE public.artisans ADD COLUMN IF NOT EXISTS gstin TEXT;' });
    if (error) {
        console.error('RPC failed:', error.message);
    } else {
        console.log('Success:', data);
    }
}
run();
