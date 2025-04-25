
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

const AppLayout = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col p-4">
        <div className="h-16 w-full mb-4">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="flex-1 w-full">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
