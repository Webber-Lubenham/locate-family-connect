
import React, { useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Map, Home, Book, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AppHeader } from "@/components/AppHeader";
import { MobileNavigation } from "@/components/MobileNavigation";

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, loading, profile } = useUser();
  const { toast } = useToast();
  
  const isAuthenticated = !!user;
  const isLoading = loading;
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('[LAYOUT] User not authenticated, redirecting to login');
      toast({
        variant: "destructive",
        title: "Acesso negado",
        description: "Faça login para acessar esta página",
      });
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const userType = profile?.user_type || user?.user_type || 'student';
  const dashboardLink = userType === 'parent' ? '/parent-dashboard' : '/student-dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />

      <div className="flex flex-1">
        {/* Sidebar - Desktop only */}
        <aside className="w-64 bg-white border-r shadow-sm hidden md:block">
          <nav className="p-4 space-y-2">
            <Link
              to={dashboardLink}
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            {userType === "student" && (
              <>
                <Link
                  to="/student-map"
                  className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
                >
                  <Map className="h-5 w-5" />
                  Meu Mapa
                </Link>
                <Link
                  to="/guardians"
                  className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
                >
                  <User className="h-5 w-5" />
                  Meus Responsáveis
                </Link>
              </>
            )}
            <Link
              to="/api-docs"
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
            >
              <Book className="h-5 w-5" />
              API Docs
            </Link>
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <MobileNavigation userType={userType} dashboardLink={dashboardLink} />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
