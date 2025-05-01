
import React, { useEffect, useState } from "react";
import { useDeviceType } from "@/hooks/use-mobile";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  contentClassName?: string;
}

const PageContainer = ({ 
  children, 
  title, 
  subtitle, 
  action,
  className = "",
  fullWidth = false,
  contentClassName = ""
}: PageContainerProps) => {
  const deviceType = useDeviceType();
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );
  
  // Atualiza a orientação quando o usuário gira o dispositivo
  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Ajusta o padding com base no tipo de dispositivo e orientação
  const getPadding = () => {
    switch(deviceType) {
      case 'mobile':
        return orientation === 'portrait' ? 'px-2 py-3' : 'px-3 py-2';
      case 'tablet':
        return orientation === 'portrait' ? 'px-4 py-4' : 'px-5 py-3';
      default:
        return 'px-6 py-6 md:px-8 md:py-8';
    }
  };
  
  // Ajusta a margem do título com base no tipo de dispositivo e orientação
  const getTitleMargin = () => {
    switch(deviceType) {
      case 'mobile':
        return orientation === 'portrait' ? 'mb-3' : 'mb-2';
      case 'tablet':
        return orientation === 'portrait' ? 'mb-4' : 'mb-3';
      default:
        return 'mb-6 md:mb-8';
    }
  };
  
  // Ajusta o tamanho do título com base no tipo de dispositivo e orientação
  const getTitleSize = () => {
    switch(deviceType) {
      case 'mobile':
        return orientation === 'portrait' ? 'text-lg' : 'text-base';
      case 'tablet':
        return orientation === 'portrait' ? 'text-xl' : 'text-lg';
      default:
        return 'text-2xl md:text-3xl';
    }
  };

  // Calcula a altura máxima com base na barra de navegação móvel
  const getMaxHeight = () => {
    if (deviceType === 'mobile' || deviceType === 'tablet') {
      // Subtrair a altura da barra de navegação móvel (14px ou 16px) e do cabeçalho (12px ou 16px)
      return 'min-h-[calc(100vh-5rem)]';
    }
    return 'min-h-[calc(100vh-4rem)]';
  };

  return (
    <div className={`${getMaxHeight()} w-full ${!fullWidth && 'max-w-7xl mx-auto'} ${getPadding()} ${className}`}>
      {(title || subtitle || action) && (
        <div className={`${getTitleMargin()} flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-2 md:gap-4`}>
          <div className="w-full md:w-auto">
            {title && <h1 className={`${getTitleSize()} font-bold`}>{title}</h1>}
            {subtitle && <p className="text-muted-foreground mt-1 md:mt-2 text-xs sm:text-sm md:text-base">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 mt-2 md:mt-0">{action}</div>}
        </div>
      )}
      <div className={`space-y-3 md:space-y-6 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
