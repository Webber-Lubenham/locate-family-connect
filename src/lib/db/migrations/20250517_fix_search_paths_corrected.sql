-- Migration: 20250517_fix_search_paths_corrected.sql
-- Descrição: Atualiza funções no schema público para usar search_path explícito
-- Autor: Cascade AI
-- Data: 2025-05-17

-- Garante que o schema privado exista
CREATE SCHEMA IF NOT EXISTS private;

-- Atualiza a função 'add_guardian_relationship' para usar search_path explícito
ALTER FUNCTION public.add_guardian_relationship(p_student_id uuid, p_guardian_email text, p_guardian_name text, p_guardian_phone text)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'check_guardian_relationship' para usar search_path explícito
ALTER FUNCTION public.check_guardian_relationship(guardian_email text, student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'create_test_location' para usar search_path explícito
ALTER FUNCTION public.create_test_location(p_student_id uuid, p_latitude double precision, p_longitude double precision, p_address text)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'format_phone' para usar search_path explícito
ALTER FUNCTION public.format_phone(phone text)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'get_guardian_locations_bypass' para usar search_path explícito
ALTER FUNCTION public.get_guardian_locations_bypass(p_student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'get_guardian_locations_bypass_v2' para usar search_path explícito
ALTER FUNCTION public.get_guardian_locations_bypass_v2(p_student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'get_guardian_locations_secure' para usar search_path explícito com acesso ao schema privado
ALTER FUNCTION public.get_guardian_locations_secure(p_student_id uuid)
SECURITY DEFINER
SET search_path = public, private, auth;

-- Atualiza a função 'get_guardian_notifications' para usar search_path explícito
ALTER FUNCTION public.get_guardian_notifications(p_guardian_email text)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'get_guardian_students' para usar search_path explícito
ALTER FUNCTION public.get_guardian_students()
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'get_latest_location_for_all_students' para usar search_path explícito
ALTER FUNCTION public.get_latest_location_for_all_students()
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'get_student_guardians_secure' para usar search_path explícito
ALTER FUNCTION public.get_student_guardians_secure(p_student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'get_student_locations' para usar search_path explícito
ALTER FUNCTION public.get_student_locations(p_student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'get_student_locations_for_guardian' para usar search_path explícito
ALTER FUNCTION public.get_student_locations_for_guardian(p_student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'get_unread_notifications_count' para usar search_path explícito
ALTER FUNCTION public.get_unread_notifications_count(p_user_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'handle_new_user' para usar search_path explícito
ALTER FUNCTION public.handle_new_user()
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'insert_student_test_location' para usar search_path explícito
ALTER FUNCTION public.insert_student_test_location(p_student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'is_strong_password' para usar search_path explícito
ALTER FUNCTION public.is_strong_password(password text)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'is_valid_email' para usar search_path explícito
ALTER FUNCTION public.is_valid_email(email text)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'is_valid_phone' para usar search_path explícito
ALTER FUNCTION public.is_valid_phone(phone text)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'log_auth_event' para usar search_path explícito
ALTER FUNCTION public.log_auth_event(event_type text, user_id uuid, metadata jsonb)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'notify_guardians_of_location' para usar search_path explícito
ALTER FUNCTION public.notify_guardians_of_location(p_student_id uuid, p_location_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'save_student_location' para usar search_path explícito
ALTER FUNCTION public.save_student_location(p_user_id uuid, p_latitude double precision, p_longitude double precision, p_timestamp timestamp with time zone, p_address text, p_shared_with_guardians boolean)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'test_guardian_access' para usar search_path explícito
ALTER FUNCTION public.test_guardian_access(p_guardian_email text, p_student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'test_location_access' para usar search_path explícito
ALTER FUNCTION public.test_location_access(p_student_id uuid)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'update_updated_at_column' para usar search_path explícito
ALTER FUNCTION public.update_updated_at_column()
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'validate_email' para usar search_path explícito
ALTER FUNCTION public.validate_email(email text)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'validate_email_before_insert' para usar search_path explícito
ALTER FUNCTION public.validate_email_before_insert()
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'validate_password_before_auth' para usar search_path explícito
ALTER FUNCTION public.validate_password_before_auth()
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'validate_phone' para usar search_path explícito
ALTER FUNCTION public.validate_phone(phone text)
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'validate_phone_format' para usar search_path explícito
ALTER FUNCTION public.validate_phone_format()
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'validate_profile_data' para usar search_path explícito
ALTER FUNCTION public.validate_profile_data()
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'validate_user_profile' para usar search_path explícito
ALTER FUNCTION public.validate_user_profile()
SECURITY DEFINER
SET search_path = public, auth;

-- Atualiza a função 'verify_user_integrity' para usar search_path explícito
ALTER FUNCTION public.verify_user_integrity()
SECURITY DEFINER
SET search_path = public, auth;

-- Adicionar comentários nas funções para documentar a segurança
COMMENT ON FUNCTION public.get_guardian_locations_secure IS 'Função segura para obter localizações de estudantes, usando search_path fixo e verificação de permissão';
COMMENT ON FUNCTION public.get_student_locations_for_guardian IS 'Função para obter localizações de estudantes para responsáveis, usando search_path fixo';

-- Registra a execução da migração nos logs
INSERT INTO public.auth_logs (event_type, metadata, occurred_at)
VALUES ('security_migration_executed', jsonb_build_object(
  'migration', '20250517_fix_search_paths_corrected.sql',
  'description', 'Aplicou search_path fixo para todas as funções no schema público'
), now());
