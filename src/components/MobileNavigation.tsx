
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Map, User, Book } from "lucide-react";
import { useDevice } from "@/hooks/use-mobile";

interface MobileNavigationProps {
  userType: string;
  dashboardLink: string;
}

export const MobileNavigation = ({ userType, dashboardLink }: MobileNavigationProps) => {
  const location = useLocation();
  const { type: deviceType, orientation, isXs } = useDevice();
  
  // Se não for mobile ou tablet, não renderizar o componente
  if (deviceType !== 'mobile' && deviceType !== 'tablet') return null;
  
  // Função para verificar se a rota atual é a ativa
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  // Ajusta a altura da barra de navegação com base no dispositivo e orientação
  const getNavHeight = () => {
    if (isXs) {
      return orientation === 'portrait' ? 'h-12' : 'h-10';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'portrait' ? 'h-14' : 'h-11';
    }
    
    return orientation === 'portrait' ? 'h-16' : 'h-14';
  };
  
  // Ajusta o tamanho dos ícones com base no dispositivo e orientação
  const getIconSize = () => {
    if (isXs) {
      return orientation === 'portrait' ? 'h-4 w-4' : 'h-3.5 w-3.5';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'portrait' ? 'h-5 w-5' : 'h-4 w-4';
    }
    
    return 'h-5 w-5';
  };
  
  // Ajusta o tamanho do texto com base no dispositivo e orientação
  const getTextSize = () => {
    if (isXs) {
      return orientation === 'portrait' ? 'text-[0.6rem]' : 'text-[0.55rem]';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'portrait' ? 'text-xs' : 'text-[0.65rem]';
    }
    
    return 'text-xs';
  };
  
  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex justify-around items-center ${getNavHeight()} px-1 shadow-lg`}>
      <Link
        to={dashboardLink}
        className={`flex flex-col items-center justify-center p-1 ${getTextSize()} ${
          isActive(dashboardLink) ? "text-blue-600 font-semibold" : "text-gray-600"
        }`}
      >
        <Home className={`${getIconSize()} ${isActive(dashboardLink) ? "text-blue-600" : ""}`} />
        <span className="mt-0.5">Home</span>
      </Link>
      <Link
        to="/student-map"
        className={`flex flex-col items-center justify-center p-1 ${getTextSize()} ${
          isActive("/student-map") ? "text-blue-600 font-semibold" : "text-gray-600"
        }`}
      >
        <Map className={`${getIconSize()} ${isActive("/student-map") ? "text-blue-600" : ""}`} />
        <span className="mt-0.5">Mapa</span>
      </Link>
      {userType === "student" && (
        <Link
          to="/guardians"
          className={`flex flex-col items-center justify-center p-1 ${getTextSize()} ${
            isActive("/guardians") ? "text-blue-600 font-semibold" : "text-gray-600"
          }`}
        >
          <User className={`${getIconSize()} ${isActive("/guardians") ? "text-blue-600" : ""}`} />
          <span className="mt-0.5">Responsáveis</span>
        </Link>
      )}
      <Link
        to="/profile"
        className={`flex flex-col items-center justify-center p-1 ${getTextSize()} ${
          isActive("/profile") ? "text-blue-600 font-semibold" : "text-gray-600"
        }`}
      >
        <User className={`${getIconSize()} ${isActive("/profile") ? "text-blue-600" : ""}`} />
        <span className="mt-0.5">Perfil</span>
      </Link>
    </nav>
  );
};
