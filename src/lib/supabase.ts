
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(64, 'Password must be less than 64 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// Environment Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  throw new Error('Missing Supabase configuration');
}

// Custom error class for authentication
class AuthenticationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Global variables for client instances to ensure singletons
let clientInstance: SupabaseClient | null = null;
let adminClientInstance: SupabaseClient | null = null;

// Create and get supabase client - singleton pattern
const getSupabaseClient = (): SupabaseClient => {
  if (clientInstance) {
    return clientInstance;
  }
  
  console.log('Creating new Supabase client instance');
  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'educonnect-auth-storage',
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  
  return clientInstance;
};

// Create and get admin client - singleton pattern
const getSupabaseAdminClient = (): SupabaseClient | null => {
  if (!supabaseServiceKey) {
    console.error('❌ Missing Supabase service key');
    return null;
  }
  
  if (adminClientInstance) {
    return adminClientInstance;
  }
  
  console.log('Creating new Supabase admin client instance');
  adminClientInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    }
  });
  
  return adminClientInstance;
};

const formatPhone = (raw: string) => {
  const clean = raw.replace(/\s/g, '');
  return clean.startsWith('+') ? clean : `+44${clean}`;
};

// Initialize clients only once
const client = getSupabaseClient();
const adminClient = getSupabaseAdminClient();

// Main exported object with all necessary functions
export const supabase = {
  client,
  admin: adminClient,
  
  // Auth methods
  auth: {
    signUp: async (email: string, password: string, options: { 
      phone?: string;
      full_name: string;
      user_type: string;
    }) => {
      try {
        const validatedEmail = emailSchema.parse(email);
        const validatedPassword = passwordSchema.parse(password);

        const formattedPhone = options.phone ? phoneSchema.parse(formatPhone(options.phone)) : undefined;

        if (!options.full_name || !options.user_type) {
          throw new AuthenticationError('Full name and user type are required', 'INVALID_INPUT');
        }

        const { data: authData, error: authError } = await client.auth.signUp({
          email: validatedEmail,
          password: validatedPassword,
          options: {
            data: {
              full_name: options.full_name,
              user_type: options.user_type,
              phone: formattedPhone
            }
          }
        });

        if (authError) {
          throw new AuthenticationError(authError.message || 'Signup failed', authError.code);
        }

        if (!authData?.user) {
          throw new AuthenticationError('User creation failed', 'USER_NOT_CREATED');
        }

        return authData;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new AuthenticationError('Invalid input', 'VALIDATION_ERROR');
        }
        throw error;
      }
    },

    signIn: async (email: string, password: string) => {
      try {
        const validatedEmail = emailSchema.parse(email);
        const validatedPassword = passwordSchema.parse(password);

        const { data, error } = await client.auth.signInWithPassword({
          email: validatedEmail,
          password: validatedPassword
        });

        if (error) {
          throw new AuthenticationError(error.message || 'Signin failed', error.code);
        }

        return { data, error: null };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new AuthenticationError('Invalid input', 'VALIDATION_ERROR');
        }
        throw error;
      }
    },

    signOut: async () => {
      const { error } = await client.auth.signOut();
      if (error) {
        throw new AuthenticationError(error.message || 'Signout failed', error.code);
      }
      return { error: null };
    },

    getCurrentSession: async () => {
      const { data: { session }, error } = await client.auth.getSession();
      if (error) {
        throw new AuthenticationError(error.message || 'Failed to get session', error.code);
      }
      return { session, error: null };
    }
  },
  
  // Helper methods
  from: (table: string) => client.from(table)
};

export default supabase;
