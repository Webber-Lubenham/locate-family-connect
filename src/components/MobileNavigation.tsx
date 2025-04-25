
import React from "react";
import { Link } from "react-router-dom";
import { Home, Map, User, Book } from "lucide-react";

interface MobileNavigationProps {
  userType: string;
  dashboardLink: string;
}

export const MobileNavigation = ({ userType, dashboardLink }: MobileNavigationProps) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-10 flex justify-around items-center h-16">
      <Link
        to={dashboardLink}
        className="flex flex-col items-center justify-center px-4 py-1 text-gray-700"
      >
        <Home className="h-5 w-5" />
        <span className="text-xs">Home</span>
      </Link>
      <Link
        to="/student-map"
        className="flex flex-col items-center justify-center px-4 py-1 text-gray-700"
      >
        <Map className="h-5 w-5" />
        <span className="text-xs">Mapa</span>
      </Link>
      {userType === "student" && (
        <Link
          to="/guardians"
          className="flex flex-col items-center justify-center px-4 py-1 text-gray-700"
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Responsáveis</span>
        </Link>
      )}
      <Link
        to="/api-docs"
        className="flex flex-col items-center justify-center px-4 py-1 text-gray-700"
      >
        <Book className="h-5 w-5" />
        <span className="text-xs">API</span>
      </Link>
      <Link
        to="/profile"
        className="flex flex-col items-center justify-center px-4 py-1 text-gray-700"
      >
        <User className="h-5 w-5" />
        <span className="text-xs">Perfil</span>
      </Link>
    </nav>
  );
};
