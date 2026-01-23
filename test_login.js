import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wwcudsuzbvaabhwwtkhg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Y3Vkc3V6YnZhYWJod3d0a2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzIyMjcsImV4cCI6MjA4NDc0ODIyN30.lAnzrecA1LivEL2U49kcTBC4bVm-IZBfTiG5d0MIXoU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log("Attempting login...")
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@rifa.com',
        password: 'admin123'
    });

    if (error) {
        console.error('Login Failed:', error.message);
    } else {
        console.log('Login Successful:', data.user.email);
    }
}

testLogin();
