const { createClient } = require('@supabase/supabase-js');

// Use the anon key for testing
const supabaseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test the auth connection
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test123456',
      options: {
        data: {
          name: 'Test User',
          role: 'student'
        }
      }
    });

    if (authError) throw authError;
    console.log('Auth connection successful!');

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
