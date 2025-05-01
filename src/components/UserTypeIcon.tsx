import React from 'react';
import { cn } from '@/lib/utils';
import { UserType } from '@/lib/auth-redirects';

interface UserTypeIconProps {
  type: UserType;
  className?: string;
  variant?: 'login' | 'register';
}

const UserTypeIcon: React.FC<UserTypeIconProps> = ({ type, className, variant = 'login' }) => {
  // Cores baseadas na variante com tons mais vibrantes
  const colors = {
    login: {
      primary: '#2563EB', // blue-600
      secondary: '#60A5FA', // blue-400
      accent: '#EFF6FF', // blue-50
      highlight: '#3B82F6', // blue-500
    },
    register: {
      primary: '#059669', // emerald-600
      secondary: '#34D399', // emerald-400
      accent: '#ECFDF5', // emerald-50
      highlight: '#10B981', // emerald-500
    }
  };

  const currentColors = colors[variant];

  if (type === 'student') {
    return (
      <div className={cn("relative w-16 h-16 md:w-20 md:h-20", className)}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Chapéu de formatura com gradiente */}
          <path 
            d="M15 45L50 30L85 45L50 60L15 45Z" 
            fill={`url(#grad-hat-${variant})`}
          />
          <path 
            d="M40 55V75L50 80L60 75V55L50 60L40 55Z" 
            fill={currentColors.secondary}
            filter="url(#shadow)"
          />
          <path 
            d="M85 45V65M85 65L80 63M85 65L90 63" 
            stroke={currentColors.highlight} 
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {/* Rosto do estudante */}
          <circle 
            cx="50" 
            cy="50" 
            r="20" 
            fill={currentColors.accent}
            filter="url(#shadow)"
          />
          {/* Olhos com brilho */}
          <circle cx="43" cy="48" r="2.5" fill={currentColors.primary}>
            <animate attributeName="r" values="2;2.5;2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="57" cy="48" r="2.5" fill={currentColors.primary}>
            <animate attributeName="r" values="2;2.5;2" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Sorriso mais expressivo */}
          <path 
            d="M45 55C45 55 47 58 50 58C53 58 55 55 55 55" 
            stroke={currentColors.primary} 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />

          {/* Definições de gradientes e filtros */}
          <defs>
            <linearGradient id={`grad-hat-${variant}`} x1="15" y1="45" x2="85" y2="45">
              <stop offset="0%" stopColor={currentColors.primary} />
              <stop offset="100%" stopColor={currentColors.highlight} />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
            </filter>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative w-16 h-16 md:w-20 md:h-20", className)}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ícone de responsável com gradientes */}
        <circle 
          cx="50" 
          cy="35" 
          r="20" 
          fill={currentColors.accent}
          filter="url(#shadow)"
        />
        {/* Cabelo com gradiente */}
        <path 
          d="M30 35C30 35 35 15 50 15C65 15 70 35 70 35" 
          fill={`url(#grad-hair-${variant})`}
        />
        {/* Olhos com brilho */}
        <circle cx="43" cy="33" r="2.5" fill={currentColors.primary}>
          <animate attributeName="r" values="2;2.5;2" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="57" cy="33" r="2.5" fill={currentColors.primary}>
          <animate attributeName="r" values="2;2.5;2" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Sorriso mais expressivo */}
        <path 
          d="M45 40C45 40 47 43 50 43C53 43 55 40 55 40" 
          stroke={currentColors.primary} 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />
        {/* Corpo com gradiente */}
        <path 
          d="M35 55L50 85L65 55" 
          fill={`url(#grad-body-${variant})`}
          filter="url(#shadow)"
        />
        <path 
          d="M35 55H65" 
          stroke={currentColors.highlight} 
          strokeWidth="4"
        />
        {/* Braços mais expressivos */}
        <path 
          d="M25 65L35 55M65 55L75 65" 
          stroke={currentColors.highlight} 
          strokeWidth="4" 
          strokeLinecap="round"
          filter="url(#shadow)"
        />

        {/* Definições de gradientes e filtros */}
        <defs>
          <linearGradient id={`grad-hair-${variant}`} x1="30" y1="15" x2="70" y2="35">
            <stop offset="0%" stopColor={currentColors.primary} />
            <stop offset="100%" stopColor={currentColors.highlight} />
          </linearGradient>
          <linearGradient id={`grad-body-${variant}`} x1="35" y1="55" x2="65" y2="85">
            <stop offset="0%" stopColor={currentColors.secondary} />
            <stop offset="100%" stopColor={currentColors.highlight} />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default UserTypeIcon; 