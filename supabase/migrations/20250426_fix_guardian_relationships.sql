-- Migration: Corrigir relações entre responsáveis e estudantes
-- Data: 26/04/2025

-- 1. Verificar e corrigir a estrutura da tabela guardians
DO $$
BEGIN
  -- Verificar se a tabela existe
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'guardians') THEN
    -- A tabela existe, então vamos verificar suas colunas
    
    -- Verificar e adicionar coluna full_name se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'guardians' 
      AND column_name = 'full_name') 
    THEN
      ALTER TABLE public.guardians ADD COLUMN full_name TEXT;
    END IF;

    -- Verificar e adicionar coluna phone se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'guardians' 
      AND column_name = 'phone') 
    THEN
      ALTER TABLE public.guardians ADD COLUMN phone TEXT;
    END IF;

    -- Verificar e adicionar coluna is_active se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'guardians' 
      AND column_name = 'is_active') 
    THEN
      ALTER TABLE public.guardians ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Garantir que student_id é UUID
    IF EXISTS (SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'guardians' 
      AND column_name = 'student_id') 
    THEN
      ALTER TABLE public.guardians ALTER COLUMN student_id TYPE UUID USING student_id::UUID;
    END IF;
    
  ELSE
    -- A tabela não existe, então vamos criá-la
    CREATE TABLE public.guardians (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
      student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      full_name TEXT,
      phone TEXT,
      is_active BOOLEAN DEFAULT TRUE
    );
  END IF;
END
$$;

-- 2. Garantir a existência dos índices corretos
DROP INDEX IF EXISTS guardians_student_id_idx;
CREATE INDEX IF NOT EXISTS guardians_student_id_idx ON public.guardians(student_id);

DROP INDEX IF EXISTS guardians_email_idx;
CREATE INDEX IF NOT EXISTS guardians_email_idx ON public.guardians(email);

-- 3. Atualizar políticas RLS
-- Remover políticas existentes
DROP POLICY IF EXISTS "Students can manage their guardians" ON public.guardians;
DROP POLICY IF EXISTS "Guardians can view student locations" ON public.locations;
DROP POLICY IF EXISTS "Estudantes podem gerenciar seus responsáveis" ON public.guardians;

-- Adicionar políticas atualizadas
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- Políticas para estudantes gerenciarem seus guardians
CREATE POLICY "Students can manage their guardians"
  ON public.guardians
  FOR ALL
  USING (auth.uid() = student_id);

-- 4. Adicionar dados de exemplo para vincular os estudantes ao pai
DO $$
DECLARE
  parent_email TEXT := 'frankwebber33@hotmail.com';
  student_emails TEXT[] := ARRAY['franklima.flm@gmail.com', 'franklinmarceloferreiralima@gmail.com', 'cetisergiopessoa@gmail.com'];
  student_id UUID;
  student_email TEXT;
BEGIN
  -- Para cada email de estudante
  FOREACH student_email IN ARRAY student_emails
  LOOP
    -- Buscar o ID do estudante
    SELECT id INTO student_id FROM auth.users WHERE email = student_email;
    
    -- Se o estudante existir
    IF student_id IS NOT NULL THEN
      -- Verificar se a relação já existe
      IF NOT EXISTS (SELECT 1 FROM public.guardians WHERE student_id = student_id AND email = parent_email) THEN
        -- Inserir a relação
        INSERT INTO public.guardians (student_id, email, full_name, is_active)
        VALUES (student_id, parent_email, 'Mauro Frank - Responsável', TRUE);
        
        RAISE NOTICE 'Relação criada entre estudante % e responsável %', student_email, parent_email;
      ELSE
        RAISE NOTICE 'Relação já existe entre estudante % e responsável %', student_email, parent_email;
      END IF;
    ELSE
      RAISE NOTICE 'Estudante com email % não encontrado', student_email;
    END IF;
  END LOOP;
END
$$;

-- 5. Atualizar a visualização de perfil para incluir relações com guardians
-- Criar função para obter guardians de um estudante
CREATE OR REPLACE FUNCTION public.get_student_guardians(student_uuid UUID)
RETURNS TABLE (
  guardian_email TEXT,
  guardian_full_name TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.email AS guardian_email,
    g.full_name AS guardian_full_name,
    g.is_active,
    g.created_at
  FROM 
    public.guardians g
  WHERE 
    g.student_id = student_uuid
    AND g.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para obter estudantes de um guardian
CREATE OR REPLACE FUNCTION public.get_guardian_students(guardian_email TEXT)
RETURNS TABLE (
  student_id UUID,
  student_email TEXT,
  student_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS student_id,
    u.email AS student_email,
    p.full_name AS student_name
  FROM 
    public.guardians g
    JOIN auth.users u ON g.student_id = u.id
    LEFT JOIN public.profiles p ON u.id = p.user_id
  WHERE 
    g.email = guardian_email
    AND g.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Conceder permissões
GRANT ALL ON public.guardians TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_guardians TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_guardian_students TO authenticated;
