import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkUsersColumns() {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
        console.error('Error fetching users:', error);
    } else if (data && data.length > 0) {
        console.log('Users columns:', Object.keys(data[0]));
    } else {
        console.log('No users found to inspect columns.');
    }
}

checkUsersColumns();
