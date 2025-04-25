
import React, { Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import { Loader2, RefreshCw } from 'lucide-react';
import { clearAppCache } from '@/lib/utils/cache-manager';
import { Button } from '@/components/ui/button';
import ApiErrorBanner from '@/components/ApiErrorBanner';

const AuthLayout = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // If user is already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (user && !loading && location.pathname.includes('login')) {
      console.log('[AUTHLAYOUT] User already authenticated, redirecting to dashboard');
      const userType = user.user_type || 'student';
      
      // Determine where to redirect based on user type
      let redirectPath = '/dashboard';
      switch (userType) {
        case 'student':
          redirectPath = '/student-dashboard';
          break;
        case 'parent':
          redirectPath = '/parent-dashboard';
          break;
      }
      
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ApiErrorBanner className="mb-6" />
          
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h2 className="mt-4 text-lg font-medium">Carregando...</h2>
            
            {loadingTooLong && (
              <div className="mt-6 bg-amber-50 p-4 rounded-md border border-amber-200">
                <p className="mb-2 text-sm text-amber-800">
                  Está demorando mais do que o esperado?
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => clearAppCache(true)}
                  className="mt-2 flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={16} />
                  Limpar Cache e Tentar Novamente
                </Button>
              </div>
            )}
          </div>
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
      <div className="container mx-auto p-4">
        <ApiErrorBanner />
      </div>
      <Outlet />
    </Suspense>
  );
};

export default AuthLayout;
