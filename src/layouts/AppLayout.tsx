
import React, { useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { AlertCircle, User, LogOut, Map, Home, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";
import Logo from "@/components/Logo";
import { useToast } from "@/components/ui/use-toast";
import useMobile from "@/hooks/use-mobile";

const AppLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, profile } = useUser();
  const { toast } = useToast();
  const isMobile = useMobile();
  
  console.log('[LAYOUT] AppLayout rendered, auth status:', { isAuthenticated, isLoading });

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
    console.log('[LAYOUT] Still loading auth state');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const userType = profile?.user_type || 'student';
  console.log('[LAYOUT] User type:', userType);
  
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
  console.log('[LAYOUT] Dashboard link:', dashboardLink);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div onClick={() => navigate("/")} className="cursor-pointer">
              <Logo />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
                className="gap-2"
              >
                <User className="h-5 w-5" />
                Perfil
              </Button>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
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
              <Link
                to="/student-map"
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
              >
                <Map className="h-5 w-5" />
                Meu Mapa
              </Link>
            )}
            {userType === "parent" && (
              <Link
                to="/student-map"
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium"
              >
                <Map className="h-5 w-5" />
                Mapa dos Estudantes
              </Link>
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

        {/* Mobile bottom navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-10 flex justify-around items-center h-16">
          <Link
            to={dashboardLink}
            className="flex flex-col items-center justify-center px-4 py-1 text-gray-700"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            to="/student-map"
            className="flex flex-col items-center justify-center px-4 py-1 text-gray-700"
          >
            <Map className="h-5 w-5" />
            <span className="text-xs">Mapa</span>
          </Link>
          <Link
            to="/api-docs"
            className="flex flex-col items-center justify-center px-4 py-1 text-gray-700"
          >
            <Book className="h-5 w-5" />
            <span className="text-xs">API</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center justify-center px-4 py-1 text-gray-700"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Perfil</span>
          </Link>
        </nav>

        {/* Main content */}
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
