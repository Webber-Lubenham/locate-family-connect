
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: string[];
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ 
  children,
  allowedUserTypes
}) => {
  const { user, isLoading } = useAuth();
  
  // Show loading indicator while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user types are specified and user doesn't have the right type, redirect
  if (allowedUserTypes && !allowedUserTypes.includes(user.user_type)) {
    // Redirect students to their dashboard
    if (user.user_type === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    }
    // Redirect parents to their dashboard
    if (user.user_type === 'parent') {
      return <Navigate to="/parent-dashboard" replace />;
    }
    // Default redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;
