
import React, { useState, useEffect } from 'react';
import AuthContainer from '@/components/AuthContainer';
import { Button } from '@/components/ui/button';
import { clearAppCache, checkCacheClearRequest } from '@/lib/utils/cache-manager';
import { RefreshCw } from 'lucide-react';
import ApiErrorBanner from '@/components/ApiErrorBanner';

const Index = () => {
  const [renderError, setRenderError] = useState(false);

  // Check if there were previous errors and if there's a cache clear request
  useEffect(() => {
    // Check for cache clear request in URL
    checkCacheClearRequest();
    
    // Check for previous render errors
    const hasError = localStorage.getItem('app_render_error');
    if (hasError === 'true') {
      setRenderError(true);
      // Clear the error flag
      localStorage.removeItem('app_render_error');
    }
  }, []);

  // Handle errors during render
  useEffect(() => {
    const handleError = () => {
      localStorage.setItem('app_render_error', 'true');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {renderError && (
        <div className="fixed top-4 right-4 z-50 bg-amber-50 p-4 rounded-md shadow-md border border-amber-200">
          <p className="text-amber-800 font-medium mb-2">
            Detectamos um problema anterior
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 w-full"
            onClick={() => clearAppCache(true)}
          >
            <RefreshCw size={16} />
            Limpar cache e recarregar
          </Button>
        </div>
      )}
      
      {/* API Error Banner will show when API errors are detected */}
      <div className="container mx-auto p-4">
        <ApiErrorBanner />
      </div>
      
      <AuthContainer />
    </div>
  );
};

export default Index;
