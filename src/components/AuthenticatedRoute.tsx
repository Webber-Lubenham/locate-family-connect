
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UnifiedAuthContext';
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
  const { user, loading } = useUser();
  
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
  
  // If user type is not available, redirect to dashboard
  // This will then let the Dashboard component handle further redirection
  if (!userType) {
    console.log('[AUTH ROUTE] No user type found, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // If user types are specified and user doesn't have the right type, redirect
  if (allowedUserTypes && !allowedUserTypes.includes(userType as UserType)) {
    // Redirect to appropriate dashboard based on user type
    console.log(`[AUTH ROUTE] User type ${userType} not allowed, redirecting to appropriate dashboard`);
    switch (userType) {
      case 'student':
        return <Navigate to={DASHBOARD_ROUTES.student} replace />;
      case 'parent':
      case 'guardian':
        return <Navigate to={DASHBOARD_ROUTES.guardian} replace />;
      case 'admin':
        return <Navigate to={DASHBOARD_ROUTES.admin} replace />;
      case 'developer':
        return <Navigate to={DASHBOARD_ROUTES.developer} replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;
