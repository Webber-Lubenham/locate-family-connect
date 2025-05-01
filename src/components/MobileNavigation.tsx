import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Map, User, Book, LogOut } from "lucide-react";
import { useDevice } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";

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
  
  // If not mobile or tablet, don't render the component
  if (deviceType !== 'mobile' && deviceType !== 'tablet') return null;
  
  // Function to check if the current route is active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  // Enhanced height adjustment based on device and orientation
  const getNavHeight = () => {
    if (isXxs) {
      return orientation === 'portrait' ? 'h-10' : 'h-8';
    }
    
    if (isXs) {
      return orientation === 'portrait' ? 'h-12' : 'h-10';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'portrait' ? 'h-14' : 'h-11';
    }
    
    return orientation === 'portrait' ? 'h-16' : 'h-14';
  };
  
  // Enhanced icon size adjustment based on device and orientation
  const getIconSize = () => {
    if (isXxs) {
      return orientation === 'portrait' ? 'h-3.5 w-3.5' : 'h-3 w-3';
    }
    
    if (isXs) {
      return orientation === 'portrait' ? 'h-4 w-4' : 'h-3.5 w-3.5';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'portrait' ? 'h-5 w-5' : 'h-4 w-4';
    }
    
    return 'h-5 w-5';
  };
  
  // Enhanced text size adjustment based on device and orientation
  const getTextSize = () => {
    if (isXxs) {
      return orientation === 'portrait' ? 'text-[0.55rem]' : 'text-[0.5rem]';
    }
    
    if (isXs) {
      return orientation === 'portrait' ? 'text-[0.6rem]' : 'text-[0.55rem]';
    }
    
    if (deviceType === 'mobile') {
      return orientation === 'portrait' ? 'text-xs' : 'text-[0.65rem]';
    }
    
    return 'text-xs';
  };
  
  // Adjust spacing based on device and orientation
  const getSpacing = () => {
    if (isXxs || (isXs && orientation === 'landscape')) {
      return 'mt-0.5 p-0.5';
    }
    
    return 'mt-0.5 p-1';
  };
  
  // On very wide landscape screens, show icons side-by-side instead of stacked
  const getLayoutMode = () => {
    // For very wide landscape screens on mobile devices
    if (orientation === 'landscape' && aspectRatio > 2) {
      return 'flex-row items-center justify-center';
    }
    
    // Default stacked layout
    return 'flex-col items-center justify-center';
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex justify-around items-center ${getNavHeight()} px-1 shadow-lg`}>
      <Link
        to={dashboardLink}
        className={`flex ${getLayoutMode()} ${getSpacing()} ${getTextSize()} ${
          isActive(dashboardLink) ? "text-blue-600 font-semibold" : "text-gray-600"
        }`}
      >
        <Home className={`${getIconSize()} ${isActive(dashboardLink) ? "text-blue-600" : ""}`} />
        <span className={orientation === 'landscape' && aspectRatio > 2 ? "ml-1" : "mt-0.5"}>Home</span>
      </Link>
      <Link
        to="/student-map"
        className={`flex ${getLayoutMode()} ${getSpacing()} ${getTextSize()} ${
          isActive("/student-map") ? "text-blue-600 font-semibold" : "text-gray-600"
        }`}
      >
        <Map className={`${getIconSize()} ${isActive("/student-map") ? "text-blue-600" : ""}`} />
        <span className={orientation === 'landscape' && aspectRatio > 2 ? "ml-1" : "mt-0.5"}>Mapa</span>
      </Link>
      {userType === "student" && (
        <Link
          to="/guardians"
          className={`flex ${getLayoutMode()} ${getSpacing()} ${getTextSize()} ${
            isActive("/guardians") ? "text-blue-600 font-semibold" : "text-gray-600"
          }`}
        >
          <User className={`${getIconSize()} ${isActive("/guardians") ? "text-blue-600" : ""}`} />
          <span className={orientation === 'landscape' && aspectRatio > 2 ? "ml-1" : "mt-0.5"}>Responsáveis</span>
        </Link>
      )}
      <Link
        to="/profile"
        className={`flex ${getLayoutMode()} ${getSpacing()} ${getTextSize()} ${
          isActive("/profile") ? "text-blue-600 font-semibold" : "text-gray-600"
        }`}
      >
        <User className={`${getIconSize()} ${isActive("/profile") ? "text-blue-600" : ""}`} />
        <span className={orientation === 'landscape' && aspectRatio > 2 ? "ml-1" : "mt-0.5"}>Perfil</span>
      </Link>
      <button
        onClick={handleLogout}
        className={`flex ${getLayoutMode()} ${getSpacing()} ${getTextSize()} text-red-600`}
      >
        <LogOut className={getIconSize()} />
        <span className={orientation === 'landscape' && aspectRatio > 2 ? "ml-1" : "mt-0.5"}>Sair</span>
      </button>
    </nav>
  );
};
