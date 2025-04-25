
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { clearAppCache, hasApiErrors, getApiErrors, clearApiErrors } from '@/lib/utils/cache-manager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ApiErrorBannerProps {
  className?: string;
}

const ApiErrorBanner: React.FC<ApiErrorBannerProps> = ({ className = '' }) => {
  const [hasErrors, setHasErrors] = useState(false);
  const [errors, setErrors] = useState<Array<{status: number, endpoint: string, timestamp: string}>>([]);

  useEffect(() => {
    // Check for API errors on component mount
    const errors = getApiErrors();
    setHasErrors(errors.length > 0);
    setErrors(errors);
  }, []);

  const handleDismiss = () => {
    clearApiErrors();
    setHasErrors(false);
  };

  const handleRefresh = () => {
    clearAppCache(true);
  };

  if (!hasErrors) {
    return null;
  }

  return (
    <Alert variant="destructive" className={`mb-4 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Problemas de conectividade detectados</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          Detectamos problemas ao se comunicar com o servidor. Isso pode causar
          comportamento inadequado na aplicação.
        </p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={handleDismiss}>
            Ignorar
          </Button>
          <Button size="sm" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw size={14} />
            Limpar cache e recarregar
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ApiErrorBanner;
