
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { DASHBOARD_ROUTES, UserType, isValidUserType } from '@/lib/auth-redirects';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearAppCache } from '@/lib/utils/cache-manager';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: UserType[];
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({ 
  children,
  allowedUserTypes
}) => {
  const { user, loading, error } = useUnifiedAuth();
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  
  // Display reset option if loading takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoadingTooLong(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [loading]);
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5] p-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <Loader2 className="animate-spin h-10 w-10 mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium mb-2">Verificando acesso...</p>
          <p className="text-sm text-gray-500 mb-6">Aguarde enquanto confirmamos sua autenticação.</p>
          
          {loadingTooLong && (
            <div className="mt-4 bg-amber-50 p-4 rounded-md border border-amber-200">
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
    );
  }
  
  // Handle authentication errors
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5] p-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erro de Autenticação</h2>
          <p className="text-gray-600 mb-6">{error.message || 'Ocorreu um erro ao verificar sua autenticação.'}</p>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 w-full justify-center"
              onClick={() => clearAppCache(true)}
            >
              <RefreshCw size={16} />
              Recarregar Aplicação
            </Button>
            
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => window.location.href = '/login'}
            >
              Voltar para o login
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Log for debugging
  console.log('[AUTH ROUTE] Checking access. User:', user?.id, 'Allowed types:', allowedUserTypes);
  
  // If not authenticated, redirect to login
  if (!user) {
    console.log('[AUTH ROUTE] No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Get user type from user object, ensuring it's a valid UserType
  const userTypeString = user.user_type || 
                         user.user_metadata?.user_type as string || 
                         user.app_metadata?.user_type as string;
  
  // Ensure userType is valid
  if (!userTypeString || !isValidUserType(userTypeString)) {
    console.log('[AUTH ROUTE] No valid user type found, redirecting to profile');
    return <Navigate to="/profile" replace />;
  }
  
  const userType = userTypeString as UserType;
  
  // If user types are specified and user doesn't have the right type, redirect
  if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
    console.log(`[AUTH ROUTE] User type ${userType} not allowed, redirecting to appropriate dashboard`);
    return <Navigate to={DASHBOARD_ROUTES[userType]} replace />;
  }

  // User is authenticated and has the right type
  console.log('[AUTH ROUTE] Access granted');
  return <>{children}</>;
};

export default AuthenticatedRoute;
