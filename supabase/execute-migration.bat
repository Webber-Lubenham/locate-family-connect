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
