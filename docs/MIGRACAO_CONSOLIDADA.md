
# Migrações SQL Consolidadas - EduConnect

Este documento consolida todas as migrações SQL aplicadas no projeto EduConnect, fornecendo uma visão clara da evolução do esquema de banco de dados e das políticas de segurança.

## Índice

1. [Migrações de Esquema Básico](#1-migrações-de-esquema-básico)
2. [Migrações de Perfis de Usuário](#2-migrações-de-perfis-de-usuário)
3. [Migrações de Guardians](#3-migrações-de-guardians)
4. [Migrações de Localização](#4-migrações-de-localização)
5. [Migrações de Políticas RLS](#5-migrações-de-políticas-rls)
6. [Migrações de Funções RPC](#6-migrações-de-funções-rpc)
7. [Aplicando Migrações Manualmente](#7-aplicando-migrações-manualmente)

## 1. Migrações de Esquema Básico

### 1.1. Criação de Tabelas Iniciais

**20250417_setup_schema.sql**

```sql
-- Criação do esquema básico
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  email TEXT UNIQUE NOT NULL,
  user_type TEXT NOT NULL
);

-- ... outras tabelas básicas
```

### 1.2. Alteração de IDs para UUID

**20250418_alter_users_id_to_uuid.sql**

```sql
-- Alteração de tipo de coluna de id para UUID
ALTER TABLE public.users
ALTER COLUMN id TYPE UUID USING (uuid_generate_v4());
```

## 2. Migrações de Perfis de Usuário

### 2.1. Criação da Tabela Profiles

**20250417_create_profiles_table.sql**

```sql
-- Tabela para perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  email TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL,
  phone VARCHAR(20),
  user_type TEXT NOT NULL
);
```

### 2.2. Correções na Tabela Profiles

**20250417_fix_profiles_table.sql**

```sql
-- Correções na tabela profiles
ALTER TABLE public.profiles
ALTER COLUMN phone DROP NOT NULL;

-- Adição de trigger para atualização de timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
```

## 3. Migrações de Guardians

### 3.1. Criação de Tabela de Guardians

**20250426_fix_guardian_relationships.sql**

```sql
-- Criação da tabela guardians
CREATE TABLE IF NOT EXISTS public.guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Habilitação de RLS
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
```

### 3.2. Adição de Funções para Gerenciamento de Guardians

**20250427_add_guardian_functions.sql**

```sql
-- Função para buscar estudantes relacionados a um responsável
CREATE OR REPLACE FUNCTION get_guardian_students(guardian_email TEXT)
RETURNS TABLE (
  student_id UUID,
  student_email TEXT,
  student_name TEXT,
  relationship_date TIMESTAMPTZ,
  is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.student_id,
    p.email AS student_email,
    p.full_name AS student_name,
    g.created_at AS relationship_date,
    g.is_active
  FROM guardians g
  JOIN profiles p ON g.student_id = p.user_id
  WHERE g.email = guardian_email
    AND g.is_active = true;
END;
$$;

-- ... outras funções de guardian
```

### 3.3. Correção de Permissões de Guardians

**20250505_fix_guardians_permissions.sql**

```sql
-- Criação de função com SECURITY DEFINER para buscar guardians do estudante
CREATE OR REPLACE FUNCTION public.get_student_guardians_secure(p_student_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  student_id UUID,
  email TEXT,
  full_name TEXT,
  phone VARCHAR(20),
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_student_id UUID;
BEGIN
  -- Se nenhum ID for fornecido, usa o ID do usuário atual
  IF p_student_id IS NULL THEN
    v_student_id := auth.uid();
  ELSE
    -- Verifica se o usuário atual tem permissão para ver os guardians do estudante fornecido
    IF p_student_id = auth.uid() THEN
      v_student_id := p_student_id;
    ELSE
      RAISE EXCEPTION 'Permissão negada';
    END IF;
  END IF;

  -- Retorna os guardians do estudante
  RETURN QUERY
  SELECT 
    g.id,
    g.student_id,
    g.email,
    g.full_name,
    g.phone,
    g.is_active,
    g.created_at
  FROM 
    public.guardians g
  WHERE 
    g.student_id = v_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Concessão de permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_student_guardians_secure TO authenticated;
```

## 4. Migrações de Localização

### 4.1. Criação da Tabela Locations

```sql
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  shared_with_guardians BOOLEAN DEFAULT false,
  address TEXT
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
```

### 4.2. Funções de Localização

**20250501_create_location_functions.sql**

```sql
-- Função para salvar localização do estudante
CREATE OR REPLACE FUNCTION public.save_student_location(
  p_latitude DOUBLE PRECISION, 
  p_longitude DOUBLE PRECISION, 
  p_shared_with_guardians BOOLEAN DEFAULT false)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    RAISE LOG 'Erro ao salvar localização para o usuário %: %', auth.uid(), SQLERRM;
    RAISE;
END;
$$;
```

## 5. Migrações de Políticas RLS

### 5.1. Policies para Perfis

**20250419_fix_profiles_rls.sql**

```sql
-- Fix Row Level Security Policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view any profile" ON profiles;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies with proper permissions
-- Allow all authenticated users to view any profile
CREATE POLICY "Users can view any profile" 
  ON profiles 
  FOR SELECT 
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to insert their own profile (or admin)
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IN (
    SELECT id::text FROM auth.users WHERE is_super_admin = true
  ));
```

### 5.2. Policies para Guardians

**20250505_fix_guardians_rls.sql**

```sql
-- Fix RLS policies for guardians table
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage their guardians" ON public.guardians;
DROP POLICY IF EXISTS "Estudantes podem gerenciar seus responsáveis" ON public.guardians;

-- Create policy to allow students to view their own guardians
CREATE POLICY "Students can view their own guardians" 
ON public.guardians
FOR SELECT 
USING (auth.uid() = student_id);

-- Create policy to allow students to insert guardians for themselves
CREATE POLICY "Students can add their own guardians" 
ON public.guardians
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Create policy to allow students to update their own guardians
CREATE POLICY "Students can update their own guardians" 
ON public.guardians
FOR UPDATE 
USING (auth.uid() = student_id);

-- Create policy to allow students to delete their own guardians
CREATE POLICY "Students can delete their own guardians" 
ON public.guardians
FOR DELETE 
USING (auth.uid() = student_id);
```

## 6. Migrações de Funções RPC

### 6.1. Validação de Dados

```sql
-- Criação de função para validar formato de email
CREATE OR REPLACE FUNCTION public.is_valid_email(email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar formato básico do email
  RETURN email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
END;
$$;

-- Criação de função para validar formato de telefone
CREATE OR REPLACE FUNCTION public.is_valid_phone(phone_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  -- Se o número for nulo, consideramos válido
  IF phone_number IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar formatos
  RETURN 
    phone_number ~ '^(\+55|0055|55)?[ -]?(\(?\d{2}\)?[ -]?)?9?\d{4}[ -]?\d{4}$' OR
    phone_number ~ '^(\+44|0044|44)?[ -]?(0)?(\(?\d{2,5}\)?[ -]?)?\d{4}[ -]?\d{4}$' OR
    phone_number ~ '^(\+1|001|1)?[ -]?(\(?\d{3}\)?[ -]?)?\d{3}[ -]?\d{4}$' OR
    phone_number ~ '^(\+351|00351|351)?[ -]?(\(?\d{2,3}\)?[ -]?)?\d{3}[ -]?\d{3,4}$';
END;
$$;
```

### 6.2. Funções para Guardians

**20250505_fix_guardians_permissions.sql** (continuação)

```sql
-- Criação de função com SECURITY DEFINER para buscar guardians do estudante
CREATE OR REPLACE FUNCTION public.get_student_guardians_secure(p_student_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  student_id UUID,
  email TEXT,
  full_name TEXT,
  phone VARCHAR(20),
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_student_id UUID;
BEGIN
  -- Se nenhum ID for fornecido, usa o ID do usuário atual
  IF p_student_id IS NULL THEN
    v_student_id := auth.uid();
  ELSE
    -- Verifica se o usuário atual tem permissão para ver os guardians do estudante fornecido
    IF p_student_id = auth.uid() THEN
      v_student_id := p_student_id;
    ELSE
      RAISE EXCEPTION 'Permissão negada';
    END IF;
  END IF;

  -- Retorna os guardians do estudante
  RETURN QUERY
  SELECT 
    g.id,
    g.student_id,
    g.email,
    g.full_name,
    g.phone,
    g.is_active,
    g.created_at
  FROM 
    public.guardians g
  WHERE 
    g.student_id = v_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 7. Aplicando Migrações Manualmente

Para aplicar estas migrações manualmente no Supabase, siga os passos abaixo:

### 7.1. Acesso ao SQL Editor

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Navegue até "SQL Editor"
4. Clique em "+ New Query"

### 7.2. Verificação de Tabelas Existentes

Execute o seguinte comando para listar as tabelas existentes:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 7.3. Verificação de Funções Existentes

Execute o seguinte comando para verificar as funções RPC existentes:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

### 7.4. Execução das Migrações

1. Copie o conteúdo de cada arquivo de migração na ordem correta
2. Cole no editor SQL
3. Execute a migração
4. Verifique a saída para garantir que não houve erros
5. Documente a execução bem-sucedida

### 7.5. Verificação de Políticas RLS

Execute o seguinte comando para verificar as políticas RLS existentes:

```sql
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 7.6. Verificação de Permissões de Função

Execute o seguinte comando para verificar as permissões das funções:

```sql
SELECT 
  routine_name,
  grantee,
  privilege_type
FROM 
  information_schema.routine_privileges
WHERE 
  routine_schema = 'public' AND
  grantee = 'authenticated'
ORDER BY 
  routine_name, privilege_type;
```

### 7.7. Testes Pós-Migração

Após aplicar todas as migrações, teste o sistema com os seguintes cenários:

1. Login como estudante
2. Visualização de responsáveis
3. Adição de novo responsável
4. Remoção de responsável
5. Compartilhamento de localização

Se algum teste falhar, verifique os logs de erro e a configuração das políticas RLS.
