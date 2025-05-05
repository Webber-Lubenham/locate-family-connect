-- Migration: Corrige problemas com compartilhamento de localização para responsáveis
-- Data: 2025-05-15
-- Problema: Responsáveis não conseguem visualizar as localizações dos estudantes

-- Registrar o início da migração nos logs para diagnóstico
INSERT INTO public.auth_logs (event_type, user_id, metadata, occurred_at)
VALUES (
  'migration_started',
  NULL,
  jsonb_build_object(
    'name', '20250515_fix_location_sharing_for_guardians',
    'description', 'Corrigindo funções e políticas para visualização de localização'
  ),
  now()
);

-- Remover todas as versões existentes da função
DROP FUNCTION IF EXISTS public.get_student_locations_for_guardian(UUID);
DROP FUNCTION IF EXISTS public.get_student_locations_for_guardian(UUID, TEXT);

-- Cria nova função para responsáveis buscarem localizações (versão melhorada)
CREATE OR REPLACE FUNCTION public.get_student_locations_for_guardian(
  p_student_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  "timestamp" TIMESTAMPTZ,
  address TEXT,
  shared_with_guardians BOOLEAN,
  student_name TEXT
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
  RETURN QUERY
  SELECT
    l.id,
    l.user_id,
    l.latitude,
    l.longitude,
    l."timestamp",
    l.address,
    l.shared_with_guardians,
    p.full_name AS student_name
  FROM
    public.locations l
    LEFT JOIN public.profiles p ON l.user_id = p.user_id
  WHERE
    l.user_id = p_student_id
  ORDER BY
    l."timestamp" DESC;
END;
$$;

-- Conceder permissão para usuários autenticados usarem a função
GRANT EXECUTE ON FUNCTION public.get_student_locations_for_guardian TO authenticated;

-- Criar nova função para obter a última localização de cada estudante vinculado ao responsável
DROP FUNCTION IF EXISTS public.get_latest_location_for_all_students();

CREATE OR REPLACE FUNCTION public.get_latest_location_for_all_students()
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  "timestamp" TIMESTAMPTZ,
  address TEXT
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
  
  -- Retornar as últimas localizações de cada estudante vinculado ao responsável
  RETURN QUERY
  WITH student_ids AS (
    SELECT g.student_id
    FROM public.guardians g
    WHERE g.email = v_guardian_email
    AND g.is_active = true
  ),
  latest_locations AS (
    SELECT DISTINCT ON (l.user_id)
      l.user_id,
      l.latitude,
      l.longitude,
      l."timestamp",
      l.address
    FROM
      public.locations l
    JOIN student_ids s ON l.user_id = s.student_id
    ORDER BY
      l.user_id, l."timestamp" DESC
  )
  SELECT
    ll.user_id,
    COALESCE(p.full_name, u.email) as student_name,
    ll.latitude,
    ll.longitude,
    ll."timestamp",
    ll.address
  FROM
    latest_locations ll
  LEFT JOIN auth.users u ON ll.user_id = u.id
  LEFT JOIN public.profiles p ON ll.user_id = p.user_id;
END;
$$;

-- Conceder permissão para usuários autenticados usarem a função
GRANT EXECUTE ON FUNCTION public.get_latest_location_for_all_students TO authenticated;

-- Modificar a política RLS para permitir que responsáveis vejam localizações
DROP POLICY IF EXISTS "Responsáveis podem ver localizações compartilhadas" ON public.locations;

-- Nova política mais permissiva para responsáveis
CREATE POLICY "Responsáveis podem ver localizações de estudantes vinculados"
ON public.locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.guardians g
    WHERE g.student_id = locations.user_id
    AND g.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND g.is_active = true
  )
);

-- Registrar a conclusão da migração
INSERT INTO public.auth_logs (event_type, user_id, metadata, occurred_at)
VALUES (
  'migration_completed',
  NULL,
  jsonb_build_object(
    'name', '20250515_fix_location_sharing_for_guardians',
    'description', 'Concluída a correção das funções e políticas para visualização de localização'
  ),
  now()
);
