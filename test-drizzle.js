import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './src/lib/db/schema';

const connectionString = 'postgresql://postgres.rsvjnndhbyyxktbczlnk:[npg_X9G3BnCgbTOi@ep]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres';

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function testConnection() {
  try {
    // Test the database connection
    const users = await db.select().from(users);
    console.log('Database connection successful! Found users:', users.length);

    // Test inserting a user
    const result = await db.insert(users).values({
      name: 'Test User',
      role: 'student',
      email: 'test@example.com',
      phone: '+44 7386 797716',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('User inserted successfully:', result);
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();
