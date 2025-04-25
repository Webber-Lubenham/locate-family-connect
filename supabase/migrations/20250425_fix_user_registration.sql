-- Migration para corrigir problemas no cadastro de usuários
-- Data: 25/04/2025

-- 1. Verificar se o diretório existe e criar se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
    ) THEN
        RAISE EXCEPTION 'A tabela profiles não existe!';
    END IF;
END
$$;

-- 2. Modificar a coluna phone para permitir NULL (opcional) e ajustar o tipo
ALTER TABLE public.profiles 
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN phone TYPE VARCHAR(20);

-- 3. Remover qualquer restrição de formato no telefone (se existir)
-- Isso garantirá que qualquer formato de telefone seja aceito
DO $$
BEGIN
    -- Tentar remover constraint se existir
    BEGIN
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_check;
    EXCEPTION WHEN OTHERS THEN
        -- Ignorar erro se a constraint não existir
    END;
END
$$;

-- 4. Verificar triggers que podem estar causando problemas
-- Lista todos os triggers na tabela profiles para referência
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'profiles';

-- 5. Adicionar gatilho para garantir que o perfil seja criado corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o usuário já tem um perfil, não faz nada
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;
    
    -- Criar um perfil básico com informações mínimas
    INSERT INTO public.profiles (id, full_name, user_type)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'user_type'
    );
    
    -- Se houve um erro na inserção, registrar e continuar
    -- Isso evita que o cadastro falhe completamente
    EXCEPTION WHEN OTHERS THEN
        -- Registrar o erro, mas permitir que o usuário seja criado mesmo assim
        RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger caso já exista
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Adicionar log para depuração
CREATE OR REPLACE FUNCTION public.log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.auth_logs (
        event_type,
        user_id,
        metadata,
        occurred_at
    ) VALUES (
        TG_OP,
        NEW.id,
        jsonb_build_object('raw_user_meta_data', NEW.raw_user_meta_data),
        NOW()
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Não falhar se o log não funcionar
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar tabela de logs se não existir
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id SERIAL PRIMARY KEY,
    event_type TEXT,
    user_id UUID,
    metadata JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE
);

-- Adicionar trigger para logging (opcional)
DROP TRIGGER IF EXISTS on_auth_user_log ON auth.users;
CREATE TRIGGER on_auth_user_log
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.log_auth_event();

-- Adicionar permissões para a tabela auth_logs
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all logs" ON public.auth_logs
  FOR SELECT USING (auth.role() = 'service_role');
