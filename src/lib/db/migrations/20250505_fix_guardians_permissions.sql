-- Migration: Corrigir permissões para acesso à tabela guardians
-- Data: 05/05/2025
-- Problema: Estudantes não conseguem visualizar seus responsáveis devido a problemas com permissões RLS

-- Criar função com SECURITY DEFINER para buscar guardians do estudante com segurança
CREATE OR REPLACE FUNCTION public.get_student_guardians_secure(p_student_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  student_id UUID,
  email TEXT,
  full_name TEXT,
  phone VARCHAR(20),
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_student_id UUID;
BEGIN
  -- Se nenhum ID for fornecido, usa o ID do usuário atual
  IF p_student_id IS NULL THEN
    v_student_id := auth.uid();
  ELSE
    -- Verifica se o usuário atual tem permissão para ver os guardians do estudante fornecido
    IF p_student_id = auth.uid() THEN
      v_student_id := p_student_id;
    ELSE
      RAISE EXCEPTION 'Permissão negada';
    END IF;
  END IF;

  -- Retorna os guardians do estudante
  RETURN QUERY
  SELECT 
    g.id,
    g.student_id,
    g.email,
    g.full_name,
    g.phone,
    g.is_active,
    g.created_at
  FROM 
    public.guardians g
  WHERE 
    g.student_id = v_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_student_guardians_secure TO authenticated;

-- Registrar migração no log
INSERT INTO public.auth_logs (event, metadata)
VALUES (
  'migration_applied', 
  jsonb_build_object(
    'name', '20250505_fix_guardians_permissions', 
    'description', 'Corrigida permissão para acesso à tabela guardians por estudantes',
    'table', 'guardians',
    'created_function', 'get_student_guardians_secure'
  )
);

-- Policy: Students can view their guardians
CREATE POLICY "Students can view their guardians"
ON public.guardians
FOR SELECT
USING (student_id = auth.uid());
