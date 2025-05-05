-- Migration: 20250518_fix_location_access_for_guardians.sql
-- Descrição: Corrige os problemas de acesso às localizações para responsáveis
-- Autor: Cascade AI
-- Data: 2025-05-18

-- 1. Corrigir a função de acesso às localizações de estudantes para responsáveis
CREATE OR REPLACE FUNCTION public.get_student_locations_with_names(
  p_student_id UUID 
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_timestamp TIMESTAMPTZ,
  address TEXT,
  shared_with_guardians BOOLEAN,
  student_name TEXT
) AS $$
DECLARE
  v_guardian_email TEXT;
BEGIN
  -- Obter o email do responsável autenticado
  SELECT email INTO v_guardian_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Verificar se o usuário atual é um responsável do estudante
  IF NOT EXISTS (
    SELECT 1 FROM public.guardians g
    WHERE g.student_id = p_student_id
    AND g.email = v_guardian_email
    AND g.is_active = true
  ) THEN
    RAISE EXCEPTION 'Você não tem permissão para ver as localizações deste estudante';
  END IF;

  -- Registrar nos logs para diagnóstico
  INSERT INTO public.auth_logs (event_type, user_id, metadata, occurred_at)
  VALUES (
    'get_student_locations_with_names_called',
    auth.uid(),
    jsonb_build_object(
      'guardian_email', v_guardian_email,
      'student_id', p_student_id,
      'timestamp', now()
    ),
    now()
  );
  
  -- Retornar as localizações com prefixos explícitos de tabela para evitar ambiguidade
  RETURN QUERY
  SELECT
    l.id,
    l.user_id,
    l.latitude,
    l.longitude,
    l.timestamp AS location_timestamp,
    l.address,
    l.shared_with_guardians,
    p.full_name AS student_name
  FROM
    public.locations l
    JOIN public.profiles p ON l.user_id = p.user_id
  WHERE
    l.user_id = p_student_id
    AND l.shared_with_guardians = true
  ORDER BY
    l.timestamp DESC;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- 2. Conceder permissões para que guardiões possam usar a função
GRANT EXECUTE ON FUNCTION public.get_student_locations_with_names(UUID) TO authenticated;

-- 3. Comentários para documentação
COMMENT ON FUNCTION public.get_student_locations_with_names IS 
'Função segura para acesso às localizações de estudantes por responsáveis, com search_path fixo e evitando ambiguidade de coluna.';

-- 4. Registrar a execução da migração
INSERT INTO public.auth_logs (event_type, metadata, occurred_at)
VALUES (
  'security_migration_executed', 
  jsonb_build_object(
    'migration', '20250518_fix_location_access_for_guardians.sql',
    'description', 'Migração para corrigir acesso de responsáveis às localizações de estudantes'
  ), 
  now()
);
