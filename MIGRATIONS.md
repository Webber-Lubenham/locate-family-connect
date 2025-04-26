# Instruções para Migrações no Locate Family Connect

Este documento contém instruções para aplicar migrações ao banco de dados Supabase do projeto Locate Family Connect.

## Migração 1: Correção das Relações entre Responsáveis e Estudantes

**Arquivo:** `supabase/migrations/20250426_fix_guardian_relationships.sql`

**Objetivo:** Assegurar que a tabela `guardians` tenha a estrutura correta e que as relações entre responsáveis e estudantes estejam configuradas adequadamente.

**Instruções para aplicação manual:**
1. Acesse o [Dashboard do Supabase](https://app.supabase.io/)
2. Selecione seu projeto
3. Navegue até "SQL Editor"
4. Crie um novo script SQL
5. Copie e cole o conteúdo do arquivo `20250426_fix_guardian_relationships.sql`
6. Execute o script

## Migração 2: Adição de Funções para Gerenciamento de Responsáveis

**Arquivo:** `supabase/migrations/20250427_add_guardian_functions.sql`

**Objetivo:** Adicionar funções SQL no banco de dados para facilitar a gestão das relações entre responsáveis e estudantes.

**Funções adicionadas:**
1. `get_guardian_students` - Retorna todos os estudantes associados a um responsável
2. `check_guardian_relationship` - Verifica se existe uma relação entre responsável e estudante
3. `add_guardian_relationship` - Adiciona um relacionamento entre responsável e estudante

**Instruções para aplicação manual:**
1. Acesse o [Dashboard do Supabase](https://app.supabase.io/)
2. Selecione seu projeto
3. Navegue até "SQL Editor"
4. Crie um novo script SQL
5. Copie e cole o conteúdo do arquivo `20250427_add_guardian_functions.sql`
6. Execute o script

## Por que estamos fazendo isso manualmente?

As migrações estão sendo aplicadas manualmente devido a limitações técnicas:

1. **Problemas com o Supabase MCP Server:** Ao tentar executar o servidor MCP usando o comando `npx @supabase/mcp-server-supabase`, encontramos erros de resolução de módulos ES que impedem a execução adequada.

2. **Dependências incompatíveis:** A execução das migrações via linha de comando encontra problemas de dependências e compatibilidade entre módulos.

3. **Ambiente de desenvolvimento:** Configurações específicas do ambiente podem estar impedindo a execução automática das migrações.

## Efeitos dessas migrações

Estas migrações são essenciais para o funcionamento das seguintes funcionalidades:

1. **Visualização de estudantes no painel do responsável**
2. **Adição de responsáveis por estudantes**
3. **Adição de estudantes por responsáveis**
4. **Verificação e diagnóstico de relações**

Com essas migrações aplicadas corretamente, o fluxo bidirecional de relacionamentos entre responsáveis e estudantes funcionará adequadamente, permitindo:
- Estudantes adicionarem seus responsáveis
- Responsáveis adicionarem seus estudantes
- Visualização correta de relações em ambos os dashboards
