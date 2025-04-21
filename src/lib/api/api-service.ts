
import { supabase } from '@/lib/supabase';

/**
 * API service for EduConnect
 * This service provides methods for interacting with the API endpoints
 * documented in the Swagger specification
 */
export const apiService = {
  /**
   * Authentication APIs
   */
  auth: {
    /**
     * Register a new user
     * @param email User email
     * @param password User password
     * @param userData User profile data
     */
    signUp: async (email: string, password: string, userData: {
      full_name: string;
      user_type: string;
      phone?: string;
    }) => {
      console.log('[API] Calling signUp endpoint');
      try {
        const response = await supabase.auth.signUp(email, password, userData);
        console.log('[API] SignUp response:', response);
        return response;
      } catch (error) {
        console.error('[API] SignUp error:', error);
        throw error;
      }
    },

    /**
     * Sign in existing user
     * @param email User email
     * @param password User password
     */
    signIn: async (email: string, password: string) => {
      console.log('[API] Calling signIn endpoint');
      try {
        const response = await supabase.auth.signIn(email, password);
        console.log('[API] SignIn success');
        return response;
      } catch (error) {
        console.error('[API] SignIn error:', error);
        throw error;
      }
    },

    /**
     * Sign out current user
     */
    signOut: async () => {
      console.log('[API] Calling signOut endpoint');
      try {
        const response = await supabase.auth.signOut();
        console.log('[API] SignOut success');
        return response;
      } catch (error) {
        console.error('[API] SignOut error:', error);
        throw error;
      }
    },

    /**
     * Get current session
     */
    getSession: async () => {
      console.log('[API] Getting current session');
      try {
        const response = await supabase.auth.getCurrentSession();
        console.log('[API] GetSession response:', response?.session ? 'Session exists' : 'No session');
        return response;
      } catch (error) {
        console.error('[API] GetSession error:', error);
        throw error;
      }
    }
  },

  /**
   * Profile APIs
   */
  profiles: {
    /**
     * Get profile by user ID
     * @param userId User ID
     */
    getProfile: async (userId: string) => {
      console.log(`[API] Getting profile for user: ${userId}`);
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
        
        if (error) {
          console.error('[API] GetProfile error:', error);
          throw error;
        }
        
        console.log('[API] GetProfile success:', data);
        return data;
      } catch (error) {
        console.error('[API] GetProfile error:', error);
        throw error;
      }
    },

    /**
     * Update profile
     * @param userId User ID
     * @param profileData Profile data to update
     */
    updateProfile: async (userId: string, profileData: any) => {
      console.log(`[API] Updating profile for user: ${userId}`);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', userId);

        if (error) {
          console.error('[API] UpdateProfile error:', error);
          throw error;
        }
        
        console.log('[API] UpdateProfile success');
        return data;
      } catch (error) {
        console.error('[API] UpdateProfile error:', error);
        throw error;
      }
    }
  },

  /**
   * Location APIs
   */
  location: {
    /**
     * Share location with parent
     * @param locationData Location data to share
     */
    shareLocation: async (locationData: {
      email: string;
      latitude: number;
      longitude: number;
      studentName: string;
    }) => {
      console.log(`[API] Sharing location with: ${locationData.email}`);
      try {
        const response = await fetch(`${supabase.client.supabaseUrl}/functions/v1/share-location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.client.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify(locationData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[API] ShareLocation error:', errorData);
          throw new Error(errorData.error || 'Failed to share location');
        }

        const data = await response.json();
        console.log('[API] ShareLocation success:', data);
        return data;
      } catch (error) {
        console.error('[API] ShareLocation error:', error);
        throw error;
      }
    }
  }
};

export default apiService;
