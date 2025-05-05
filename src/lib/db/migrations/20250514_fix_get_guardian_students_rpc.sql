-- Migration: Corrige configuração da função get_guardian_students para o RPC
-- Data: 2025-05-14
-- Problema: Função get_guardian_students não está acessível via RPC e tem problemas de tipo

-- Remove função anterior
DROP FUNCTION IF EXISTS public.get_guardian_students();

-- Recria a função com configuração correta para expor como RPC
CREATE OR REPLACE FUNCTION public.get_guardian_students()
RETURNS TABLE (
  student_id UUID,
  student_email TEXT,
  student_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Registra chamada no log para diagnóstico
  INSERT INTO public.auth_logs (event_type, user_id, metadata, occurred_at)
  VALUES (
    'rpc_get_guardian_students_called', 
    auth.uid(),
    jsonb_build_object(
      'caller_email', auth.jwt() ->> 'email',
      'timestamp', now()
    ),
    now()
  );

  -- Retorna dados dos estudantes vinculados ao responsável
  RETURN QUERY
  SELECT
    u.id::UUID,
    u.email::TEXT,
    COALESCE(p.full_name, '')::TEXT
  FROM
    public.guardians g
    JOIN auth.users u ON g.student_id = u.id
    LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE
    g.email = (auth.jwt() ->> 'email')
    AND g.is_active = true;
END;
$$;

-- Concede permissão para usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_guardian_students TO authenticated;

-- Adiciona função ao esquema de RPC
COMMENT ON FUNCTION public.get_guardian_students IS 'Obtém estudantes vinculados ao responsável atual';

-- Registra aplicação da migração
INSERT INTO public.auth_logs (event_type, user_id, metadata, occurred_at)
VALUES (
  'migration_applied',
  NULL,
  jsonb_build_object(
    'name', '20250514_fix_get_guardian_students_rpc',
    'description', 'Corrigida configuração da função get_guardian_students para o RPC',
    'fixed_issue', 'uuid = integer type mismatch and 404 Not Found error'
  ),
  now()
);
