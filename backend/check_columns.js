import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkColumns() {
    // This is a bit tricky with Supabase JS, usually easier to just try a select and see what comes back
    const { data, error } = await supabase.from('user_addresses').select('*').limit(1);
    if (error) console.error('Error fetching columns:', error);
    else {
        if (data.length > 0) {
            console.log('Columns available:', Object.keys(data[0]));
        } else {
            console.log('No data to check columns. Trying a dummy insert.');
            const { error: insertError } = await supabase.from('user_addresses').insert([{
                user_id: '72686953-1254-402c-94b1-24e745e1f422',
                label: 'Test',
                full_name: 'Test',
                phone: '123',
                address_line1: 'Test',
                city: 'Test',
                state: 'Test',
                pincode: '123',
                latitude: 0,
                longitude: 0
            }]);
            if (insertError) {
                console.log('Insert failed (likely missing columns):', insertError.message);
            } else {
                console.log('Insert succeeded! Latitude/Longitude exist.');
            }
        }
    }
}

checkColumns();
