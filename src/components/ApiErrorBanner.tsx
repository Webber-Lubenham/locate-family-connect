
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

  return null;
};

export default ApiErrorBanner;
