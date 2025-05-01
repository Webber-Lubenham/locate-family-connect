-- Remover triggers antigos que podem estar causando problemas
DROP TRIGGER IF EXISTS validate_email_trigger ON auth.users;
DROP TRIGGER IF EXISTS validate_phone_trigger ON auth.users;
DROP TRIGGER IF EXISTS validate_phone_trigger ON public.user_profiles;

-- Remover funções antigas
DROP FUNCTION IF EXISTS public.validate_email_trigger();
DROP FUNCTION IF EXISTS public.validate_phone_trigger();
DROP FUNCTION IF EXISTS public.validate_email();
DROP FUNCTION IF EXISTS public.validate_phone();

-- Criar função para validar email
CREATE OR REPLACE FUNCTION public.validate_email(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validação básica de formato de email
  IF email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN false;
  END IF;

  -- Bloquear domínios temporários conhecidos
  IF email ~ '@(tempmail\.com|temp-mail\.org|disposablemail\.com)$' THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- Criar função para validar telefone
CREATE OR REPLACE FUNCTION public.validate_phone(phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se o telefone for nulo ou vazio, é válido (telefone é opcional)
  IF phone IS NULL OR phone = '' THEN
    RETURN true;
  END IF;

  -- Remover caracteres de formatação
  phone := regexp_replace(phone, '[^0-9+]', '', 'g');

  -- Validação básica: deve começar com + e ter apenas números depois
  IF phone !~ '^\+[0-9]+$' THEN
    RETURN false;
  END IF;

  -- Validações específicas por prefixo de país
  IF phone ~ '^\+55' THEN
    -- Brasil: +55 seguido de 10-11 dígitos
    RETURN phone ~ '^\+55[0-9]{10,11}$';
  ELSIF phone ~ '^\+44' THEN
    -- Reino Unido: +44 seguido de 10-11 dígitos
    RETURN phone ~ '^\+44[0-9]{10,11}$';
  ELSIF phone ~ '^\+1' THEN
    -- Estados Unidos: +1 seguido de 10 dígitos
    RETURN phone ~ '^\+1[0-9]{10}$';
  ELSIF phone ~ '^\+351' THEN
    -- Portugal: +351 seguido de 9 dígitos
    RETURN phone ~ '^\+351[0-9]{9}$';
  ELSE
    -- Formato genérico: pelo menos 8 dígitos após o +
    RETURN phone ~ '^\+[0-9]{8,}$';
  END IF;
END;
$$;

-- Criar função para limpar e formatar telefone
CREATE OR REPLACE FUNCTION public.format_phone(phone text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF phone IS NULL OR phone = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remover todos os caracteres não numéricos, exceto +
  RETURN regexp_replace(phone, '[^0-9+]', '', 'g');
END;
$$;

-- Criar ou substituir a tabela user_profiles
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  user_type text NOT NULL CHECK (user_type IN ('student', 'parent', 'teacher')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(auth_user_id),
  UNIQUE(email)
);

-- Criar índices
CREATE INDEX idx_user_profiles_auth_user_id ON public.user_profiles(auth_user_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_user_type ON public.user_profiles(user_type);

-- Garantir permissões
GRANT ALL ON public.user_profiles TO postgres, authenticator, service_role;

-- Criar trigger para validar e formatar dados do perfil
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validar e formatar telefone
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := public.format_phone(NEW.phone);
    IF NOT public.validate_phone(NEW.phone) THEN
      RAISE EXCEPTION 'Invalid phone number format. Please use international format with country code (e.g., +44XXXXXXXXXX)';
    END IF;
  END IF;

  -- Validar email
  IF NEW.email IS NOT NULL THEN
    IF NOT public.validate_email(NEW.email) THEN
      RAISE EXCEPTION 'Invalid email format or temporary email domain not allowed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Aplicar trigger na tabela de perfis
DROP TRIGGER IF EXISTS validate_profile_data_trigger ON public.user_profiles;
CREATE TRIGGER validate_profile_data_trigger
  BEFORE INSERT OR UPDATE
  ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_data();

-- Atualizar função de manipulação de novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (auth_user_id, name, email, user_type)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email, NEW.raw_user_meta_data->>'userType')
  ON CONFLICT (auth_user_id) DO UPDATE
  SET name = EXCLUDED.name,
      email = EXCLUDED.email,
      user_type = EXCLUDED.user_type,
      updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Garantir permissões para as funções
GRANT EXECUTE ON FUNCTION public.validate_email(text) TO postgres, authenticator, service_role;
GRANT EXECUTE ON FUNCTION public.validate_phone(text) TO postgres, authenticator, service_role;
GRANT EXECUTE ON FUNCTION public.format_phone(text) TO postgres, authenticator, service_role;
GRANT EXECUTE ON FUNCTION public.validate_profile_data() TO postgres, authenticator, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, authenticator, service_role; 