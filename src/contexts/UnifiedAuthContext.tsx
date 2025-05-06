
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// Define UserProfile type
export interface UserProfile {
  id: number;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  phone_country?: string;
  created_at: string;
  updated_at: string;
  user_type: string;
}

// Context interface
interface UserContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null; // Added userProfile
  updateUser: (user: User) => void; // Added updateUser
  signOut: () => Promise<void>;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// UserProvider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Added userProfile state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        setSession(session);
        setUser(session?.user || null);
        
        // Fetch user profile if user exists
        if (session?.user) {
          fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Unexpected error during getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`Auth event: ${event}`);
      setSession(newSession);
      setUser(newSession?.user || null);
      
      // Fetch user profile if user exists after auth change
      if (newSession?.user) {
        fetchUserProfile(newSession.user.id);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Clean up subscription
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Function to update user
  const updateUser = (newUser: User) => {
    setUser(newUser);
    if (newUser?.id) {
      fetchUserProfile(newUser.id);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Context value
  const value = {
    user,
    session,
    loading,
    userProfile, // Added userProfile to context value
    updateUser,  // Added updateUser to context value
    signOut
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the auth context
export function useUser() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}
