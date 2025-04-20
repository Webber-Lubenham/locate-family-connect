
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from '../lib/supabase';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  user_type: string;
  phone: string | null;
  created_at: string;
  // Add missing properties used in our components
  name?: string;
  email?: string;
  role?: string;
  phone_country?: string;
  updated_at?: string;
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
  const [initializationError, setInitializationError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        name: userMetadata.full_name || user?.email?.split('@')[0] || 'User',
        role: userMetadata.user_type || 'student',
        phone_country: 'UK'
      };

      // Try to get profile from database
      try {
        const { data, error } = await supabase.client
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.warn("Error fetching profile:", error);
          
          // If we couldn't fetch, try to create a profile
          if (error.code === 'PGRST116' || error.code === 'PGRST204' || error.message?.includes('not found')) {
            await createUserProfile(userId, userMetadata, fallbackProfile);
          } else {
            // For other errors, still continue with fallback profile
            console.log("Using fallback profile due to database error");
          }
        } else if (data) {
          // Use fetched profile data
          fallbackProfile = data as Profile;
          console.log("Profile fetched successfully:", data);
        }
      } catch (fetchErr) {
        console.error('Exception fetching profile:', fetchErr);
        // Continue with fallback profile
        console.log("Using fallback profile due to exception");
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
          email: user?.email,
          role: user?.user_metadata?.user_type || 'student',
        };
        
        setProfile(fallbackProfile);
      }
      
      // Show toast with error but don't block the app
      toast({
        title: "Erro ao carregar perfil",
        description: "Algumas funcionalidades podem estar indisponíveis. Por favor, recarregue a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, profile, toast]);

  // Helper function to create user profile with proper error handling
  const createUserProfile = async (userId: string, userMetadata: any, fallbackProfile: Profile) => {
    try {
      // First try with standard client
      const { data: insertedProfile, error: insertError } = await supabase.client
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: fallbackProfile.full_name,
          user_type: fallbackProfile.user_type,
          phone: fallbackProfile.phone,
          email: user?.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        
        // If the admin client is available, try using it as a fallback
        if (supabase.admin) {
          console.log("Trying to create profile with admin privileges");
          const { data: adminInsertedProfile, error: adminInsertError } = await supabase.admin
            .from('profiles')
            .insert({
              user_id: userId,
              full_name: fallbackProfile.full_name,
              user_type: fallbackProfile.user_type,
              phone: fallbackProfile.phone,
              email: user?.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (adminInsertError) {
            console.error('Even admin could not create profile:', adminInsertError);
            // Continue with fallback profile
            return fallbackProfile;
          } else if (adminInsertedProfile) {
            return adminInsertedProfile as Profile;
          }
        }
      } else if (insertedProfile) {
        return insertedProfile as Profile;
      }
      
      return fallbackProfile;
    } catch (insertErr) {
      console.error('Exception creating profile:', insertErr);
      // Continue with fallback profile
      return fallbackProfile;
    }
  };

  // Logout function
  const signOut = async () => {
    try {
      await supabase.client.auth.signOut();
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

  useEffect(() => {
    console.log("Inicializando contexto de usuário");
    
    // Set up auth state change listener
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const { data: { subscription: authSubscription } } = supabase.client.auth.onAuthStateChange(authStateChangeHandler);
      subscription = authSubscription;
    } catch (error) {
      console.error("Failed to set up auth state change listener:", error);
      setInitializationError(error instanceof Error ? error : new Error('Failed to initialize authentication'));
      setLoading(false);
      return;
    }

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("Verificando sessão existente");
        const { data: { session: currentSession } } = await supabase.client.auth.getSession();
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log("Sessão existente encontrada para:", currentSession.user.email);
          setUser(currentSession.user);
          // Only fetch profile if we don't have one or if user ID changed
          if (!profile || profile.user_id !== currentSession.user.id) {
            await fetchUserProfile(currentSession.user.id);
          } else {
            setLoading(false);
          }
        } else {
          console.log("No existing session found");
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível verificar sua sessão. Algumas funcionalidades podem estar indisponíveis.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      console.log("Limpando subscription de auth state change");
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [authStateChangeHandler, fetchUserProfile, profile, toast]);

  // If we have an initialization error, show a fallback UI
  if (initializationError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50 text-red-800">
        <h2 className="text-2xl font-bold mb-4">Erro de inicialização</h2>
        <p className="mb-4">Não foi possível inicializar o sistema de autenticação.</p>
        <button 
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          onClick={() => window.location.reload()}
        >
          Recarregar página
        </button>
      </div>
    );
  }

  const contextValue = {
    session, 
    user, 
    profile, 
    loading, 
    signOut,
    updateUser
  };

  return (
    <UserContext.Provider value={contextValue}>
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

// Helper function to check if user is authenticated
export const useAuth = () => {
  const { user, session } = useUser();
  return { user, session };
};
