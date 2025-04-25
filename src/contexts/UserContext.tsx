/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from '../lib/supabase';
const supabase = getSupabaseClient();
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// Extend Window interface to include our subscription
interface Window {
  __educonnect_auth_subscription__?: any;
}

declare global {
  interface Window {
    __educonnect_auth_subscription__?: any;
  }
}

// Create a ref to store the subscription
const subscriptionRef = useRef<any>(null);

// Extended User type with additional properties
interface ExtendedUser extends User {
  email?: string;
  phone?: string;
  user_type?: string;
  full_name?: string;
  profile?: Profile;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  user_type: string;
  created_at: string;
  updated_at: string;
  email?: string;
  phone_country?: string;
  role?: string;
}

interface UserContextType {
  user: ExtendedUser | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<ExtendedUser>) => void;
  updateProfile: (profileData: Partial<Profile>) => void;
  checkSession: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useAuth = () => {
  const { user, session, profile, loading } = useContext(UserContext);
  return { user, session, profile, loading };
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to update profile
  const updateProfile = (profileData: Partial<Profile>) => {
    setProfile(prevProfile => {
      if (!prevProfile) return null;
      return {
        ...prevProfile,
        ...profileData
      };
    });
  };

  // Function to check session
  const checkSession = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        console.log('Sessão encontrada, atualizando usuário');
        updateUser(currentSession.user);
        await fetchUserProfile(currentSession.user.id);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    }
  };

  // Function to update user state
  const updateUser = async (userData: Partial<ExtendedUser>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      ...userData
    };
    
    setUser(updatedUser);
  };

  // Function to fetch user profile with improved error handling
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      
      // Check if we already have a profile before fetching
      if (profile && profile.user_id === userId) {
        console.log("Profile already loaded:", profile);
        setLoading(false);
        return;
      }

      // Create a fallback profile from user metadata
      let userMetadata = user?.user_metadata || {};
      let fallbackProfile: Profile = {
        id: userId,
        user_id: userId,
        full_name: userMetadata.full_name || user?.email?.split('@')[0] || 'User',
        user_type: userMetadata.user_type || 'student',
        phone: userMetadata.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: user?.email,
        phone_country: 'UK'
      };

      // Try to get profile from database
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.warn("Error fetching profile:", error);
          // If we couldn't fetch, try to create a profile
          if (error.code === 'PGRST116' || error.code === 'PGRST204' || error.message?.includes('not found')) {
            try {
              const { data: insertedProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  user_id: userId,
                  full_name: fallbackProfile.full_name,
                  user_type: fallbackProfile.user_type,
                  phone: fallbackProfile.phone,
                  email: user?.email
                })
                .select()
                .single();

              if (insertError) {
                console.error('Error creating profile:', insertError);
                // Use fallback profile
              } else if (insertedProfile) {
                fallbackProfile = insertedProfile as Profile;
              }
            } catch (insertErr) {
              console.error('Exception creating profile:', insertErr);
              // Continue with fallback profile
            }
          }
        } else if (data) {
          // Use fetched profile data
          fallbackProfile = data as Profile;
        }
      } catch (fetchErr) {
        console.error('Exception fetching profile:', fetchErr);
        // Continue with fallback profile
      }

      // Set profile data
      console.log("Using profile:", fallbackProfile);
      
      // Update user with profile data
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          profile: fallbackProfile,
          user_type: fallbackProfile.user_type || 'student',
          full_name: fallbackProfile.full_name,
          phone: fallbackProfile.phone || undefined
        };
      });
      
      setProfile(fallbackProfile);
      
    } catch (error: unknown) {
      console.error('Error in profile fetch/create process:', error instanceof Error ? error.message : error);
      
      // Set minimum user data from metadata
      if (user?.user_metadata) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            user_type: user?.user_metadata?.user_type || 'student',
            full_name: user?.user_metadata?.full_name || 'New User'
          };
        });
        
        // Create a fallback profile when we can't fetch or create one in the database
        const fallbackProfile: Profile = {
          id: userId,
          user_id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          user_type: user?.user_metadata?.user_type || 'student',
          phone: user?.user_metadata?.phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email: user?.email,
          phone_country: 'UK'
        };
        
        setProfile(fallbackProfile);
      }
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Logout function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Não foi possível encerrar sua sessão. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const authStateChangeHandler = useCallback(async (_event: string, newSession: Session | null) => {
    console.log("Auth state change:", newSession ? "user logged in" : "user logged out");
    setSession(newSession);
    
    if (newSession?.user) {
      console.log("Authenticated user:", newSession.user);
      setUser(newSession.user);
      await fetchUserProfile(newSession.user.id);
    } else {
      console.log("User logged out or session expired");
      setProfile(null);
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Function to update user state
  const updateUser = async (userData: Partial<ExtendedUser>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      ...userData
    };
    
    setUser(updatedUser);
  };

  // Function to fetch user profile with improved error handling
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      
      // Check if we already have a profile before fetching
      if (profile && profile.user_id === userId) {
        console.log("Profile already loaded:", profile);
        setLoading(false);
        return;
      }

      // Create a fallback profile from user metadata
      let userMetadata = user?.user_metadata || {};
      let fallbackProfile: Profile = {
        id: userId,
        user_id: userId,
        full_name: userMetadata.full_name || user?.email?.split('@')[0] || 'User',
        user_type: userMetadata.user_type || 'student',
        phone: userMetadata.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: user?.email,
        phone_country: 'UK'
      };

      // Try to get profile from database
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.warn("Error fetching profile:", error);
          // If we couldn't fetch, try to create a profile
          if (error.code === 'PGRST116' || error.code === 'PGRST204' || error.message?.includes('not found')) {
            try {
              const { data: insertedProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  user_id: userId,
                  full_name: fallbackProfile.full_name,
                  user_type: fallbackProfile.user_type,
                  phone: fallbackProfile.phone,
                  email: user?.email
                })
                .select()
                .single();

              if (insertError) {
                console.error('Error creating profile:', insertError);
                // Use fallback profile
              } else if (insertedProfile) {
                fallbackProfile = insertedProfile as Profile;
              }
            } catch (insertErr) {
              console.error('Exception creating profile:', insertErr);
              // Continue with fallback profile
            }
          }
        } else if (data) {
          // Use fetched profile data
          fallbackProfile = data as Profile;
        }
      } catch (fetchErr) {
        console.error('Exception fetching profile:', fetchErr);
        // Continue with fallback profile
      }

      // Set profile data
      console.log("Using profile:", fallbackProfile);
      
      // Update user with profile data
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          profile: fallbackProfile,
          user_type: fallbackProfile.user_type || 'student',
          full_name: fallbackProfile.full_name,
          phone: fallbackProfile.phone || undefined
        };
      });
      
      setProfile(fallbackProfile);
      
    } catch (error: unknown) {
      console.error('Error in profile fetch/create process:', error instanceof Error ? error.message : error);
      
      // Set minimum user data from metadata
      if (user?.user_metadata) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            user_type: user?.user_metadata?.user_type || 'student',
            full_name: user?.user_metadata?.full_name || 'New User'
          };
        });
        
        // Create a fallback profile when we can't fetch or create one in the database
        const fallbackProfile: Profile = {
          id: userId,
          user_id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          user_type: user?.user_metadata?.user_type || 'student',
          phone: user?.user_metadata?.phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email: user?.email,
          phone_country: 'UK'
        };
        
        setProfile(fallbackProfile);
      }
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Logout function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Não foi possível encerrar sua sessão. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const authStateChangeHandler = useCallback(async (_event: string, newSession: Session | null) => {
    console.log("Auth state change:", newSession ? "user logged in" : "user logged out");
    setSession(newSession);
    
    if (newSession?.user) {
      console.log("Authenticated user:", newSession.user);
      setUser(newSession.user);
      await fetchUserProfile(newSession.user.id);
    } else {
      console.log("User logged out or session expired");
      setProfile(null);
      setLoading(false);
    }
  }, [fetchUserProfile]);

  React.useEffect(() => {
    console.log('Inicializando contexto de usuário');
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          console.log('Sessão encontrada, atualizando usuário');
          updateUser(currentSession.user);
          await fetchUserProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(authStateChangeHandler);
    subscriptionRef.current = subscription;

    // Store the subscription in the window object for persistence
    if (typeof window !== 'undefined') {
      window.__educonnect_auth_subscription__ = subscription;
    }

    return () => {
      console.log('Limpando subscription de auth state change');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      
      // Clear subscription from window object
      if (typeof window !== 'undefined') {
        window.__educonnect_auth_subscription__ = undefined;
      }
    };
  }, []);

  React.useEffect(() => {
    const cleanup = () => {
      // Clear any existing subscriptions
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      
      // Clear subscription from window object
      if (typeof window !== 'undefined') {
        window.__educonnect_auth_subscription__ = undefined;
      }
    };

    window.addEventListener('beforeunload', cleanup);
    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, []);

  return (
    <UserContext.Provider value={{ 
      user,
      session,
      profile,
      loading,
      signOut,
      updateUser,
      updateProfile,
      checkSession
    }}>
  }

  return () => {
    console.log('Limpando subscription de auth state change');
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    
    // Clear subscription from window object
    if (typeof window !== 'undefined') {
      window.__educonnect_auth_subscription__ = undefined;
    }
  };
}, []);

useEffect(() => {
  const cleanup = () => {
    // Clear any existing subscriptions
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    
    // Clear subscription from window object
    if (typeof window !== 'undefined') {
      window.__educonnect_auth_subscription__ = undefined;
    }
  };

  window.addEventListener('beforeunload', cleanup);
  return () => {
    cleanup();
    window.removeEventListener('beforeunload', cleanup);
  };
}, []);

return (
  <UserContext.Provider value={{ 
    user,
    session,
    profile,
    loading,
    signOut,
    updateUser,
    updateProfile,
    checkSession
  }}>
    {children}
  </UserContext.Provider>
);

const useAuth = () => {
  const { user, session, profile, loading } = useContext(UserContext);
  return { user, session, profile, loading };
};

export default UserContext;
