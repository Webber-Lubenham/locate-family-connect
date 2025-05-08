import React from "react";
import { Outlet } from "react-router-dom";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import AppHeader from "@/components/AppHeader";
import MobileNavigation from "@/components/MobileNavigation";

const AppLayout: React.FC = () => {
  const { user } = useUnifiedAuth();
  const userType = user?.user_metadata?.user_type || 'student';
  
  const getDashboardLink = () => {
    switch(userType) {
      case 'parent':
        return '/parent-dashboard';
      case 'student':
        return '/student-dashboard';
      default:
        return '/dashboard';
    }
  };
  
  const dashboardLink = getDashboardLink();

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <MobileNavigation userType={userType} dashboardLink={dashboardLink} />
    </div>
  );
};

export default AppLayout;
