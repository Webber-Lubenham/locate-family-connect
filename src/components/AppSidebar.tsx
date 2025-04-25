
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { Home, Map, Users, Book, User } from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  const { profile, user } = useUser();
  const userType = profile?.user_type || user?.user_type || 'student';
  
  // Função para verificar se um link está ativo
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
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

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-2 flex items-center">
          <Logo />
          <span className="ml-2 text-xl font-bold">EduConnect</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive(dashboardLink)} tooltip="Dashboard">
              <Link to={dashboardLink}>
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {userType === 'student' && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/student-map')} tooltip="Meu Mapa">
                  <Link to="/student-map">
                    <Map />
                    <span>Meu Mapa</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/guardians')} tooltip="Responsáveis">
                  <Link to="/guardians">
                    <Users />
                    <span>Meus Responsáveis</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
          
          {userType === 'parent' && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/student-map')} tooltip="Mapa dos Estudantes">
                <Link to="/student-map">
                  <Map />
                  <span>Mapa dos Estudantes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/api-docs')} tooltip="API Docs">
              <Link to="/api-docs">
                <Book />
                <span>API Docs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/profile')} tooltip="Perfil">
              <Link to="/profile">
                <User />
                <span>Perfil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-2">
          <LogoutButton variant="destructive" className="w-full justify-center">
            Sair
          </LogoutButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
