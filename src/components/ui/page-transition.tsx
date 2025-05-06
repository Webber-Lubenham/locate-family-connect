
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey?: string | number;  // Key that changes when page content changes
  timeout?: number;                  // Timeout in ms before showing content
}

/**
 * PageTransition component provides smooth transitions between page content
 * to prevent flickering and jarring UI changes
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  transitionKey,
  timeout = 300 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    // When transitionKey changes (page content changes)
    setIsLoading(true);
    
    // Store current children
    const currentContent = children;
    
    // Set timeout to show new content
    const timer = setTimeout(() => {
      setContent(currentContent);
      setIsLoading(false);
    }, timeout);

    return () => {
      clearTimeout(timer);
    };
  }, [children, timeout, transitionKey]);

  return (
    <div className="relative min-h-[200px]">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground text-sm">Carregando...</p>
          </div>
        </div>
      ) : (
        <div
          className="animate-fadeIn"
          style={{
            animation: `fadeIn 300ms ease-out`
          }}
        >
          {content}
        </div>
      )}
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
};

export default PageTransition;
