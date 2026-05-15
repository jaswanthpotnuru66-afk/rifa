import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testUpdate() {
    const userId = '72686953-1254-402c-94b1-24e745e1f422';
    const newAddresses = [{ id: 'test-id', label: 'Test Home', full_name: 'Test Name', address_line1: '123 Test St', city: 'Test City', state: 'TS', pincode: '123456', phone: '1234567890', is_default: true }];
    
    console.log('Attempting to update addresses for user:', userId);
    const { data, error } = await supabase.from('users').update({ addresses: newAddresses }).eq('id', userId).select();
    
    if (error) {
        console.error('Update Error:', error);
    } else {
        console.log('Update Success:', data);
    }
}

testUpdate();
