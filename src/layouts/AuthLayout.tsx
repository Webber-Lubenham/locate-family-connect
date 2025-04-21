
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { clearAppCache } from '@/lib/utils/cache-manager';
import { Button } from '@/components/ui/button';

const AuthLayout = () => {
  const { user, loading } = useUser();
  
  // If we encounter a blank screen or loading takes too long
  const [loadingTooLong, setLoadingTooLong] = React.useState(false);
  
  React.useEffect(() => {
    // If loading takes more than 5 seconds, show the reset option
    const timer = setTimeout(() => {
      if (loading) {
        setLoadingTooLong(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // If user is already logged in, redirect to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <h2 className="mt-4 text-lg font-medium">Carregando...</h2>
          
          {loadingTooLong && (
            <div className="mt-6">
              <p className="mb-2 text-sm text-muted-foreground">
                Está demorando mais do que o esperado?
              </p>
              <Button 
                variant="outline" 
                onClick={() => clearAppCache(true)}
                className="mt-2"
              >
                Limpar Cache e Tentar Novamente
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render outlet with suspense fallback
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
};

export default AuthLayout;
