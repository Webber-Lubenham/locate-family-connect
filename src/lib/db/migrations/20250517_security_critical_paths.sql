-- Migration: 20250517_security_critical_paths.sql
-- Descrição: Atualiza funções críticas relacionadas à segurança com search_path explícito
-- Autor: Cascade AI
-- Data: 2025-05-17

-- Garante que o schema privado exista
CREATE SCHEMA IF NOT EXISTS private;

-- 1. Atualiza a função 'get_guardian_locations_secure' para garantir acesso ao schema privado
ALTER FUNCTION public.get_guardian_locations_secure(p_student_id uuid)
SECURITY DEFINER
SET search_path = public, private, auth;

-- 2. Atualiza a função 'get_student_locations' com search_path explícito
ALTER FUNCTION public.get_student_locations(p_guardian_email text, p_student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- 3. Atualiza a função 'save_student_location' com a assinatura correta
ALTER FUNCTION public.save_student_location(p_latitude double precision, p_longitude double precision, p_shared_with_guardians boolean)
SECURITY DEFINER
SET search_path = public, auth;

-- 4. Atualiza a função 'update_updated_at_column' com search_path explícito
ALTER FUNCTION public.update_updated_at_column()
SECURITY DEFINER
SET search_path = public, auth;

-- Adicionar comentários explicativos nas funções
COMMENT ON FUNCTION public.get_guardian_locations_secure IS 
'Função segura para acessar localizações via schema privado, com path fixo para evitar SQL injection';

COMMENT ON FUNCTION public.save_student_location IS 
'Função para salvar localização com controle de permissão e search_path fixo para segurança';

-- Registra a execução da migração nos logs
INSERT INTO public.auth_logs (event_type, metadata, occurred_at)
VALUES ('security_migration_executed', jsonb_build_object(
  'migration', '20250517_security_critical_paths.sql',
  'description', 'Aplicadas correções de search_path em funções críticas de segurança'
), now());
