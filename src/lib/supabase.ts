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

// Utility function for phone formatting
const formatPhone = (raw: string) => {
  const clean = raw.replace(/\s/g, '');
  return clean.startsWith('+') ? clean : `+44${clean}`;
};

// SINGLETON IMPLEMENTATION
// Create a single Supabase client for the entire app
let _client: SupabaseClient | null = null;
let _adminClient: SupabaseClient | null = null;

// Get client with proper initialization checks
function getClient(): SupabaseClient {
  if (_client === null) {
    console.log('[SUPABASE] Initializing main client');
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'educonnect-auth-storage',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'educonnect-auth-system/v1'
        }
      }
    });
  }
  return _client;
}

// Get admin client with proper initialization checks
function getAdminClient(): SupabaseClient | null {
  if (!supabaseServiceKey) {
    console.error('[SUPABASE] Missing service key for admin client');
    return null;
  }
  
  return null;
}

// Initialize client once - DO NOT re-export or create new instances elsewhere
const client = getClient();
const adminClient = null;

// Export the main supabase object with enhanced logging
export const supabase = {
  client,
  admin: adminClient,
  
  // Auth methods with logging
  auth: {
    signUp: async (email: string, password: string, options: { 
      phone?: string;
      full_name: string;
      user_type: string;
    }) => {
      console.log(`[AUTH] Attempting signup for email: ${email}`);
      try {
        const validatedEmail = emailSchema.parse(email);
        const validatedPassword = passwordSchema.parse(password);

        const formattedPhone = options.phone ? phoneSchema.parse(formatPhone(options.phone)) : undefined;

        if (!options.full_name || !options.user_type) {
          console.error('[AUTH] Missing required fields for signup');
          throw new AuthenticationError('Full name and user type are required', 'INVALID_INPUT');
        }

        console.log(`[AUTH] Signup data validated, proceeding with Supabase signup for: ${email}`);
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
          console.error(`[AUTH] Signup error: ${authError.message}`);
          throw new AuthenticationError(authError.message || 'Signup failed', authError.code);
        }

        if (!authData?.user) {
          console.error('[AUTH] User creation failed - no user returned');
          throw new AuthenticationError('User creation failed', 'USER_NOT_CREATED');
        }

        console.log(`[AUTH] Signup successful for: ${email}, user ID: ${authData.user.id}`);
        return authData;
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error(`[AUTH] Validation error during signup: ${JSON.stringify(error.errors)}`);
          throw new AuthenticationError('Invalid input', 'VALIDATION_ERROR');
        }
        console.error(`[AUTH] Unhandled signup error:`, error);
        throw error;
      }
    },

    signIn: async (email: string, password: string) => {
      console.log(`[AUTH] Attempting signin for email: ${email}`);
      try {
        const validatedEmail = emailSchema.parse(email);
        const validatedPassword = passwordSchema.parse(password);

        console.log(`[AUTH] Signin data validated, proceeding with Supabase signin for: ${email}`);
        const { data, error } = await client.auth.signInWithPassword({
          email: validatedEmail,
          password: validatedPassword
        });

        if (error) {
          console.error(`[AUTH] Signin error: ${error.message}`);
          throw new AuthenticationError(error.message || 'Signin failed', error.code);
        }

        console.log(`[AUTH] Signin successful for: ${email}, user ID: ${data.user?.id}`);
        return { data, error: null };
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error(`[AUTH] Validation error during signin: ${JSON.stringify(error.errors)}`);
          throw new AuthenticationError('Invalid input', 'VALIDATION_ERROR');
        }
        console.error(`[AUTH] Unhandled signin error:`, error);
        throw error;
      }
    },

    signOut: async () => {
      console.log('[AUTH] Attempting signout');
      const { error } = await client.auth.signOut();
      if (error) {
        console.error(`[AUTH] Signout error: ${error.message}`);
        throw new AuthenticationError(error.message || 'Signout failed', error.code);
      }
      console.log('[AUTH] Signout successful');
      return { error: null };
    },

    getCurrentSession: async () => {
      console.log('[AUTH] Fetching current session');
      const { data: { session }, error } = await client.auth.getSession();
      if (error) {
        console.error(`[AUTH] Error fetching session: ${error.message}`);
        throw new AuthenticationError(error.message || 'Failed to get session', error.code);
      }
      console.log(`[AUTH] Session fetch completed, session exists: ${!!session}`);
      return { session, error: null };
    },
    
    // Direct access to client auth methods
    signInWithPassword: (credentials: {email: string, password: string}) => {
      console.log(`[AUTH] Using direct signInWithPassword method for: ${credentials.email}`);
      return client.auth.signInWithPassword(credentials);
    },
    
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      console.log('[AUTH] Setting up auth state change listener');
      return client.auth.onAuthStateChange(callback);
    },
    
    getSession: () => {
      console.log('[AUTH] Getting session directly');
      return client.auth.getSession();
    }
  },
  
  // Helper methods with logging
  from: (table: string) => {
    console.log(`[DB] Accessing table: ${table}`);
    return client.from(table);
  }
};

// Simplified accessors for backward compatibility
export const supabaseAuth = {
  formatPhone,

  signUp: async (email: string, password: string, options: { 
    phone?: string;
    full_name: string;
    user_type: string;
  }) => {
    return supabase.auth.signUp(email, password, options);
  },

  signIn: async (email: string, password: string) => {
    return supabase.auth.signIn(email, password);
  },

  signOut: async () => {
    return supabase.auth.signOut();
  },

  getCurrentSession: async () => {
    return supabase.auth.getCurrentSession();
  },
  
  // Add direct methods for compatibility
  signInWithPassword: (credentials: {email: string, password: string}) => {
    return client.auth.signInWithPassword(credentials);
  }
};

// Simplified Singleton for compatibility
export const supabaseClientSingleton = {
  getClient: () => client,
  getAdminClient: () => {
    if (adminClient === null && supabaseServiceKey) {
      console.log('[SUPABASE] Initializing admin client on demand');
      return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });
    }
    return adminClient;
  }
};

export default supabase;
