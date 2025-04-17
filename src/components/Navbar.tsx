
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, Menu, LogOut, Home, Map, Users } from "lucide-react";

const Navbar = () => {
  const { profile, signOut } = useUser();
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold text-primary">EduConnect</span>
        </Link>
        
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 hidden md:block">
          <Link
            to="/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            <span className="flex items-center gap-2">
              <Home size={18} />
              Início
            </span>
          </Link>
          
          {profile?.role === 'student' ? (
            <Link
              to="/student-map"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              <span className="flex items-center gap-2">
                <Map size={18} />
                Mapa
              </span>
            </Link>
          ) : (
            <Link
              to="/parent-children"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              <span className="flex items-center gap-2">
                <Users size={18} />
                Estudantes
              </span>
            </Link>
          )}
        </nav>
        
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {profile?.name || 'Minha Conta'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className="cursor-pointer"
              >
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={signOut}
                className="cursor-pointer text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
