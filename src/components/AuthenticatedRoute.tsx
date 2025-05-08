
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { DASHBOARD_ROUTES } from '@/lib/auth-redirects';
import type { UserType } from '@/lib/auth-redirects';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: UserType[];
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ 
  children,
  allowedUserTypes
}) => {
  const { user, loading } = useUnifiedAuth();
  
  // Show loading indicator while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  // Log authentication state for debugging
  console.log('[AUTH ROUTE] Authentication check:', { 
    isAuthenticated: !!user,
    userType: user?.user_type,
    allowedTypes: allowedUserTypes
  });
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const userType = user.user_type || user.user_metadata?.user_type;
  
  // If user type is not available, redirect to profile to complete registration
  if (!userType) {
    console.log('[AUTH ROUTE] No user type found, redirecting to profile');
    return <Navigate to="/profile" replace />;
  }

  // If user types are specified and user doesn't have the right type, redirect
  if (allowedUserTypes && !allowedUserTypes.includes(userType as UserType)) {
    console.log(`[AUTH ROUTE] User type ${userType} not allowed, redirecting to appropriate dashboard`);
    return <Navigate to={DASHBOARD_ROUTES[userType as keyof typeof DASHBOARD_ROUTES]} replace />;
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;
