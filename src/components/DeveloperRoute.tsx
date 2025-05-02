import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UnifiedAuthContext';
import { useIsDeveloper } from '@/hooks/use-developer';

interface DeveloperRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

/**
 * Componente que protege rotas, permitindo acesso apenas para desenvolvedores
 */
const DeveloperRoute: React.FC<DeveloperRouteProps> = ({ 
  children, 
  fallbackPath = '/dashboard' 
}) => {
  const { user, loading } = useUser();
  const isDeveloper = useIsDeveloper();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Se o usuário estiver carregando, aguardar
    if (loading) return;
    
    // Se não estiver autenticado, redirecionar para login
    if (!user) {
      navigate('/login', { 
        replace: true,
        state: { 
          message: 'Faça login para acessar esta página',
          returnUrl: window.location.pathname 
        }
      });
      return;
    }
    
        // Se não for desenvolvedor, redirecionar para fallback
    if (!isDeveloper) {
      navigate(fallbackPath, { 
        replace: true,
        state: { 
          message: 'Você não tem permissão para acessar esta página'
        }
      });
    }
  }, [user, loading, isDeveloper, navigate, fallbackPath]);
  
  // Enquanto carrega, mostrar indicador de carregamento
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  // Se o usuário não estiver autenticado ou não for desenvolvedor, não renderizar nada
  // (o redirecionamento será feito pelo useEffect)
  if (!user || !isDeveloper) {
    return null;
  }
  
  // Se passar por todas as verificações, renderizar o conteúdo
  return <>{children}</>;
};

export default DeveloperRoute;
