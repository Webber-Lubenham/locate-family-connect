
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Skeleton } from "@/components/ui/skeleton";

const AuthLayout = () => {
  const { user, loading, profile } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-[400px] h-[500px]" />
      </div>
    );
  }

  if (user && profile) {
    // Redirect to appropriate dashboard based on user role
    if (profile.role === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    } else if (profile.role === 'parent') {
      return <Navigate to="/parent-dashboard" replace />;
    }
    // Default fallback
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
