import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { clearAppCache, checkCacheClearRequest } from '@/lib/utils/cache-manager';
import { RefreshCw } from 'lucide-react';
import ApiErrorBanner from '@/components/ApiErrorBanner';

const Index = () => {
  const { user, loading, error } = useUnifiedAuth();
  const navigate = useNavigate();

  // Check if there were previous errors and if there's a cache clear request
  useEffect(() => {
    // Check for cache clear request in URL
    checkCacheClearRequest();
  }, []);

  // Redirect based on auth status with error handling
  useEffect(() => {
    if (loading) return; // Wait until auth check is complete
    
    console.log('[Index] Auth loaded, user:', user ? 'authenticated' : 'not authenticated');
    
    try {
      if (user) {
        // Determine where to redirect based on user type with fallback
        const userType = user.user_metadata?.user_type || user.user_type || 'student';
        console.log('[Index] User type detected:', userType);
        
        // Define dashboard routes with standardization
        const dashboardRoutes = {
          'student': '/student/dashboard',
          'parent': '/guardian/dashboard',
          'guardian': '/guardian/dashboard',
          'admin': '/dashboard' // fallback se não existir /admin/dashboard
        };
        
        const route = dashboardRoutes[userType] || '/dashboard';
        console.log('[Index] Redirecting to:', route);
        
        // Use setTimeout to ensure UI updates before navigation
        setTimeout(() => {
          navigate(route, { replace: true });
        }, 100);
      } else {
        // Not authenticated, go to login
        console.log('[Index] No authenticated user, redirecting to login');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('[Index] Error during navigation:', err);
    }
  }, [user, loading, navigate]);

  // Show more detailed loading while determining where to redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Error state with refresh option
  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erro ao verificar autenticação</h2>
          <p className="text-gray-600 mb-4">{error.message || 'Ocorreu um erro inesperado.'}</p>
          <ApiErrorBanner />
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => clearAppCache(true)}
            >
              <RefreshCw size={16} />
              Recarregar aplicação
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback visual para evitar tela branca
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground">Redirecionando...</div>
    </div>
  );
};

export default Index;
