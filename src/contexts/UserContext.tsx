import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '../lib/supabase';
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
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'educonnect-auth-system',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'educonnect-auth-system/1.0.0'
      }
    }
  });

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
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

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
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer logout
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    navigate('/');
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
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
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
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
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
  
  return {
    isAuthenticated: !!user,
    user,
    session
  };
};
