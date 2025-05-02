import { getUserType, isStudent, isParent, hasPermission } from '../user-utils';

describe('user-utils', () => {
  it('getUserType retorna o tipo correto', () => {
    expect(getUserType({ user_type: 'student' })).toBe('student');
    expect(getUserType({ user_metadata: { user_type: 'parent' } })).toBe('parent');
    expect(getUserType({})).toBe('unknown');
    expect(getUserType(null)).toBe('unknown');
  });

  it('isStudent retorna true apenas para estudantes', () => {
    expect(isStudent({ user_type: 'student' })).toBe(true);
    expect(isStudent({ user_metadata: { user_type: 'student' } })).toBe(true);
    expect(isStudent({ user_type: 'parent' })).toBe(false);
    expect(isStudent(null)).toBe(false);
  });

  it('isParent retorna true apenas para responsáveis', () => {
    expect(isParent({ user_type: 'parent' })).toBe(true);
    expect(isParent({ user_metadata: { user_type: 'parent' } })).toBe(true);
    expect(isParent({ user_type: 'student' })).toBe(false);
    expect(isParent(undefined)).toBe(false);
  });

  it('hasPermission verifica permissões corretamente', () => {
    expect(hasPermission({ user_type: 'student' }, 'student')).toBe(true);
    expect(hasPermission({ user_type: 'parent' }, 'student')).toBe(false);
    expect(hasPermission({ user_type: 'parent' }, null)).toBe(true);
    expect(hasPermission(null, 'student')).toBe(false);
  });
}); 