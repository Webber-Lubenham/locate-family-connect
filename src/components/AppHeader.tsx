
import React from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/LogoutButton";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppHeader = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
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
          <LogoutButton 
            variant="destructive" 
            size={isMobile ? "icon" : "default"}
          />
        </div>
      </div>
    </header>
  );
};
