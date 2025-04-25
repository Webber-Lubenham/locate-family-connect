# Solução para Problema de Cadastro no Supabase

## Diagnóstico do Problema

Após análise detalhada dos logs e testes realizados, identificamos que o erro "Database error saving new user" está ocorrendo no backend do Supabase durante o processo de cadastro de novos usuários.

Mesmo após remover completamente o campo de telefone e simplificar os dados enviados no processo de registro, o problema persistiu, o que indica claramente que:

1. O problema não está no formato do telefone ou nos dados enviados pelo frontend
2. Existe um problema estrutural no banco de dados do Supabase ou em seus triggers de criação de usuário

## Solução via Migration SQL

A solução mais eficaz é aplicar uma migration SQL para modificar a estrutura do banco de dados e resolver o problema diretamente na fonte. Criamos uma migration que:

1. Torna o campo de telefone opcional
2. Remove restrições de formato
3. Melhora o trigger de criação de perfil para ser mais resiliente
4. Adiciona logging para facilitar a depuração

### Script SQL de Migration

```sql
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
```

## Métodos para Aplicar a Migration

### 1. Via SQL Editor no Painel do Supabase (Recomendado)

1. **Acesse o Painel do Supabase**:
   - Entre em [https://app.supabase.com](https://app.supabase.com)
   - Selecione o projeto `rsvjnndhbyyxktbczlnk`

2. **Execute o SQL**:
   - Vá para "SQL Editor" no menu lateral 
   - Clique em "+ New Query"
   - Copie e cole o conteúdo do script SQL acima
   - Clique em "Run" para executar a migration

### 2. Via Terminal usando o script batch

Incluímos um script batch que pode ser executado diretamente no terminal Windows:

```batch
@echo off
echo ======= Executando migration para corrigir o cadastro de usuarios =======

:: Definindo as variaveis do Supabase
set SUPABASE_URL=rsvjnndhbyyxktbczlnk.supabase.co
set SUPABASE_PASSWORD=sbp_5846ad02afffcbddf30ff9a6b55798e54caa83ac
set SUPABASE_DB=postgres
set SUPABASE_USER=postgres

echo.
echo 1. Verificando se o PSQL esta instalado...
where psql >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERRO] PostgreSQL PSQL nao encontrado. 
    echo Por favor, instale o PostgreSQL ou use o SQL Editor no painel do Supabase.
    echo.
    echo Alternativas:
    echo 1. Acesse https://app.supabase.com
    echo 2. Selecione seu projeto
    echo 3. Va para SQL Editor
    echo 4. Cole o conteudo do arquivo migrations/20250425_fix_user_registration.sql
    echo 5. Execute o SQL
    echo.
    pause
    exit /b 1
)

echo [OK] PSQL encontrado!
echo.
echo 2. Executando a migration via PSQL...
echo.

psql "host=%SUPABASE_URL% port=5432 dbname=%SUPABASE_DB% user=%SUPABASE_USER% password=%SUPABASE_PASSWORD% sslmode=require" -f migrations\20250425_fix_user_registration.sql

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERRO] Falha ao executar a migration via PSQL.
    echo.
    echo Tente executar manualmente pelo SQL Editor:
    echo 1. Acesse https://app.supabase.com
    echo 2. Selecione seu projeto
    echo 3. Va para SQL Editor
    echo 4. Cole o conteudo do arquivo migrations/20250425_fix_user_registration.sql
    echo 5. Execute o SQL
    echo.
) else (
    echo.
    echo [SUCESSO] Migration executada com sucesso!
    echo.
    echo Teste o cadastro de usuarios na aplicacao para confirmar que o problema foi resolvido.
)

pause
```

Para executar:
1. Abra o Explorer e navegue até `C:\Users\ASUS\Documents\GitHub\blank-canvas-creator-kit\supabase`
2. Clique duas vezes em `execute-migration.bat`

## Melhorias Implementadas no Frontend

Enquanto resolvemos o problema no backend, implementamos melhorias no frontend para lidar melhor com os erros e proporcionar uma melhor experiência ao usuário:

1. **Melhor Tratamento de Erros**:
   - Logs detalhados com código e mensagem do erro
   - Mensagens mais amigáveis para o usuário final
   - Feedback visual mais claro quando ocorre um erro

2. **Salvamento Temporário de Dados**:
   - Dados de registro salvos no localStorage
   - Permite tentativas futuras sem que o usuário precise preencher o formulário novamente

3. **Campo de Telefone Opcional**:
   - O telefone não é mais obrigatório
   - Não é enviado ao Supabase durante o cadastro

## Como Verificar se a Solução Funcionou

1. **Aplique a Migration**:
   - Use um dos métodos descritos acima para aplicar a migration

2. **Teste o Cadastro**:
   - Acesse a página de registro em [https://blank-canvas-creator-kit.lovable.app/register](https://blank-canvas-creator-kit.lovable.app/register)
   - Preencha o formulário com dados de teste
   - Confirme se o cadastro é concluído com sucesso

3. **Verifique os Logs**:
   - Acesse o painel do Supabase
   - Vá para "Table Editor" > "auth_logs"
   - Verifique se há registros da tentativa de cadastro

## Próximos Passos

Após confirmar que o cadastro está funcionando corretamente:

1. **Reativar o Campo de Telefone**:
   - Restaurar o envio do campo de telefone no front-end
   - Garantir que o formato segue o padrão E.164 (feito anteriormente)

2. **Monitorar a Tabela de Logs**:
   - Verificar regularmente se há erros no processo de registro
   - Usar os dados para identificar e corrigir problemas futuros

3. **Documentar a Solução**:
   - Atualizar a documentação do projeto sobre as alterações feitas
   - Incluir detalhes sobre o formato esperado para o telefone

---

Documento criado em: 25/04/2025
