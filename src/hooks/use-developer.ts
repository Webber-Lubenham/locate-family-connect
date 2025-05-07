import { useCallback, useMemo } from 'react';
import { useUser } from '@/contexts/UnifiedAuthContext';
import { UserType, isValidUserType } from '@/lib/types/user-types';

/**
 * Hook para verificar se o usuário atual tem um determinado tipo
 * @param requiredType Tipo ou tipos de usuário requeridos
 * @returns True se o usuário tiver o tipo requerido
 */
export function useIsUserType(requiredType: UserType | UserType[]) {
  const { user } = useUser();
  
  return useMemo(() => {
    if (!user) return false;
    
    // Check both possible locations for user_type
    // 1. From user_metadata (set during signup/auth)
    // 2. From the user object directly (set after profile fetch)
    const userTypeFromMetadata = user.user_metadata?.user_type;
    const userTypeFromProfile = user.user_type;
    
    // Use whichever one is available, prioritizing user_type from profile
    const userType = userTypeFromProfile || userTypeFromMetadata;
    
    // Log for debugging purposes
    if (process.env.NODE_ENV === 'development') {
      console.log('[useIsUserType] User type check:', { 
        userTypeFromProfile,
        userTypeFromMetadata, 
        finalUserType: userType 
      });
    }
    
    // Se o tipo não for válido, não concedemos permissão
    if (!isValidUserType(userType)) return false;
    
    // Verificar contra uma lista de tipos permitidos
    if (Array.isArray(requiredType)) {
      return requiredType.includes(userType);
    }
    
    // Verificar contra um único tipo
    return userType === requiredType;
  }, [user, requiredType]);
}

/**
 * Hook para verificar se o usuário atual é um desenvolvedor
 * @returns True se o usuário for um desenvolvedor
 */
export function useIsDeveloper() {
  return useIsUserType('developer');
}

/**
 * Hook para verificar se o usuário atual é um estudante
 * @returns True se o usuário for um estudante
 */
export function useIsStudent() {
  return useIsUserType('student');
}

/**
 * Hook para verificar se o usuário atual é um responsável
 * @returns True se o usuário for um responsável
 */
export function useIsParent() {
  return useIsUserType('parent');
}

/**
 * Hook para obter uma lista de rotas disponíveis com base no tipo de usuário
 * @returns Array de rotas disponíveis
 */
export function useAvailableRoutes() {
  const isDeveloper = useIsDeveloper();
  const isStudent = useIsStudent();
  const isParent = useIsParent();
  
  return useMemo(() => {
    const routes = [
      { path: '/dashboard', label: 'Dashboard', icon: 'home' }
    ];
    
    if (isStudent) {
      routes.push({ path: '/student-dashboard', label: 'Área do Estudante', icon: 'book' });
      routes.push({ path: '/guardians', label: 'Responsáveis', icon: 'users' });
    }
    
    if (isParent) {
      routes.push({ path: '/parent-dashboard', label: 'Área do Responsável', icon: 'shield' });
      routes.push({ path: '/student-map', label: 'Localização', icon: 'map-pin' });
    }
    
    // Adiciona rotas para desenvolvedores
    if (isDeveloper) {
      routes.push({ path: '/dev-dashboard', label: 'Dev Dashboard', icon: 'code' });
      routes.push({ path: '/dev/cypress', label: 'Cypress Tests', icon: 'bug' });
      routes.push({ path: '/dev/api-docs', label: 'API Docs', icon: 'file-text' });
      routes.push({ path: '/diagnostic', label: 'Diagnóstico', icon: 'activity' });
    }
    
    return routes;
  }, [isDeveloper, isStudent, isParent]);
}
