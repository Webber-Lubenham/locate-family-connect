-- Migration: Add developer user type
-- Description: Adiciona suporte para usuários do tipo "developer" e cria um usuário padrão

-- Etapa 1: Verificar se não existe um usuário developer padrão
DO $$
DECLARE
  dev_email VARCHAR := 'dev@educonnect.com';
  user_id UUID;
BEGIN
  -- Verificar se o email já existe
  SELECT id INTO user_id FROM auth.users WHERE email = dev_email;
  
  -- Se o usuário não existir, cria-lo
  IF user_id IS NULL THEN
    -- Inserir usuário na tabela auth.users
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      aud,
      role
    )
    VALUES (
      dev_email,
      -- Senha criptografada para 'DevEduConnect2025!' - ALTERAR EM PRODUÇÃO!
      crypt('DevEduConnect2025!', gen_salt('bf')),
      now(),
      '{"provider":"email"}',
      '{"user_type":"developer", "full_name":"Developer Admin"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO user_id;
    
    -- Criar perfil associado ao usuário
    INSERT INTO public.profiles (
      user_id,
      full_name,
      user_type,
      created_at,
      updated_at
    )
    VALUES (
      user_id,
      'Developer Admin',
      'developer',
      now(),
      now()
    );
    
    RAISE NOTICE 'Usuário developer criado com sucesso: %', dev_email;
  ELSE
    -- Atualizar usuário existente para garantir que tenha o tipo "developer"
    UPDATE auth.users
    SET raw_user_meta_data = 
      CASE 
        WHEN raw_user_meta_data->>'user_type' IS NULL THEN 
          jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{user_type}', '"developer"')
        ELSE
          CASE 
            WHEN raw_user_meta_data->>'user_type' != 'developer' THEN
              jsonb_set(raw_user_meta_data, '{user_type}', '"developer"')
            ELSE
              raw_user_meta_data
          END
      END
    WHERE id = user_id;
    
    -- Garantir que o perfil também tenha user_type "developer"
    UPDATE public.profiles
    SET user_type = 'developer'
    WHERE user_id = user_id AND user_type != 'developer';
    
    RAISE NOTICE 'Usuário developer já existe e foi atualizado: %', dev_email;
  END IF;
END
$$;
