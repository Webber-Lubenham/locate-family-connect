
import React from "react";
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
  
  // Ajusta o padding com base no tipo de dispositivo
  const getPadding = () => {
    switch(deviceType) {
      case 'mobile':
        return 'px-2 py-3';
      case 'tablet':
        return 'px-4 py-4';
      default:
        return 'px-6 py-6 md:px-8 md:py-8';
    }
  };
  
  // Ajusta a margem do título com base no tipo de dispositivo
  const getTitleMargin = () => {
    switch(deviceType) {
      case 'mobile':
        return 'mb-3';
      case 'tablet':
        return 'mb-4';
      default:
        return 'mb-6 md:mb-8';
    }
  };
  
  // Ajusta o tamanho do título com base no tipo de dispositivo
  const getTitleSize = () => {
    switch(deviceType) {
      case 'mobile':
        return 'text-lg';
      case 'tablet':
        return 'text-xl';
      default:
        return 'text-2xl md:text-3xl';
    }
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] w-full ${!fullWidth && 'max-w-7xl mx-auto'} ${getPadding()} ${className}`}>
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
