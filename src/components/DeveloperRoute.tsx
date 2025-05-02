
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useIsDeveloper } from '@/hooks/use-developer';

export interface DeveloperRouteProps {
  children?: React.ReactNode;
}

const DeveloperRoute: React.FC<DeveloperRouteProps> = ({ children }) => {
  const isDeveloper = useIsDeveloper();
  const loading = false; // Since useIsDeveloper doesn't have a loading state, we set it to false
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  if (!isDeveloper) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children ? <>{children}</> : <Outlet />;
};

export default DeveloperRoute;
