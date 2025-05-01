
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
  const { 
    type: deviceType, 
    isXs, 
    isXxs, 
    orientation,
    aspectRatio
  } = useDevice();
  
  if (!user) return null;
  
  // Enhanced header height adjustment based on device type and orientation
  const getHeaderHeight = () => {
    if (isXxs) {
      return orientation === 'portrait' ? 'h-10' : 'h-9';
    }
    
    if (isXs) {
      return orientation === 'portrait' ? 'h-11' : 'h-10';
    }
    
    switch(deviceType) {
      case 'mobile':
        return orientation === 'portrait' ? 'h-12' : 'h-10';
      case 'tablet':
        return orientation === 'portrait' ? 'h-14' : 'h-12';
      default:
        return 'h-16';
    }
  };
  
  // Enhanced font size adjustment based on device type
  const getFontSize = () => {
    if (isXxs) {
      return 'text-xs';
    }
    
    if (isXs) {
      return orientation === 'portrait' ? 'text-sm' : 'text-xs';
    }
    
    switch(deviceType) {
      case 'mobile':
        return orientation === 'portrait' ? 'text-base' : 'text-sm';
      default:
        return 'text-lg md:text-xl';
    }
  };
  
  // Enhanced container padding adjustment
  const getContainerPadding = () => {
    if (isXxs) {
      return 'px-1';
    }
    
    if (isXs) {
      return 'px-1 sm:px-2';
    }
    
    return 'px-2 sm:px-3 md:px-4';
  };
  
  // Enhanced icon size adjustment
  const getIconSize = () => {
    if (isXxs) {
      return 'h-3 w-3';
    }
    
    if (isXs || (deviceType === 'mobile' && orientation === 'landscape')) {
      return 'h-3.5 w-3.5';
    }
    
    return deviceType === 'mobile' ? 'h-4 w-4' : 'h-5 w-5';
  };
  
  // Enhanced button size adjustment
  const getButtonSize = () => {
    if (isXxs) {
      return 'w-6 h-6';
    }
    
    if (isXs || (deviceType === 'mobile' && orientation === 'landscape')) {
      return 'w-7 h-7';
    }
    
    return deviceType === 'mobile' ? 'w-8 h-8' : 'w-9 h-9';
  };
  
  // Adjust dropdown width based on device
  const getDropdownWidth = () => {
    if (isXxs || (isXs && orientation === 'landscape')) {
      return 'w-48';
    }
    
    return 'w-56';
  };
  
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-30 w-full">
      <div className={`container mx-auto ${getContainerPadding()}`}>
        <div className={`flex items-center justify-between ${getHeaderHeight()}`}>
          <div className="flex items-center">
            <Link 
              to="/" 
              className={`font-bold ${getFontSize()} text-primary truncate max-w-[100px] xxs:max-w-[120px] xs:max-w-[180px] sm:max-w-full`}
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
              <DropdownMenuContent 
                align="end" 
                className={`${getDropdownWidth()} z-50`}
                sideOffset={isXxs || isXs ? 4 : 6}
              >
                <DropdownMenuLabel className={isXxs || (isXs && orientation === 'landscape') ? 'py-1.5 text-xs' : ''}>
                  <div className={`font-medium truncate ${isXxs ? 'text-xs' : isXs ? 'text-sm' : ''}`}>
                    {profile?.full_name || user?.full_name || user?.email?.split('@')[0]}
                  </div>
                  <div className={`${isXxs ? 'text-[0.65rem]' : 'text-xs'} text-muted-foreground truncate`}>
                    {user?.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className={isXxs || (isXs && orientation === 'landscape') ? 'text-xs py-1.5' : ''}>
                  <Link to="/profile" className="cursor-pointer w-full">
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={isXxs || (isXs && orientation === 'landscape') ? 'text-xs py-1.5' : ''}>
                  <Link to={user?.user_type === 'parent' ? '/parent-dashboard' : '/student-dashboard'} className="cursor-pointer w-full">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton 
                  variant="ghost" 
                  size="sm" 
                  className={`w-full justify-start h-auto ${isXxs || (isXs && orientation === 'landscape') ? 'text-xs p-1.5' : 'p-2'}`}
                >
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
