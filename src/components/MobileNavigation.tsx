
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Map, User, Book } from "lucide-react";

interface MobileNavigationProps {
  userType: string;
  dashboardLink: string;
}

export const MobileNavigation = ({ userType, dashboardLink }: MobileNavigationProps) => {
  const location = useLocation();
  
  // Função para verificar se a rota atual é a ativa
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex justify-around items-center h-16 px-1 shadow-lg">
      <Link
        to={dashboardLink}
        className={`flex flex-col items-center justify-center px-2 py-1 text-xs ${
          isActive(dashboardLink) ? "text-blue-600 font-semibold" : "text-gray-600"
        }`}
      >
        <Home className={`h-5 w-5 ${isActive(dashboardLink) ? "text-blue-600" : ""}`} />
        <span>Home</span>
      </Link>
      <Link
        to="/student-map"
        className={`flex flex-col items-center justify-center px-2 py-1 text-xs ${
          isActive("/student-map") ? "text-blue-600 font-semibold" : "text-gray-600"
        }`}
      >
        <Map className={`h-5 w-5 ${isActive("/student-map") ? "text-blue-600" : ""}`} />
        <span>Mapa</span>
      </Link>
      {userType === "student" && (
        <Link
          to="/guardians"
          className={`flex flex-col items-center justify-center px-2 py-1 text-xs ${
            isActive("/guardians") ? "text-blue-600 font-semibold" : "text-gray-600"
          }`}
        >
          <User className={`h-5 w-5 ${isActive("/guardians") ? "text-blue-600" : ""}`} />
          <span>Responsáveis</span>
        </Link>
      )}
      <Link
        to="/profile"
        className={`flex flex-col items-center justify-center px-2 py-1 text-xs ${
          isActive("/profile") ? "text-blue-600 font-semibold" : "text-gray-600"
        }`}
      >
        <User className={`h-5 w-5 ${isActive("/profile") ? "text-blue-600" : ""}`} />
        <span>Perfil</span>
      </Link>
    </nav>
  );
};
