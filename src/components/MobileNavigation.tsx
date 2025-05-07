import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Map, User, LogOut, Share, Bell } from "lucide-react";
import { useDevice } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UnifiedAuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  userType: string;
  dashboardLink: string;
}

export const MobileNavigation = ({ userType, dashboardLink }: MobileNavigationProps) => {
  const location = useLocation();
  const { signOut } = useUser();
  const { 
    type: deviceType, 
    orientation, 
    isXs, 
    isXxs, 
    height,
    width,
    aspectRatio
  } = useDevice();
  
  // Se não for mobile ou tablet, não renderize o componente
  if (deviceType !== 'mobile' && deviceType !== 'tablet') return null;
  
  // Funções para verificar se a rota atual está ativa
  const isActive = (path: string) => {
    return typeof location.pathname === 'string' && location.pathname.startsWith(path);
  };
  
  // Ajustes de altura para diferentes dispositivos e orientações
  const getNavHeight = () => {
    if (isXxs) {
      return orientation === 'portrait' ? 'h-12' : 'h-9';
    }
    
    if (isXs) {
      return orientation === 'portrait' ? 'h-14' : 'h-11';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'portrait' ? 'h-16' : 'h-12';
    }
    
    return orientation === 'portrait' ? 'h-16' : 'h-14';
  };
  
  // Ajustes de tamanho dos ícones para diferentes dispositivos
  const getIconSize = () => {
    if (isXxs) {
      return orientation === 'portrait' ? 'h-4 w-4' : 'h-3.5 w-3.5';
    }
    
    if (isXs) {
      return orientation === 'portrait' ? 'h-4.5 w-4.5' : 'h-4 w-4';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'portrait' ? 'h-5 w-5' : 'h-4.5 w-4.5';
    }
    
    return 'h-5 w-5';
  };
  
  // Ajustes de tamanho do texto para diferentes dispositivos
  const getTextSize = () => {
    if (isXxs) {
      return orientation === 'portrait' ? 'text-[0.6rem]' : 'text-[0.55rem]';
    }
    
    if (isXs) {
      return orientation === 'portrait' ? 'text-[0.65rem]' : 'text-[0.6rem]';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'portrait' ? 'text-xs' : 'text-[0.7rem]';
    }
    
    return 'text-xs';
  };
  
  // Ajustes de espaçamento para diferentes dispositivos
  const getSpacing = () => {
    if (isXxs || (isXs && orientation === 'landscape')) {
      return 'mt-0.5 p-0.5';
    }
    
    return 'mt-0.5 p-1';
  };
  
  // Layout adaptado para telas muito largas em landscape
  const getLayoutMode = () => {
    // Para telas muito largas em landscape
    if (orientation === 'landscape' && aspectRatio > 2) {
      return 'flex-row items-center justify-center';
    }
    
    // Layout padrão empilhado
    return 'flex-col items-center justify-center';
  };
  
  // Função de saída do aplicativo
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Estilo para botões/links ativos
  const getActiveStyle = (isActive: boolean) => {
    return cn(
      "transition-all duration-150",
      {
        "text-blue-600 font-semibold": isActive,
        "text-gray-600": !isActive,
        "scale-110": isActive && !isXxs && orientation === 'portrait',
      }
    );
  };

  // Badge de notificação
  const NotificationBadge = () => (
    <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-4 sm:w-4">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-red-500"></span>
    </span>
  );

  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex justify-around items-center px-1 shadow-lg",
      getNavHeight(),
      "safe-area-bottom" // Para iOS com notch
    )}>
      <Link
        to={dashboardLink}
        className={cn(
          `flex ${getLayoutMode()} ${getSpacing()} ${getTextSize()}`,
          getActiveStyle(isActive(dashboardLink))
        )}
      >
        <Home className={cn(getIconSize(), isActive(dashboardLink) ? "text-blue-600" : "")} />
        <span className={orientation === 'landscape' && aspectRatio > 2 ? "ml-1" : "mt-0.5"}>Home</span>
      </Link>

      <Link
        to="/student-map"
        className={cn(
          `flex ${getLayoutMode()} ${getSpacing()} ${getTextSize()}`,
          getActiveStyle(isActive("/student-map"))
        )}
      >
        <Map className={cn(getIconSize(), isActive("/student-map") ? "text-blue-600" : "")} />
        <span className={orientation === 'landscape' && aspectRatio > 2 ? "ml-1" : "mt-0.5"}>Mapa</span>
      </Link>

      {userType === "student" && (
        <Link
          to="/guardians"
          className={cn(
            `flex ${getLayoutMode()} ${getSpacing()} ${getTextSize()} relative`,
            getActiveStyle(isActive("/guardians"))
          )}
        >
          <Share className={cn(getIconSize(), isActive("/guardians") ? "text-blue-600" : "")} />
          <span className={orientation === 'landscape' && aspectRatio > 2 ? "ml-1" : "mt-0.5"}>Compartilhar</span>
        </Link>
      )}

      {userType === "parent" && (
        <Link
          to="/notifications"
          className={cn(
            `flex ${getLayoutMode()} ${getSpacing()} ${getTextSize()} relative`,
            getActiveStyle(isActive("/notifications"))
          )}
        >
          <div className="relative">
            <Bell className={cn(getIconSize(), isActive("/notifications") ? "text-blue-600" : "")} />
            <NotificationBadge />
          </div>
          <span className={orientation === 'landscape' && aspectRatio > 2 ? "ml-1" : "mt-0.5"}>Alertas</span>
        </Link>
      )}

      <Link
        to="/profile"
        className={cn(
          `flex ${getLayoutMode()} ${getSpacing()} ${getTextSize()}`,
          getActiveStyle(isActive("/profile"))
        )}
      >
        <User className={cn(getIconSize(), isActive("/profile") ? "text-blue-600" : "")} />
        <span className={orientation === 'landscape' && aspectRatio > 2 ? "ml-1" : "mt-0.5"}>Perfil</span>
      </Link>

      <button
        onClick={handleLogout}
        className={cn(
          `flex ${getLayoutMode()} ${getSpacing()} ${getTextSize()} text-red-600`,
          "transition-all duration-150 hover:text-red-700"
        )}
      >
        <LogOut className={getIconSize()} />
        <span className={orientation === 'landscape' && aspectRatio > 2 ? "ml-1" : "mt-0.5"}>Sair</span>
      </button>
    </nav>
  );
};
