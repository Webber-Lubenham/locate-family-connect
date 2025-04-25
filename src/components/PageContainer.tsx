
import React from "react";

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
  return (
    <div className={`min-h-[calc(100vh-4rem)] w-full ${!fullWidth && 'max-w-7xl mx-auto'} px-4 py-6 md:px-6 md:py-8 lg:px-8 ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-6 md:mb-8 flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-auto">
            {title && <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>}
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 mt-2 md:mt-0">{action}</div>}
        </div>
      )}
      <div className={`space-y-6 ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
