import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error:', error.message);
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Session:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
