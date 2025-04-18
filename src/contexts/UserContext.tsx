/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import type { Session, User, PostgrestError } from "@supabase/supabase-js";
import { supabaseClientSingleton } from '../lib/supabase';
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  user_type: string;
  phone: string;
  created_at: string;
  // Add missing properties used in our components
  name?: string;
  email?: string;
  role?: string;
  phone_country?: string;
}

interface ExtendedUser extends User {
  profile?: Profile;
  user_type?: string;
  full_name?: string;
  phone?: string;
  metadata?: {
    full_name?: string;
    user_type?: string;
    phone?: string;
  };
}

interface UserContextType {
  session: Session | null;
  user: ExtendedUser | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<ExtendedUser>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const client = supabaseClientSingleton.getClient();

  // Função para atualizar o estado do usuário
  const updateUser = async (userData: Partial<ExtendedUser>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        ...userData
      };
    });
  };

  // Função para buscar perfil do usuário
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      let profileData = null;
      let error = null;

      const result = await client
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      profileData = result.data;
      error = result.error;

      if (error) {
        // If no profile exists, create a basic profile
        if (error.code === 'PGRST116') {
          const newProfile: Profile = {
            id: userId, // Use user ID as temporary ID
            user_id: userId,
            full_name: user?.user_metadata?.full_name || 'New User',
            user_type: 'student', // Default to student
            phone: user?.phone || '',
            created_at: new Date().toISOString(),
            name: user?.user_metadata?.full_name || 'New User',
            email: user?.email,
            role: 'student',
            phone_country: 'UK'
          };

          // Attempt to insert the new profile
          const { data: insertedProfile, error: insertError } = await client
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }

          // Use the inserted profile
          profileData = insertedProfile;
        } else {
          throw error;
        }
      }

      if (profileData) {
        const profile = {
          id: profileData.id as string,
          user_id: profileData.user_id as string,
          full_name: profileData.full_name as string,
          user_type: profileData.user_type as string,
          phone: profileData.phone as string,
          created_at: profileData.created_at as string,
          // Map profile data to the fields our components expect
          name: profileData.full_name,
          email: user?.email,
          role: profileData.user_type,
          phone_country: 'UK' // Default value for the UK format
        } as Profile;

        setUser({
          ...user,
          profile,
          user_type: profile.user_type || 'student',
          full_name: profile.full_name,
          phone: profile.phone
        });
        setProfile(profile);
      }
    } catch (error: unknown) {
      console.error('Error fetching/creating profile:', error instanceof Error ? error.message : error);
      // Fallback to a minimal user state
      setUser({
        ...user,
        user_type: 'student',
        full_name: user?.user_metadata?.full_name || 'New User'
      });
    } finally {
      setLoading(false);
    }
  }, [client, user]);

  // Função para fazer logout
  const signOut = async () => {
    await client.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    navigate('/');
  };

  const authStateChangeHandler = useCallback(async (event: string, newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);

    // Fetch user profile after auth state change
    if (newSession?.user) {
      await fetchUserProfile(newSession.user.id);
      setLoading(false);
    } else {
      setProfile(null);
      setLoading(false);
      navigate('/login');
    }
  }, [fetchUserProfile, navigate]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = client.auth.onAuthStateChange(authStateChangeHandler);

    // Check for existing session
    const checkSession = async () => {
      const { data: { session: currentSession } } = await client.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchUserProfile(currentSession.user.id);
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
        navigate('/login');
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [client.auth, authStateChangeHandler, fetchUserProfile, navigate]);

  return (
    <UserContext.Provider value={{ 
      session, 
      user, 
      profile, 
      loading, 
      signOut,
      updateUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

  
// Helper function to check if user is authenticated
export const useAuth = () => {
  const { user, session } = useUser();
  
  return React.useMemo(() => ({
    isAuthenticated: !!user,
    user,
    session
  }), [user, session]);
};
