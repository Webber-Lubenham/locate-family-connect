import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { DASHBOARD_ROUTES, UserType, isValidUserType } from '@/lib/auth-redirects';

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
  console.log('[AUTH ROUTE DEBUG] user:', user);
  console.log('[AUTH ROUTE DEBUG] allowedUserTypes:', allowedUserTypes);
  const userTypeString = user?.user_type || 
                         user?.user_metadata?.user_type as string || 
                         user?.app_metadata?.user_type as string;
  console.log('[AUTH ROUTE DEBUG] userTypeString:', userTypeString);
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Get user type from user object, ensuring it's a valid UserType
  const userType = userTypeString as UserType;
  
  // Ensure userType is valid
  if (!isValidUserType(userTypeString)) {
    console.log('[AUTH ROUTE] No valid user type found, redirecting to profile');
    return <Navigate to="/profile" replace />;
  }
  
  // If user types are specified and user doesn't have the right type, redirect
  if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
    console.log(`[AUTH ROUTE] User type ${userType} not allowed, redirecting to appropriate dashboard`);
    return <Navigate to={DASHBOARD_ROUTES[userType]} replace />;
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;
