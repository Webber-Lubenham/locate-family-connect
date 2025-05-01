
import React from "react";
import { useDevice } from "@/hooks/use-mobile";

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
  const { type: deviceType, orientation, isXs } = useDevice();
  
  // Ajusta o padding com base no tipo de dispositivo e orientação
  const getPadding = () => {
    switch(deviceType) {
      case 'mobile':
        return orientation === 'portrait' ? 'px-2 py-3' : 'px-2.5 py-2';
      case 'tablet':
        return orientation === 'portrait' ? 'px-3 py-4' : 'px-4 py-3';
      default:
        return 'px-5 py-6 md:px-8 md:py-8';
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
    if (isXs) {
      return 'text-sm';
    }
    
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
      // Subtrair a altura da barra de navegação móvel e do cabeçalho
      return deviceType === 'mobile' 
        ? orientation === 'portrait' ? 'min-h-[calc(100vh-5rem)]' : 'min-h-[calc(100vh-4.5rem)]'
        : 'min-h-[calc(100vh-5rem)]';
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
