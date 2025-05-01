
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Map, Home, Book, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AppHeader } from "@/components/AppHeader";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useDeviceType } from "@/hooks/use-mobile";

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, loading, profile } = useUser();
  const { toast } = useToast();
  const deviceType = useDeviceType();
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );
  
  // Atualiza a orientação quando o usuário gira o dispositivo
  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isAuthenticated = !!user;
  const isLoading = loading;
  const isMobileOrTablet = deviceType === 'mobile' || deviceType === 'tablet';
  
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

  // Ajusta o padding do conteúdo principal com base no dispositivo e orientação
  const getMainPadding = () => {
    if (deviceType === 'mobile') {
      return orientation === 'landscape' ? 'p-1 pb-16' : 'p-2 pb-20';
    } else if (deviceType === 'tablet') {
      return orientation === 'landscape' ? 'p-2 pb-16' : 'p-3 pb-20';
    }
    return 'p-4 lg:p-6 xl:p-8 md:pb-8';
  };
  
  // Ajusta a largura da sidebar com base no dispositivo
  const getSidebarWidth = () => {
    if (deviceType === 'tablet') {
      return 'w-48';
    }
    return 'w-56 lg:w-64';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />

      <div className="flex flex-1">
        {/* Sidebar - Desktop only */}
        <aside className={`${getSidebarWidth()} bg-white border-r shadow-sm hidden md:block`}>
          <nav className="p-3 lg:p-4 space-y-1 lg:space-y-2">
            <Link
              to={dashboardLink}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium text-sm lg:text-base"
            >
              <Home className="h-4 w-4 lg:h-5 lg:w-5" />
              Dashboard
            </Link>
            {userType === "student" && (
              <>
                <Link
                  to="/student-map"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium text-sm lg:text-base"
                >
                  <Map className="h-4 w-4 lg:h-5 lg:w-5" />
                  Meu Mapa
                </Link>
                <Link
                  to="/guardians"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium text-sm lg:text-base"
                >
                  <User className="h-4 w-4 lg:h-5 lg:w-5" />
                  Meus Responsáveis
                </Link>
              </>
            )}
            <Link
              to="/api-docs"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium text-sm lg:text-base"
            >
              <Book className="h-4 w-4 lg:h-5 lg:w-5" />
              API Docs
            </Link>
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <MobileNavigation userType={userType} dashboardLink={dashboardLink} />

        {/* Main Content - Ajustado para melhor responsividade */}
        <main className={`flex-1 ${getMainPadding()} overflow-y-auto w-full`}>
          <div className="container mx-auto max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
