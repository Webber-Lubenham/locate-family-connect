import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img 
        src="/logo.png" 
        alt="Monitore - Localização Familiar"
        className="h-full w-auto"
      />
    </div>
  );
};

export default Logo;
