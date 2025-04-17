const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    // Check users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) throw usersError;
    console.log('Users table exists:', usersData.length > 0);

    // Check auth.users table
    const { data: authData, error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .limit(1);

    if (authError) throw authError;
    console.log('Auth users table exists:', authData.length > 0);

    // Check for test data
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .eq('name', 'Test User');

    if (testError) throw testError;
    console.log('Test data exists:', testData.length > 0);

  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkDatabase();
