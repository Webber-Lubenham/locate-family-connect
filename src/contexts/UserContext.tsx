
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { User as SupabaseUser } from '@supabase/supabase-js';

// Define the types for user and profile
export type User = {
  id: string;
  email: string | null;
  user_metadata: any;
  user_type?: string;
  full_name?: string;
  phone?: string;
};

export type UserProfile = {
  id: number;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  phone_country: string | null;
  created_at: string;
  updated_at: string;
  user_type: string; // Changed from optional to required
};

// Create context for user and profile data
type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  updateUser: (user: User) => void;
  signOut: () => Promise<void>; // Added signOut function
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!userId) return null;

    console.log('Fetching profile for user:', userId);
    
    try {
      const { data: profileData, error } = await supabase.client
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Attempt to create the profile if it doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          return await createUserProfile(userId);
        }
        
        return null;
      }

      return profileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  // Function to create a new user profile if it doesn't exist
  const createUserProfile = useCallback(async (userId: string) => {
    if (!userId) return null;
    
    try {
      console.log('Trying to create profile with admin privileges');

      // Get current user metadata
      const { data: userData } = await supabase.client.auth.getUser();
      const userMeta = userData?.user?.user_metadata || {};
      
      const newProfile = {
        user_id: userId,
        full_name: userMeta.full_name || '',
        phone: userMeta.phone || null,
        phone_country: userMeta.phone_country || 'UK',
        user_type: userMeta.user_type || 'student', // Add user_type
      };

      // Try to create the profile without select()
      const { data: createdProfile, error } = await supabase.client
        .from('profiles')
        .insert([newProfile]);

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      // If insert successful, fetch the created profile
      if (!createdProfile) {
        const { data: fetchedProfile } = await supabase.client
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        return fetchedProfile;
      }

      return createdProfile[0];
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  // Implement signOut function
  const signOut = useCallback(async () => {
    try {
      await supabase.client.auth.signOut();
      setUser(null);
      setProfile(null);
      window.location.href = '/login'; // Redirect to login page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  // Check for existing session on load
  useEffect(() => {
    console.log('Verificando sessão existente');
    let authListener: any = null;

    const setupAuthListener = async () => {
      try {
        const { data } = await supabase.client.auth.getSession();
        const session = data?.session;
        
        if (session?.user) {
          console.log('Sessão existente encontrada para:', session.user.email);
          
          // Map Supabase user to our User type
          const mappedUser: User = {
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata,
            user_type: session.user.user_metadata?.user_type || 'student',
            full_name: session.user.user_metadata?.full_name || '',
            phone: session.user.user_metadata?.phone || null,
          };
          
          setUser(mappedUser);
          
          // Fetch profile for the authenticated user
          const profileData = await fetchUserProfile(session.user.id);
          setProfile(profileData);
        } else {
          console.log('No existing session found');
          setUser(null);
          setProfile(null);
          console.log('User logged out or session expired');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }

      // Setup auth state change listener
      authListener = supabase.client.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Authenticated user:', session.user);
          
          // Map Supabase user to our User type
          const mappedUser: User = {
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user.user_metadata,
            user_type: session.user.user_metadata?.user_type || 'student',
            full_name: session.user.user_metadata?.full_name || '',
            phone: session.user.user_metadata?.phone || null,
          };
          
          setUser(mappedUser);
          
          // Fetch profile for the newly authenticated user
          const profileData = await fetchUserProfile(session.user.id);
          setProfile(profileData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      });
    };

    setupAuthListener();

    // Cleanup
    return () => {
      if (authListener?.unsubscribe) {
        console.log('Limpando subscription de auth state change');
        authListener.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  const value = {
    user,
    profile,
    loading,
    updateUser,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
