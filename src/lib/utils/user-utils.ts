export function getUserType(user: any): 'student' | 'parent' | 'teacher' | 'unknown' {
  if (!user) return 'unknown';
  return user.user_type || user.user_metadata?.user_type || 'unknown';
}

export function isStudent(user: any): boolean {
  return getUserType(user) === 'student';
}

export function isParent(user: any): boolean {
  return getUserType(user) === 'parent';
}

export function hasPermission(user: any, requiredType: string | null): boolean {
  if (!requiredType) return true;
  return getUserType(user) === requiredType;
} 