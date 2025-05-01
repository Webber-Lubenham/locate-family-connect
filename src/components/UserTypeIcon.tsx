import React from 'react';
import { cn } from '@/lib/utils';
import { UserType } from '@/lib/auth-redirects';

interface UserTypeIconProps {
  type: UserType;
  className?: string;
  variant?: 'login' | 'register';
}

const UserTypeIcon: React.FC<UserTypeIconProps> = ({ type, className, variant = 'login' }) => {
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
          {/* Círculo de fundo com gradiente sutil */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill={`url(#grad-bg-${variant})`}
            filter="url(#shadow)"
          />

          {/* Ícone de estudante moderno */}
          <g filter="url(#shadow-soft)">
            {/* Diploma estilizado */}
            <rect
              x="35"
              y="40"
              width="30"
              height="40"
              rx="2"
              fill={currentColors.accent}
            />
            <path
              d="M35 42C35 40.8954 35.8954 40 37 40H63C64.1046 40 65 40.8954 65 42V48H35V42Z"
              fill={currentColors.primary}
            />
            
            {/* Símbolo acadêmico minimalista */}
            <path
              d="M42 55H58M42 62H58"
              stroke={currentColors.primary}
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Chapéu minimalista */}
            <path
              d="M35 30L50 25L65 30L50 35L35 30Z"
              fill={currentColors.primary}
              filter="url(#shadow-soft)"
            />
            <rect
              x="48"
              y="28"
              width="4"
              height="12"
              fill={currentColors.secondary}
              rx="1"
            />
          </g>

          <defs>
            <linearGradient id={`grad-bg-${variant}`} x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor={currentColors.accent} />
              <stop offset="100%" stopColor={currentColors.accent} stopOpacity="0.8" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
            </filter>
            <filter id="shadow-soft" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" />
            </filter>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative w-16 h-16 md:w-20 md:h-20", className)}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Círculo de fundo com gradiente sutil */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={`url(#grad-bg-parent-${variant})`}
          filter="url(#shadow)"
        />

        {/* Ícone de responsável moderno */}
        <g filter="url(#shadow-soft)">
          {/* Símbolo de pessoa minimalista */}
          <circle
            cx="50"
            cy="40"
            r="12"
            fill={currentColors.primary}
          />
          <path
            d="M30 75C30 62 38.954 55 50 55C61.046 55 70 62 70 75"
            fill={currentColors.primary}
          />
          
          {/* Elementos de proteção/responsabilidade */}
          <path
            d="M50 25L65 32V45C65 52 58 62 50 65C42 62 35 52 35 45V32L50 25Z"
            fill={currentColors.accent}
            stroke={currentColors.secondary}
            strokeWidth="2"
          />
        </g>

        <defs>
          <linearGradient id={`grad-bg-parent-${variant}`} x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor={currentColors.accent} />
            <stop offset="100%" stopColor={currentColors.accent} stopOpacity="0.8" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
          <filter id="shadow-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default UserTypeIcon; 