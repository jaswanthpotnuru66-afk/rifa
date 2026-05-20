import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('platform_settings').select('*').limit(1);
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Platform Settings Columns:', data.length > 0 ? Object.keys(data[0]) : 'No records');
    }
}
check();
