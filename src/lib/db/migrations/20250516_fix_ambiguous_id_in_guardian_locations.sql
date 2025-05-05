-- Migration to fix ambiguous ID reference in get_student_locations_for_guardian function
-- This fixes the 'column reference "id" is ambiguous' error

-- Remover versão atual da função
DROP FUNCTION IF EXISTS public.get_student_locations_for_guardian(UUID);

-- Criar versão corrigida com referências de tabela explícitas
CREATE OR REPLACE FUNCTION public.get_student_locations_for_guardian(
  p_student_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_timestamp TIMESTAMPTZ,
  address TEXT,
  shared_with_guardians BOOLEAN,
  student_name TEXT,
  student_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_guardian_email TEXT;
BEGIN
  -- Obter o email do responsável autenticado
  SELECT email INTO v_guardian_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Registrar a chamada para diagnóstico
  INSERT INTO public.auth_logs (event_type, user_id, metadata, occurred_at)
  VALUES (
    'get_student_locations_called',
    auth.uid(),
    jsonb_build_object(
      'guardian_email', v_guardian_email,
      'student_id', p_student_id
    ),
    now()
  );

  -- Verificar se o usuário atual é um responsável do estudante
  IF NOT EXISTS (
    SELECT 1 FROM public.guardians
    WHERE student_id = p_student_id
    AND email = v_guardian_email
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Você não tem permissão para ver as localizações deste estudante';
  END IF;

  -- Retornar as localizações do estudante (todas, independente de compartilhamento)
  -- Usar aliases explícitos para todas as colunas para evitar ambiguidade
  RETURN QUERY
  SELECT
    l.id AS id,
    l.user_id AS user_id,
    l.latitude AS latitude,
    l.longitude AS longitude,
    l."timestamp" AS location_timestamp,  -- Renomeado para evitar conflito com palavra reservada
    l.address AS address,
    l.shared_with_guardians AS shared_with_guardians,
    p.full_name AS student_name,
    p.email AS student_email
  FROM
    public.locations l
    JOIN public.profiles p ON l.user_id = p.user_id
  WHERE
    l.user_id = p_student_id
  ORDER BY
    l."timestamp" DESC;
END;
$$;

-- Conceder permissão para usuários autenticados usarem a função
GRANT EXECUTE ON FUNCTION public.get_student_locations_for_guardian TO authenticated;

-- Registrar na tabela de logs a aplicação da migração
INSERT INTO public.auth_logs (event_type, user_id, metadata, occurred_at)
VALUES (
  'migration_applied',
  auth.uid(),
  jsonb_build_object(
    'migration', '20250516_fix_ambiguous_id_in_guardian_locations',
    'description', 'Fixed ambiguous ID column reference in get_student_locations_for_guardian function'
  ),
  now()
);
