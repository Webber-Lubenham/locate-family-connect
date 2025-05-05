-- Migration: Função segura para responsáveis consultarem seus estudantes vinculados
-- Data: 2025-05-06

-- Remove função antiga (com parâmetro) se existir
DROP FUNCTION IF EXISTS public.get_guardian_students(TEXT);

CREATE OR REPLACE FUNCTION public.get_guardian_students()
RETURNS TABLE (
  student_id UUID,
  student_email TEXT,
  student_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.email,
    s.full_name
  FROM
    students s
    JOIN guardian_student_relationships gsr ON gsr.student_id = s.id
  WHERE
    gsr.guardian_email = (auth.jwt() ->> 'email');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permitir execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_guardian_students TO authenticated; 