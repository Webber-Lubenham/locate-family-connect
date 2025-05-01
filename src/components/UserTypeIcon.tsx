import React from 'react';
import { cn } from '@/lib/utils';
import { UserType } from '@/lib/auth-redirects';

interface UserTypeIconProps {
  type: UserType;
  className?: string;
  variant?: 'login' | 'register';
}

const UserTypeIcon: React.FC<UserTypeIconProps> = ({ type, className, variant = 'login' }) => {
  // Cores baseadas na variante
  const colors = {
    login: {
      primary: '#3B82F6', // blue-500
      secondary: '#93C5FD', // blue-300
      accent: '#DBEAFE', // blue-100
    },
    register: {
      primary: '#059669', // emerald-600
      secondary: '#6EE7B7', // emerald-300
      accent: '#D1FAE5', // emerald-100
    }
  };

  const currentColors = colors[variant];

  if (type === 'student') {
    return (
      <div className={cn("relative w-16 h-16 md:w-20 md:h-20", className)}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Chapéu de formatura */}
          <path 
            d="M15 45L50 30L85 45L50 60L15 45Z" 
            fill={currentColors.primary}
          />
          <path 
            d="M40 55V75L50 80L60 75V55L50 60L40 55Z" 
            fill={currentColors.secondary}
          />
          <path 
            d="M85 45V65M85 65L80 63M85 65L90 63" 
            stroke={currentColors.primary} 
            strokeWidth="4"
          />
          
          {/* Rosto do estudante */}
          <circle 
            cx="50" 
            cy="50" 
            r="20" 
            fill={currentColors.accent}
          />
          {/* Olhos */}
          <circle cx="43" cy="48" r="2" fill={currentColors.primary} />
          <circle cx="57" cy="48" r="2" fill={currentColors.primary} />
          {/* Sorriso */}
          <path 
            d="M45 55C45 55 47 58 50 58C53 58 55 55 55 55" 
            stroke={currentColors.primary} 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative w-16 h-16 md:w-20 md:h-20", className)}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ícone de responsável */}
        <circle 
          cx="50" 
          cy="35" 
          r="20" 
          fill={currentColors.accent}
        />
        {/* Cabelo */}
        <path 
          d="M30 35C30 35 35 15 50 15C65 15 70 35 70 35" 
          fill={currentColors.primary}
        />
        {/* Olhos */}
        <circle cx="43" cy="33" r="2" fill={currentColors.primary} />
        <circle cx="57" cy="33" r="2" fill={currentColors.primary} />
        {/* Sorriso */}
        <path 
          d="M45 40C45 40 47 43 50 43C53 43 55 40 55 40" 
          stroke={currentColors.primary} 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        {/* Corpo */}
        <path 
          d="M35 55L50 85L65 55" 
          fill={currentColors.secondary}
        />
        <path 
          d="M35 55H65" 
          stroke={currentColors.primary} 
          strokeWidth="4"
        />
        {/* Braços */}
        <path 
          d="M25 65L35 55M65 55L75 65" 
          stroke={currentColors.primary} 
          strokeWidth="4" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default UserTypeIcon; 