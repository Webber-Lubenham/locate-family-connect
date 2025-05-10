
import React, { Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2, RefreshCw } from 'lucide-react';
import { clearAppCache } from '@/lib/utils/cache-manager';
import { Button } from '@/components/ui/button';
import ApiErrorBanner from '@/components/ApiErrorBanner';

const AuthLayout = () => {
  const { user, loading, error } = useUnifiedAuth();
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
      
      // Get user type from metadata or user object with fallback
      const userType = user.user_metadata?.user_type || user.user_type || 'student';
      
      // Determine where to redirect based on user type with standardized paths
      const dashboardRoutes = {
        'student': '/student/dashboard',
        'parent': '/guardian/dashboard',
        'guardian': '/guardian/dashboard',
        'admin': '/admin/dashboard'
      };
      
      const redirectPath = dashboardRoutes[userType] || '/dashboard';
      console.log('[AUTHLAYOUT] Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#f5f5f5]">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erro na autenticação</h2>
          <p className="text-gray-600 mb-4">{error.message || 'Ocorreu um erro inesperado.'}</p>
          <ApiErrorBanner className="mb-4" />
          <Button 
            variant="outline" 
            className="flex items-center gap-2 w-full justify-center"
            onClick={() => clearAppCache(true)}
          >
            <RefreshCw size={16} />
            Recarregar aplicação
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#f5f5f5]">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <ApiErrorBanner className="mb-6" />
          
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h2 className="mt-4 text-lg font-medium">Carregando...</h2>
            
            {loadingTooLong && (
              <div className="mt-6 bg-amber-50 p-4 rounded-md border border-amber-200">
                <p className="mb-2 text-sm text-amber-800">
                  Está demorando mais do que o esperado?
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  Pode haver um problema com a conexão ou com o cache do navegador.
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
