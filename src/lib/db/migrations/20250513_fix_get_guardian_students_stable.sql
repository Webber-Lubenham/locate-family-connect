-- Migration: Corrige função get_guardian_students para ser STABLE e exposta como RPC
-- Data: 2025-05-13

DROP FUNCTION IF EXISTS public.get_guardian_students();

CREATE OR REPLACE FUNCTION public.get_guardian_students()
RETURNS TABLE (
  student_id UUID,
  student_email TEXT,
  student_name TEXT
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    COALESCE(p.full_name, '')
  FROM
    guardians g
    JOIN users u ON g.student_id = u.id
    LEFT JOIN profiles p ON p.user_id = u.id
  WHERE
    g.email = (auth.jwt() ->> 'email')
    AND g.is_active = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_guardian_students TO authenticated; 