/**
 * Tipos de usuário suportados pela aplicação
 */
export type UserType = 'student' | 'parent' | 'developer';

/**
 * Verifica se um tipo de usuário é válido
 * @param type Tipo a ser verificado
 * @returns True se for um tipo válido
 */
export function isValidUserType(type: string): type is UserType {
  return ['student', 'parent', 'developer'].includes(type);
}

/**
 * Obtém o tipo de usuário a partir dos metadados
 * @param userMetadata Metadados do usuário
 * @returns Tipo do usuário ou 'student' como padrão
 */
export function getUserTypeFromMetadata(userMetadata?: Record<string, any>): UserType {
  const userType = userMetadata?.user_type;
  return isValidUserType(userType) ? userType : 'student';
}

/**
 * Mapeamento de rotas padrão por tipo de usuário
 */
export const DEFAULT_ROUTES: Record<UserType, string> = {
  'student': '/student-dashboard',
  'parent': '/parent-dashboard',
  'developer': '/dev-dashboard'
};

/**
 * Obtém a rota padrão para um tipo de usuário
 * @param userType Tipo do usuário
 * @returns Rota padrão
 */
export function getDefaultRouteForUserType(userType: UserType): string {
  return DEFAULT_ROUTES[userType] || '/dashboard';
}
