
import React, { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth';

// Define the extended User type that includes user_type and other needed properties
export interface ExtendedUser extends User {
  user_type?: string;
  full_name?: string;
}

type UnifiedAuthContextType = {
  user: ExtendedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: object) => Promise<{ error: any | null }>;
  userProfile: any;
};

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the auth hook to access authentication state and methods
  const auth = useAuth();

  // Create the value object with proper typing
  const value: UnifiedAuthContextType = {
    user: auth.user as ExtendedUser,
    loading: auth.isLoading,
    signIn: auth.signIn,
    signOut: auth.signOut,
    signUp: auth.signUp,
    userProfile: auth.user
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

// Export the hook that will be used throughout the app
export const useUser = () => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UnifiedAuthProvider');
  }
  return context;
};

// Legacy exports for backward compatibility
export const UserProvider = UnifiedAuthProvider;
