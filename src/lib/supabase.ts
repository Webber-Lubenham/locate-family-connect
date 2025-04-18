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

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
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

/**
 * Singleton Supabase Client Manager
 */
// Global Supabase Client Singleton
const supabaseClientSingleton = (() => {
  let clientInstance: SupabaseClient | null = null;
  let adminClientInstance: SupabaseClient | null = null;

  // Extended window interface for Supabase clients
interface ExtendedWindow extends Window {
  __supabaseMainClient?: SupabaseClient;
  __supabaseAdminClient?: SupabaseClient;
  __supabaseClients?: SupabaseClient[];
}

// Prevent multiple client creation
  const createSingletonClient = (url: string, key: string, options: Parameters<typeof createClient>[2], type: 'client' | 'admin'): SupabaseClient => {
    // Use a more specific global tracking mechanism
    const globalKey = type === 'client' ? '__supabaseMainClient' : '__supabaseAdminClient';
    const window$ = window as ExtendedWindow;

    // Compute a unique storage key
    const storageKey = `${type === 'client' ? 'educonnect-auth' : 'educonnect-admin'}-${url.replace(/[^a-zA-Z0-9]/g, '-')}`;

    // If a client already exists, return it
    if (window$[globalKey]) {
      console.warn(`Preventing duplicate ${type} Supabase client creation`);
      return window$[globalKey]!;
    }

    // Destroy any existing GoTrueClient to prevent conflicts
    try {
      const existingClient = createClient(url, key, { auth: { persistSession: false } });
      existingClient.auth.signOut();
    } catch {}

    // Create new client with unique storage configuration
    const newClient = createClient(url, key, {
      ...options,
      auth: {
        ...options.auth,
        storageKey: storageKey,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        ...options.global,
        headers: {
          ...options.global?.headers,
          'X-Client-Type': type,
          'X-Client-Info': `educonnect-${type}-system/1.0.0`
        }
      }
    });

    // Attach immutable metadata
    Object.defineProperties(newClient, {
      supabaseUrl: { value: url, writable: false, enumerable: false },
      supabaseKey: { value: key, writable: false, enumerable: false },
      clientType: { value: type, writable: false, enumerable: false },
      storageKey: { value: storageKey, writable: false, enumerable: false }
    });

    // Store client in global window object
    window$[globalKey] = newClient;

    // Optional: Track in a global clients array for debugging
    window$.__supabaseClients = window$.__supabaseClients || [];
    window$.__supabaseClients.push(newClient);

    return newClient;
  };

  return {
    getClient: () => {
      if (!clientInstance) {
        clientInstance = createSingletonClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            flowType: 'pkce',
            // Ensure these are consistent with createSingletonClient
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          },
          global: {
            headers: {
              'X-Client-Purpose': 'main-application'
            }
          }
        }, 'client');
      }
      return clientInstance;
    },

    getAdminClient: () => {
      if (!adminClientInstance) {
        adminClientInstance = createSingletonClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            // Ensure these are consistent with createSingletonClient
            persistSession: false,
            autoRefreshToken: true,
            detectSessionInUrl: false
          },
          global: {
            headers: {
              'X-Client-Purpose': 'admin-operations'
            }
          }
        }, 'admin');
      }
      return adminClientInstance;
    }
  };
})();

// Convenience functions for easier usage
function getSupabaseClient(): SupabaseClient {
  return supabaseClientSingleton.getClient();
}

function getSupabaseAdminClient(): SupabaseClient {
  return supabaseClientSingleton.getAdminClient();
}

/**
 * User authentication options
 */
interface UserAuthOptions {
  phone?: string;
  full_name: string;
  user_type: string;
}

/**
 * Authentication methods
 */
const supabaseAuth = {
  client: supabaseClientSingleton.getClient(),

  signUp: async (email: string, password: string, options: UserAuthOptions) => {
    try {
      // Validate inputs
      const validatedEmail = emailSchema.parse(email);
      const validatedPassword = passwordSchema.parse(password);

      // Validate and format phone
      const phone = options.phone?.replace(/\s/g, '');
      const formattedPhone = phone ? phoneSchema.parse(phone.startsWith('+44') ? phone : `+44${phone}`) : undefined;

      // Validate user options
      if (!options.full_name || !options.user_type) {
        throw new AuthenticationError('Full name and user type are required', 'INVALID_INPUT');
      }

      const { data: authData, error: authError } = await supabaseClientSingleton.getClient().auth.signUp({
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
        console.error('Signup Supabase error:', authError);
        throw new AuthenticationError(authError.message || 'Signup failed', authError.code);
      }

      if (authData?.user) {
        const { error: profileError } = await supabaseClientSingleton.getClient().from('profiles').insert({
          user_id: authData.user.id,
          full_name: options.full_name,
          phone: formattedPhone,
          user_type: options.user_type
        });

        if (profileError) {
          console.warn('Signup succeeded, but profile creation failed:', profileError);
          // Non-critical error, so we don't throw
        }
      }

      return authData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new AuthenticationError('Invalid input', 'VALIDATION_ERROR');
      }
      
      console.error('Signup error:', error);
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      // Validate inputs
      const validatedEmail = emailSchema.parse(email);
      const validatedPassword = passwordSchema.parse(password);

      const { data, error } = await supabaseClientSingleton.getClient().auth.signInWithPassword({ 
        email: validatedEmail, 
        password: validatedPassword 
      });

      if (error) {
        console.error('Signin Supabase error:', error);
        throw new AuthenticationError(error.message || 'Signin failed', error.code);
      }

      return { data, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new AuthenticationError('Invalid input', 'VALIDATION_ERROR');
      }

      console.error('Signin error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabaseClientSingleton.getClient().auth.signOut();
      if (error) {
        console.error('Signout Supabase error:', error);
        throw new AuthenticationError(error.message || 'Signout failed', error.code);
      }
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  },

  getCurrentSession: async () => {
    try {
      const { data: { session }, error } = await supabaseClientSingleton.getClient().auth.getSession();
      
      if (error) {
        console.error('Session retrieval error:', error);
        throw new AuthenticationError(error.message || 'Failed to get session', error.code);
      }

      return { session, error: null };
    } catch (error) {
      console.error('Session retrieval unexpected error:', error);
      throw error;
    }
  }
};

/**
 * Exported Supabase interface
 */
export const supabase = {
  client: supabaseClientSingleton.getClient(),
  admin: supabaseClientSingleton.getAdminClient(),
  // Maintain backwards compatibility
  getClient: () => supabaseClientSingleton.getClient(),
  getAdminClient: () => supabaseClientSingleton.getAdminClient(),
  auth: supabaseAuth,
  from: (table: string) => supabaseClientSingleton.getClient().from(table)
};

export const supabaseClientSingleton;
