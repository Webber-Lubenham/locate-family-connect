
import React from "react";
import { Link } from "react-router-dom";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import LogoutButton from "./LogoutButton";
import { useDevice } from "@/hooks/use-mobile";

export const AppHeader = () => {
  const { user, profile } = useUser();
  const { type: deviceType, isXs, orientation } = useDevice();
  
  if (!user) return null;
  
  // Ajusta o tamanho dos elementos do header com base no tipo de dispositivo
  const getHeaderHeight = () => {
    switch(deviceType) {
      case 'mobile':
        return orientation === 'portrait' ? 'h-12' : 'h-10';
      case 'tablet':
        return orientation === 'portrait' ? 'h-14' : 'h-12';
      default:
        return 'h-16';
    }
  };
  
  // Ajusta o tamanho da fonte com base no tipo de dispositivo
  const getFontSize = () => {
    if (isXs) {
      return 'text-sm';
    }
    
    switch(deviceType) {
      case 'mobile':
        return orientation === 'portrait' ? 'text-base' : 'text-sm';
      default:
        return 'text-lg md:text-xl';
    }
  };
  
  // Ajusta o container padding
  const getContainerPadding = () => {
    if (isXs) {
      return 'px-1 sm:px-2';
    }
    
    return 'px-2 sm:px-3 md:px-4';
  };
  
  // Ajusta tamanho dos ícones
  const getIconSize = () => {
    if (isXs || (deviceType === 'mobile' && orientation === 'landscape')) {
      return 'h-3.5 w-3.5';
    }
    
    return deviceType === 'mobile' ? 'h-4 w-4' : 'h-5 w-5';
  };
  
  // Ajusta tamanho do botão
  const getButtonSize = () => {
    if (isXs || (deviceType === 'mobile' && orientation === 'landscape')) {
      return 'w-7 h-7';
    }
    
    return deviceType === 'mobile' ? 'w-8 h-8' : 'w-9 h-9';
  };
  
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-30 w-full">
      <div className={`container mx-auto ${getContainerPadding()}`}>
        <div className={`flex items-center justify-between ${getHeaderHeight()}`}>
          <div className="flex items-center">
            <Link 
              to="/" 
              className={`font-bold ${getFontSize()} text-primary truncate max-w-[120px] xs:max-w-[180px] sm:max-w-full`}
            >
              EduConnect
            </Link>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full ${getButtonSize()}`}
                >
                  <User className={getIconSize()} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-50">
                <DropdownMenuLabel>
                  <div className="font-medium truncate">
                    {profile?.full_name || user?.full_name || user?.email?.split('@')[0]}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer w-full">
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={user?.user_type === 'parent' ? '/parent-dashboard' : '/student-dashboard'} className="cursor-pointer w-full">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton variant="ghost" size="sm" className="w-full justify-start h-auto p-2">
                  Sair
                </LogoutButton>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
