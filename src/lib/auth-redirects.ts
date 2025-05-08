
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
 * Gets the appropriate redirect path based on user type
 * @param user The authenticated user object
 * @returns The path to redirect the user to
 */
export const getRedirectPath = (user: User | null): string => {
  if (!user) return DASHBOARD_ROUTES.default;
  
  // First try to get user_type from user_metadata
  let userType = user.user_metadata?.user_type as UserType;
  
  // If not found in metadata, try app_metadata
  if (!userType) {
    userType = user.app_metadata?.user_type as UserType;
  }
  
  console.log('[AUTH-REDIRECTS] Determining redirect path for user type:', userType);
  
  switch (userType) {
    case 'student':
      return DASHBOARD_ROUTES.student;
    case 'parent':
    case 'guardian':
      return DASHBOARD_ROUTES.guardian;
    case 'developer':
      return DASHBOARD_ROUTES.developer;
    case 'admin':
      return DASHBOARD_ROUTES.admin;
    default:
      console.warn('[AUTH-REDIRECTS] User type not found in metadata:', user);
      // If we can't determine type, redirect to dashboard which will handle further redirection
      return '/dashboard';
  }
};

export const getConfirmationRedirect = (userType: UserType): string => {
  return `/register/confirm?type=${userType}`;
}; 
