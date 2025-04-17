import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from '../lib/supabase';
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  user_type: string;
  phone: string;
  created_at: string;
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Fetch user profile after auth state change
        if (newSession?.user) {
          fetchUserProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
          created_at: profileData.created_at as string
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

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <UserContext.Provider value={{ session, user, profile, loading, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
