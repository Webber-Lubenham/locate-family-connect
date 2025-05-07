
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UnifiedAuthContext';
import type { ExtendedUser } from '@/contexts/AuthContext';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: string[];
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ 
  children,
  allowedUserTypes
}) => {
  const { user, loading, userProfile } = useUser();
  
  // Show loading indicator while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const userType = user?.user_type || userProfile?.user_type;
  
  // If user type is not available, redirect to profile page
  if (!userType) {
    return <Navigate to="/profile" replace />;
  }
  
  // If user types are specified and user doesn't have the right type, redirect
  if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
    // Redirect to appropriate dashboard based on user type
    switch (userType) {
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'parent':
      case 'guardian':
        return <Navigate to="/guardian/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/webhook" replace />;
      case 'developer':
        return <Navigate to="/developer/flow" replace />;
      default:
        return <Navigate to="/profile" replace />;
    }
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;
