import { User } from '@supabase/supabase-js';

export type UserType = 'student' | 'parent';

export const DASHBOARD_ROUTES = {
  student: '/student/dashboard',
  parent: '/parent/dashboard',
  default: '/login'
};

export const getRedirectPath = (user: User | null): string => {
  if (!user) return DASHBOARD_ROUTES.default;
  
  const userType = user.user_metadata?.user_type as UserType;
  
  switch (userType) {
    case 'student':
      return DASHBOARD_ROUTES.student;
    case 'parent':
      return DASHBOARD_ROUTES.parent;
    default:
      console.warn('User type not found in metadata:', user);
      return DASHBOARD_ROUTES.default;
  }
};

export const getConfirmationRedirect = (userType: UserType): string => {
  return `/register/confirm?type=${userType}`;
}; 