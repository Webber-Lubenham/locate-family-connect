
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
  const { 
    type: deviceType, 
    orientation, 
    isXs, 
    isXxs,
    aspectRatio
  } = useDevice();
  
  // Enhanced padding adjustment with more granular device detection
  const getPadding = () => {
    if (isXxs) {
      return orientation === 'portrait' ? 'px-1.5 py-2' : 'px-1 py-1.5';
    }
    
    if (isXs) {
      return orientation === 'portrait' ? 'px-2 py-2.5' : 'px-1.5 py-2';
    }
    
    switch(deviceType) {
      case 'mobile':
        return orientation === 'portrait' ? 'px-2 py-3' : 'px-2.5 py-2';
      case 'tablet':
        return orientation === 'portrait' ? 'px-3 py-4' : 'px-4 py-3';
      default:
        return 'px-5 py-6 md:px-8 md:py-8';
    }
  };
  
  // Enhanced title margin adjustment
  const getTitleMargin = () => {
    if (isXxs) {
      return orientation === 'portrait' ? 'mb-2' : 'mb-1.5';
    }
    
    if (isXs) {
      return orientation === 'portrait' ? 'mb-2.5' : 'mb-2';
    }
    
    switch(deviceType) {
      case 'mobile':
        return orientation === 'portrait' ? 'mb-3' : 'mb-2';
      case 'tablet':
        return orientation === 'portrait' ? 'mb-4' : 'mb-3';
      default:
        return 'mb-6 md:mb-8';
    }
  };
  
  // Enhanced title size adjustment with more granular breakpoints
  const getTitleSize = () => {
    if (isXxs) {
      return 'text-xs';
    }
    
    if (isXs) {
      return orientation === 'portrait' ? 'text-sm' : 'text-xs';
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

  // Enhanced max height calculation based on device and mobile navigation
  const getMaxHeight = () => {
    if (isXxs) {
      return orientation === 'portrait' 
        ? 'min-h-[calc(100vh-4.5rem)]' 
        : 'min-h-[calc(100vh-4rem)]';
    }
    
    if (isXs) {
      return orientation === 'portrait' 
        ? 'min-h-[calc(100vh-4.8rem)]' 
        : 'min-h-[calc(100vh-4.2rem)]';
    }
    
    if (deviceType === 'mobile' || deviceType === 'tablet') {
      // Account for the mobile navigation bar height
      return deviceType === 'mobile' 
        ? orientation === 'portrait' ? 'min-h-[calc(100vh-5rem)]' : 'min-h-[calc(100vh-4.5rem)]'
        : 'min-h-[calc(100vh-5rem)]';
    }
    
    return 'min-h-[calc(100vh-4rem)]';
  };
  
  // Adjust subtitle text size based on device
  const getSubtitleSize = () => {
    if (isXxs) {
      return 'text-[0.65rem]';
    }
    
    if (isXs) {
      return 'text-xs';
    }
    
    return 'text-xs sm:text-sm md:text-base';
  };
  
  // Adjust spacing between content items based on device
  const getContentSpacing = () => {
    if (isXxs || (isXs && orientation === 'landscape')) {
      return 'space-y-2';
    }
    
    if (isXs || (deviceType === 'mobile' && orientation === 'landscape')) {
      return 'space-y-2.5';
    }
    
    return 'space-y-3 md:space-y-6';
  };
  
  // Adjust header layout for very compact screens
  const getHeaderLayout = () => {
    // For very compact screens, stack the header elements
    if ((isXxs || isXs) && orientation === 'landscape' && aspectRatio < 1.8) {
      return 'flex-col items-start gap-1';
    }
    
    return 'flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-2 md:gap-4';
  };

  return (
    <div className={`${getMaxHeight()} w-full ${!fullWidth && 'max-w-7xl mx-auto'} ${getPadding()} ${className}`}>
      {(title || subtitle || action) && (
        <div className={`${getTitleMargin()} flex ${getHeaderLayout()}`}>
          <div className="w-full md:w-auto">
            {title && <h1 className={`${getTitleSize()} font-bold`}>{title}</h1>}
            {subtitle && <p className={`text-muted-foreground mt-1 md:mt-2 ${getSubtitleSize()}`}>{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 mt-2 md:mt-0">{action}</div>}
        </div>
      )}
      <div className={`${getContentSpacing()} ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
