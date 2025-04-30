
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { schema } from './schema';

// Get the connection string from environment
const connectionString = import.meta.env.VITE_DATABASE_URL;

// Create a more robust connection with proper error handling
const createDbClient = () => {
  try {
    // Disable prefetch as it is not supported for "Transaction" pool mode
    const client = postgres(connectionString, { 
      prepare: false,
      // Add connection timeout and other reliability settings
      connect_timeout: 10,
      max_lifetime: 60 * 30 // 30 minutes
    });
    return drizzle(client, { schema });
  } catch (error) {
    console.error("Database connection error:", error);
    // Return a minimal client that will throw clear errors when used
    // This prevents the app from crashing during initialization
    return drizzle(postgres("", { prepare: false }));
  }
};

// Create the database client
const db = createDbClient();

export { db, schema };
