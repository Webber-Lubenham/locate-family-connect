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
          {/* Fundo circular com gradiente suave */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill={`url(#grad-bg-${variant})`}
            filter="url(#shadow)"
          />

          {/* Corpo do estudante */}
          <path
            d="M50 65C60 65 68 57 68 47C68 37 60 30 50 30C40 30 32 37 32 47C32 57 40 65 50 65Z"
            fill={currentColors.accent}
            filter="url(#shadow-soft)"
          />

          {/* Chapéu de formatura moderno */}
          <path
            d="M30 40L50 32L70 40L50 48L30 40Z"
            fill={`url(#grad-hat-${variant})`}
            filter="url(#shadow-soft)"
          />
          <path
            d="M45 45V52L50 54L55 52V45L50 47L45 45Z"
            fill={currentColors.secondary}
          />
          <rect
            x="48"
            y="25"
            width="4"
            height="8"
            fill={currentColors.primary}
            rx="2"
          />
          <path
            d="M46 25H54C54 22 52 20 50 20C48 20 46 22 46 25Z"
            fill={currentColors.primary}
          />

          {/* Rosto mais amigável */}
          <circle cx="44" cy="45" r="2" fill={currentColors.primary}>
            <animate
              attributeName="r"
              values="2;2.5;2"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="56" cy="45" r="2" fill={currentColors.primary}>
            <animate
              attributeName="r"
              values="2;2.5;2"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <path
            d="M46 51C46 51 48 53 50 53C52 53 54 51 54 51"
            stroke={currentColors.primary}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Definições de gradientes e filtros */}
          <defs>
            <linearGradient id={`grad-bg-${variant}`} x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor={currentColors.accent} />
              <stop offset="100%" stopColor={currentColors.secondary} stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id={`grad-hat-${variant}`} x1="30" y1="36" x2="70" y2="44">
              <stop offset="0%" stopColor={currentColors.primary} />
              <stop offset="100%" stopColor={currentColors.highlight} />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
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
        {/* Fundo circular com gradiente suave */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={`url(#grad-bg-parent-${variant})`}
          filter="url(#shadow)"
        />

        {/* Corpo do responsável */}
        <path
          d="M50 70C62 70 72 60 72 48C72 36 62 28 50 28C38 28 28 36 28 48C28 60 38 70 50 70Z"
          fill={currentColors.accent}
          filter="url(#shadow-soft)"
        />

        {/* Cabelo moderno */}
        <path
          d="M28 45C28 35 38 25 50 25C62 25 72 35 72 45C72 48 71 50 70 52C68 45 60 40 50 40C40 40 32 45 30 52C29 50 28 48 28 45Z"
          fill={`url(#grad-hair-${variant})`}
          filter="url(#shadow-soft)"
        />

        {/* Rosto mais amigável */}
        <circle cx="42" cy="45" r="2" fill={currentColors.primary}>
          <animate
            attributeName="r"
            values="2;2.5;2"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="58" cy="45" r="2" fill={currentColors.primary}>
          <animate
            attributeName="r"
            values="2;2.5;2"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <path
          d="M44 52C44 52 47 55 50 55C53 55 56 52 56 52"
          stroke={currentColors.primary}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Definições de gradientes e filtros */}
        <defs>
          <linearGradient id={`grad-bg-parent-${variant}`} x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor={currentColors.accent} />
            <stop offset="100%" stopColor={currentColors.secondary} stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id={`grad-hair-${variant}`} x1="28" y1="25" x2="72" y2="52">
            <stop offset="0%" stopColor={currentColors.primary} />
            <stop offset="100%" stopColor={currentColors.highlight} />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
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