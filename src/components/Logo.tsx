import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'login' | 'register';
}

const Logo: React.FC<LogoProps> = ({ className, variant = 'login' }) => {
  const getColors = () => {
    if (variant === 'register') {
      return {
        primary: 'text-emerald-600',
        secondary: 'text-emerald-700'
      };
    }
    return {
      primary: 'text-blue-500',
      secondary: 'text-blue-700'
    };
  };

  const colors = getColors();

  return (
    <div className={cn(
      "flex items-center justify-center transition-all duration-300 hover:scale-105",
      "relative after:absolute after:inset-0 after:bg-gradient-to-r",
      variant === 'register' 
        ? "after:from-emerald-500/10 after:to-transparent" 
        : "after:from-blue-500/10 after:to-transparent",
      "after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300",
      className
    )}>
      <svg
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto relative z-10"
      >
        {/* Ícone de localização */}
        <g transform="translate(10, 5) scale(0.8)">
          <path
            d="M25 0C11.2 0 0 11.2 0 25C0 43.8 25 70 25 70C25 70 50 43.8 50 25C50 11.2 38.8 0 25 0ZM25 34C20.1 34 16 29.9 16 25C16 20.1 20.1 16 25 16C29.9 16 34 20.1 34 25C34 29.9 29.9 34 25 34Z"
            className={colors.primary}
            fill="currentColor"
            filter="url(#glow)"
          >
            <animate
              attributeName="opacity"
              values="1;0.7;1"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="transform"
              type="scale"
              values="1;1.05;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        </g>
        
        {/* Texto "Monitore" */}
        <text
          x="70"
          y="35"
          className={cn("font-bold", colors.secondary)}
          fill="currentColor"
          filter="url(#glow)"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '24px',
            fontWeight: 'bold'
          }}
        >
          Monitore
        </text>
        
        {/* Texto "Localização Familiar" */}
        <text
          x="70"
          y="50"
          className={colors.primary}
          fill="currentColor"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '12px'
          }}
        >
          Localização Familiar
        </text>

        {/* Efeito de brilho */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feFlood 
              floodColor={variant === 'register' ? '#10B981' : '#3B82F6'} 
              floodOpacity="0.3" 
              result="coloredFlood"
            />
            <feComposite 
              in="coloredFlood" 
              in2="coloredBlur" 
              operator="in" 
              result="coloredGlow"
            />
            <feMerge>
              <feMergeNode in="coloredGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;
