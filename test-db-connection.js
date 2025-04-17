const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use the service role key for testing
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test the auth connection
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    console.log('Auth connection successful! Found users:', authData.users.length);

    // Test the database connection
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) throw usersError;
    console.log('Database connection successful! Found users:', usersData.length);

    console.log('All connections are working correctly!');
  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
