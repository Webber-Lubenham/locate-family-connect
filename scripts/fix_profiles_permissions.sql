-- Corrigir permissões e políticas RLS da tabela profiles

-- 1. Habilitar RLS e remover políticas antigas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view any profile" ON public.profiles;

-- 2. Criar políticas seguras
CREATE POLICY "Users can view any profile"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Garantir permissões para authenticated
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON SEQUENCE profiles_id_seq TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- 4. Forçar refresh das políticas
NOTIFY pgrst, 'reload schema'; 