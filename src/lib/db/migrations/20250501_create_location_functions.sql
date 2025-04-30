
-- Função para salvar a localização do estudante
-- Esta função é executada com SECURITY DEFINER para contornar o RLS
-- e permitir que o estudante insira sua própria localização
CREATE OR REPLACE FUNCTION public.save_student_location(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_shared_with_guardians BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_location_id UUID;
BEGIN
  -- Inserir a localização e retornar o ID
  INSERT INTO public.locations (
    user_id,
    latitude,
    longitude,
    shared_with_guardians
  ) VALUES (
    auth.uid(),
    p_latitude,
    p_longitude,
    p_shared_with_guardians
  )
  RETURNING id INTO v_location_id;
  
  RETURN v_location_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Registrar o erro para debugging
    RAISE LOG 'Erro ao salvar localização para o usuário %: %', auth.uid(), SQLERRM;
    RAISE;
END;
$$;

-- Adicionar política RLS para permitir que os usuários vejam suas próprias localizações
ALTER TABLE IF EXISTS public.locations ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que possam estar causando conflitos
DROP POLICY IF EXISTS "Usuários podem ver suas próprias localizações" ON public.locations;
DROP POLICY IF EXISTS "Responsáveis podem ver localizações compartilhadas" ON public.locations;

-- Criar política para permitir que usuários vejam suas próprias localizações
CREATE POLICY "Usuários podem ver suas próprias localizações"
ON public.locations
FOR SELECT
USING (auth.uid() = user_id);

-- Criar política para permitir que responsáveis vejam localizações compartilhadas com eles
CREATE POLICY "Responsáveis podem ver localizações compartilhadas"
ON public.locations
FOR SELECT
USING (
  shared_with_guardians = true AND
  EXISTS (
    SELECT 1 FROM public.guardians
    WHERE guardians.student_id = locations.user_id
    AND guardians.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND guardians.is_active = true
  )
);

-- Função para obter as localizações de um estudante
-- Esta função permite que responsáveis vejam as localizações dos estudantes
CREATE OR REPLACE FUNCTION public.get_student_locations_for_guardian(
  p_student_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timestamp TIMESTAMPTZ,
  address TEXT,
  shared_with_guardians BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário atual é um responsável do estudante
  IF NOT EXISTS (
    SELECT 1 FROM public.guardians
    WHERE student_id = p_student_id
    AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Você não tem permissão para ver as localizações deste estudante';
  END IF;

  -- Retornar as localizações do estudante
  RETURN QUERY
  SELECT
    l.id,
    l.user_id,
    l.latitude,
    l.longitude,
    l.timestamp,
    l.address,
    l.shared_with_guardians
  FROM
    public.locations l
  WHERE
    l.user_id = p_student_id
  AND
    l.shared_with_guardians = true
  ORDER BY
    l.timestamp DESC;
END;
$$;
