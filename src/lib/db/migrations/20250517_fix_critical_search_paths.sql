-- Migration: 20250517_fix_critical_search_paths.sql
-- Descrição: Atualiza funções críticas de localização para usar search_path explícito
-- Autor: Cascade AI
-- Data: 2025-05-17

-- Garante que o schema privado exista
CREATE SCHEMA IF NOT EXISTS private;

-- Atualiza a função 'get_guardian_locations_secure' com acesso ao schema privado
ALTER FUNCTION public.get_guardian_locations_secure(p_student_id uuid)
SECURITY DEFINER
SET search_path = public, private, auth;

-- Atualiza a função 'get_student_locations' para usar search_path explícito
ALTER FUNCTION public.get_student_locations(p_guardian_email text, p_student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'get_student_locations_for_guardian' para usar search_path explícito
ALTER FUNCTION public.get_student_locations_for_guardian(p_student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'save_student_location' para usar search_path explícito
ALTER FUNCTION public.save_student_location(p_user_id uuid, p_latitude double precision, p_longitude double precision, p_timestamp timestamp with time zone, p_address text, p_shared_with_guardians boolean)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'update_updated_at_column' para usar search_path explícito
ALTER FUNCTION public.update_updated_at_column()
SECURITY DEFINER
SET search_path = public, auth;

-- Adicionar comentários nas funções para documentar a segurança
COMMENT ON FUNCTION public.get_guardian_locations_secure IS 'Função segura para obter localizações de estudantes, usando search_path fixo incluindo schema privado';
COMMENT ON FUNCTION public.get_student_locations IS 'Função para buscar localizações de estudantes para responsáveis, com search_path fixo';
COMMENT ON FUNCTION public.get_student_locations_for_guardian IS 'Função para obter localizações de estudantes para responsáveis, com search_path fixo';
COMMENT ON FUNCTION public.save_student_location IS 'Função para salvar localização de estudantes com search_path fixo';
COMMENT ON FUNCTION public.update_updated_at_column IS 'Função trigger para atualizar coluna updated_at com search_path fixo';

-- Registra a execução da migração nos logs
INSERT INTO public.auth_logs (event_type, metadata, occurred_at)
VALUES ('security_migration_executed', jsonb_build_object(
  'migration', '20250517_fix_critical_search_paths.sql',
  'description', 'Aplicou search_path fixo para funções críticas de localização'
), now());
