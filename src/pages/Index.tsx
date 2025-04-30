
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
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

  // Redirecionar para a página de login
  return <Navigate to="/login" replace />;
};

export default Index;
