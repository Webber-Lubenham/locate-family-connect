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
  const baseTabStyles = "flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-300 cursor-pointer";
  const activeTabStyles = variant === 'login' 
    ? "bg-blue-50 text-blue-700 shadow-sm" 
    : "bg-emerald-50 text-emerald-700 shadow-sm";
  const inactiveTabStyles = "hover:bg-gray-50 text-gray-600";

  return (
    <div className="flex gap-4 w-full max-w-sm mx-auto mb-6">
      <div
        className={cn(
          baseTabStyles,
          activeTab === 'student' ? activeTabStyles : inactiveTabStyles,
          "flex-1"
        )}
        onClick={() => onTabChange('student')}
      >
        <UserTypeIcon 
          type="student" 
          variant={variant}
          className="mb-2"
        />
        <span className="font-medium text-sm">Estudante</span>
      </div>
      
      <div
        className={cn(
          baseTabStyles,
          activeTab === 'parent' ? activeTabStyles : inactiveTabStyles,
          "flex-1"
        )}
        onClick={() => onTabChange('parent')}
      >
        <UserTypeIcon 
          type="parent" 
          variant={variant}
          className="mb-2"
        />
        <span className="font-medium text-sm">Responsável</span>
      </div>
    </div>
  );
};

export default AuthTabs;
