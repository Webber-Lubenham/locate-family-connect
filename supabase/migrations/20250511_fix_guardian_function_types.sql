
-- Correção da função get_student_guardians_secure para compatibilidade de tipos
CREATE OR REPLACE FUNCTION public.get_student_guardians_secure(p_student_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  student_id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT, -- Alterado de VARCHAR(20) para TEXT para compatibilidade
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
    g.phone::TEXT, -- Conversão explícita para TEXT
    g.is_active,
    g.created_at
  FROM 
    public.guardians g
  WHERE 
    g.student_id = v_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que usuários autenticados possam acessar a função
GRANT EXECUTE ON FUNCTION public.get_student_guardians_secure TO authenticated;
