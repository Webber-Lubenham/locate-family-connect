
import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import type { ExtendedUser } from './AuthContext';

// Re-export ExtendedUser type
export type { ExtendedUser };

type UnifiedAuthContextType = {
  user: ExtendedUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: object) => Promise<{ error: any | null }>;
  userProfile: any;
  forgotPassword: (email: string) => Promise<{ error: any | null }>; 
};

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our consolidated auth hook
  const auth = useAuth();

  // Create the value object with proper typing
  const value: UnifiedAuthContextType = {
    user: auth.user as ExtendedUser,
    loading: auth.loading,
    signIn: auth.signIn,
    signOut: auth.signOut,
    signUp: auth.signUp,
    userProfile: auth.user,
    forgotPassword: auth.forgotPassword
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
