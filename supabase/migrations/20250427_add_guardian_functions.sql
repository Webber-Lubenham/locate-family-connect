-- Função para buscar estudantes relacionados a um responsável
CREATE OR REPLACE FUNCTION get_guardian_students(guardian_email TEXT)
RETURNS TABLE (
  student_id UUID,
  student_email TEXT,
  student_name TEXT,
  relationship_date TIMESTAMPTZ,
  is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.student_id,
    p.email AS student_email,
    p.full_name AS student_name,
    g.created_at AS relationship_date,
    g.is_active
  FROM guardians g
  JOIN profiles p ON g.student_id = p.user_id
  WHERE g.email = guardian_email
    AND g.is_active = true;
END;
$$;

-- Função para verificar se existe uma relação entre responsável e estudante
CREATE OR REPLACE FUNCTION check_guardian_relationship(guardian_email TEXT, student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  relationship_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM guardians 
    WHERE email = guardian_email 
      AND student_id = student_id
      AND is_active = true
  ) INTO relationship_exists;
  
  RETURN relationship_exists;
END;
$$;

-- Função para adicionar um relacionamento entre responsável e estudante
CREATE OR REPLACE FUNCTION add_guardian_relationship(
  p_student_id UUID, 
  p_guardian_email TEXT, 
  p_guardian_name TEXT DEFAULT NULL,
  p_guardian_phone TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  relationship_exists BOOLEAN;
BEGIN
  -- Verifica se já existe um relacionamento ativo
  SELECT EXISTS (
    SELECT 1 
    FROM guardians 
    WHERE email = p_guardian_email 
      AND student_id = p_student_id
      AND is_active = true
  ) INTO relationship_exists;
  
  -- Se não existir, cria um novo
  IF NOT relationship_exists THEN
    INSERT INTO guardians (
      student_id, 
      email, 
      full_name, 
      phone, 
      is_active
    ) VALUES (
      p_student_id,
      p_guardian_email,
      p_guardian_name,
      p_guardian_phone,
      true
    );
    RETURN true;
  ELSE
    RETURN false; -- Relacionamento já existe
  END IF;
END;
$$;

-- Atualizar regras de segurança para permitir o uso das funções
GRANT EXECUTE ON FUNCTION get_guardian_students TO authenticated;
GRANT EXECUTE ON FUNCTION check_guardian_relationship TO authenticated;
GRANT EXECUTE ON FUNCTION add_guardian_relationship TO authenticated;

-- Comentários para documentação:
COMMENT ON FUNCTION get_guardian_students IS 'Retorna todos os estudantes associados a um responsável';
COMMENT ON FUNCTION check_guardian_relationship IS 'Verifica se existe uma relação entre responsável e estudante';
COMMENT ON FUNCTION add_guardian_relationship IS 'Adiciona um relacionamento entre responsável e estudante';
