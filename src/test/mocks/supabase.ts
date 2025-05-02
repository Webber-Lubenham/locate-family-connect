// Mock básico do cliente Supabase para uso em testes
const fn = () => {};
export const supabase = {
  auth: {
    signInWithPassword: fn,
    signUp: fn,
    signOut: fn,
    getSession: fn,
  },
  from: () => ({
    select: fn,
    insert: fn,
    update: fn,
    delete: fn,
    eq: fn,
    single: fn,
  }),
}; 