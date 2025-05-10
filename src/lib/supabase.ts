
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Use the correct environment variables
const supabaseUrl = 'https://rsvjnndhbyyxktbczlnk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4';

// Create a single instance of the Supabase client with proper configuration
console.log('[MCP][Supabase] Initializing Supabase client with URL:', supabaseUrl);
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: window?.localStorage
    }
  }
);

// Test the connection
supabase.auth.getSession().then(({ data: { session }, error }) => {
  console.log('[MCP][Supabase] Initial session check:', { session, error });
});

// Export default for backwards compatibility
export default supabase;
