
import { User } from '@supabase/supabase-js';

export type UserType = 'student' | 'parent' | 'guardian' | 'developer' | 'admin';

export const DASHBOARD_ROUTES = {
  student: '/student/dashboard',
  parent: '/guardian/dashboard',
  guardian: '/guardian/dashboard',
  developer: '/developer/flow',
  admin: '/admin/webhook',
  default: '/login'
};

/**
 * Checks if a string is a valid UserType
 * @param type The string to check
 * @returns Whether the string is a valid UserType
 */
export function isValidUserType(type: string | undefined | null): type is UserType {
  if (!type) return false;
  return ['student', 'parent', 'guardian', 'developer', 'admin'].includes(type);
}

/**
 * Gets the appropriate redirect path based on user type
 * @param user The authenticated user object
 * @returns The path to redirect the user to
 */
export const getRedirectPath = (user: User | null): string => {
  if (!user) return DASHBOARD_ROUTES.default;
  
  // First try to get user_type from user_metadata
  let userType = user.user_metadata?.user_type as string;
  
  // If not found in user_metadata, try app_metadata
  if (!userType) {
    userType = user.app_metadata?.user_type as string;
  }
  
  console.log('[AUTH-REDIRECTS] Determining redirect path for user type:', userType);
  
  // Ensure userType is valid before using it as index
  if (isValidUserType(userType)) {
    return DASHBOARD_ROUTES[userType];
  }
  
  console.warn('[AUTH-REDIRECTS] User type not found or invalid in metadata:', user);
  // If we can't determine type, redirect to dashboard which will handle further redirection
  return '/dashboard';
};

export const getConfirmationRedirect = (userType: UserType): string => {
  return `/register/confirm?type=${userType}`;
}; 
