import postgres from 'postgres';

const connectionString = 'postgresql://postgres.rsvjnndhbyyxktbczlnk:[npg_X9G3BnCgbTOi@ep]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres';

const client = postgres(connectionString, { prepare: false });

async function testConnection() {
  try {
    // Test the database connection
    const result = await client('SELECT 1 + 1 AS result');
    console.log('Database connection successful! Result:', result[0].result);

    // Test inserting a user
    const insertResult = await client(
      `INSERT INTO users (name, role, email, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      ['Test User', 'student', 'test@example.com', '+44 7386 797716', new Date().toISOString(), new Date().toISOString()]
    );

    console.log('User inserted successfully:', insertResult[0]);
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();
