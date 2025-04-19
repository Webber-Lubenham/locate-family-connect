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

// Create a single Supabase client for the entire app
class SupabaseClientSingleton {
  private static instance: SupabaseClient;

  private constructor() {}

  public static getInstance(): SupabaseClient {
    if (!SupabaseClientSingleton.instance) {
      SupabaseClientSingleton.instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }
    return SupabaseClientSingleton.instance;
  }
}

// Export the singleton client
export const supabase = SupabaseClientSingleton.getInstance();

// Optional: Utility functions for authentication
export const supabaseAuth = {
  formatPhone,

  signUp: async (email: string, password: string, options: { full_name: string; user_type: string; phone?: string }) => {
    try {
      const validatedEmail = emailSchema.parse(email);
      const validatedPassword = passwordSchema.parse(password);

      const formattedPhone = options.phone ? phoneSchema.parse(formatPhone(options.phone)) : undefined;

      if (!options.full_name || !options.user_type) {
        throw new AuthenticationError('Full name and user type are required', 'INVALID_INPUT');
      }

      const { data: authData, error: authError } = await SupabaseClientSingleton.getInstance().auth.signUp({
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

      const { error: profileError } = await SupabaseClientSingleton.getInstance().from('profiles').insert({
        user_id: authData.user.id,
        full_name: options.full_name,
        phone: formattedPhone,
        user_type: options.user_type
      });

      if (profileError) {
        console.warn('Signup succeeded, but profile creation failed:', profileError);
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

      const { data, error } = await SupabaseClientSingleton.getInstance().auth.signInWithPassword({
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
    const { error } = await SupabaseClientSingleton.getInstance().auth.signOut();
    if (error) {
      throw new AuthenticationError(error.message || 'Signout failed', error.code);
    }
  },

  getCurrentSession: async () => {
    const { data: { session }, error } = await SupabaseClientSingleton.getInstance().auth.getSession();
    if (error) {
      throw new AuthenticationError(error.message || 'Failed to get session', error.code);
    }
    return { session, error: null };
  }
};

// Simplified Singleton for compatibility
export const supabaseClientSingleton = {
  getClient: () => SupabaseClientSingleton.getInstance(),
  getAdminClient: () => SupabaseClientSingleton.getInstance()
};