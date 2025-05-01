import React from 'react';
import { UserType } from '@/lib/auth-redirects';
import { cn } from '@/lib/utils';
import UserTypeIcon from './UserTypeIcon';

export interface AuthTabsProps {
  activeTab: UserType;
  onTabChange: (tab: UserType) => void;
  variant?: 'login' | 'register';
}

const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange, variant = 'login' }) => {
  const baseTabStyles = "flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-300 cursor-pointer relative overflow-hidden";
  
  const activeTabStyles = variant === 'login' 
    ? "bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 shadow-md ring-2 ring-blue-200" 
    : "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 shadow-md ring-2 ring-emerald-200";
  
  const inactiveTabStyles = "hover:bg-gray-50 text-gray-500 hover:text-gray-700";

  const getActiveIconClass = (isActive: boolean) => {
    if (!isActive) return "opacity-75 grayscale-[30%]";
    return variant === 'login' 
      ? "scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
      : "scale-110 drop-shadow-[0_0_8px_rgba(5,150,105,0.5)]";
  };

  return (
    <div className="flex gap-4 w-full max-w-sm mx-auto mb-6">
      <div
        className={cn(
          baseTabStyles,
          activeTab === 'student' ? activeTabStyles : inactiveTabStyles,
          "flex-1 group"
        )}
        onClick={() => onTabChange('student')}
      >
        <div className={cn(
          "transition-all duration-300",
          getActiveIconClass(activeTab === 'student')
        )}>
          <UserTypeIcon 
            type="student" 
            variant={variant}
            className="mb-2"
          />
        </div>
        <span className={cn(
          "font-medium text-sm transition-all duration-300",
          activeTab === 'student' && "scale-105"
        )}>
          Estudante
        </span>
        {/* Indicador de ativo */}
        {activeTab === 'student' && (
          <div className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-t-full",
            variant === 'login' ? "bg-blue-500" : "bg-emerald-500"
          )} />
        )}
      </div>
      
      <div
        className={cn(
          baseTabStyles,
          activeTab === 'parent' ? activeTabStyles : inactiveTabStyles,
          "flex-1 group"
        )}
        onClick={() => onTabChange('parent')}
      >
        <div className={cn(
          "transition-all duration-300",
          getActiveIconClass(activeTab === 'parent')
        )}>
          <UserTypeIcon 
            type="parent" 
            variant={variant}
            className="mb-2"
          />
        </div>
        <span className={cn(
          "font-medium text-sm transition-all duration-300",
          activeTab === 'parent' && "scale-105"
        )}>
          Responsável
        </span>
        {/* Indicador de ativo */}
        {activeTab === 'parent' && (
          <div className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-t-full",
            variant === 'login' ? "bg-blue-500" : "bg-emerald-500"
          )} />
        )}
      </div>
    </div>
  );
};

export default AuthTabs;
