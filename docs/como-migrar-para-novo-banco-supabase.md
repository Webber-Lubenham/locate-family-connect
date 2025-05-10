# Como Migrar o Projeto para um Novo Banco Supabase Usando o `.env`

## 1. O que o código do projeto faz

- Todas as conexões com Supabase (frontend, scripts, edge functions) dependem **exclusivamente** das variáveis de ambiente definidas no `.env`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SUPABASE_SERVICE_KEY` (ou `SUPABASE_SERVICE_ROLE_KEY` em scripts)
- Não há valores hardcoded para URLs ou chaves de banco.
- O Docker Compose e scripts também usam essas variáveis.

## 2. O que acontece ao trocar as credenciais do `.env`

- O aplicativo automaticamente passa a apontar para o novo banco Supabase.
- Todos os scripts, testes e edge functions também passam a operar sobre o novo banco.

## 3. O que NÃO acontece automaticamente

- O projeto **NÃO** faz migração automática da estrutura do banco ao trocar o `.env`.
- O novo banco **precisa já ter** as tabelas, funções, policies (RLS) e dados essenciais criados.
- Existem scripts de migração e seed no projeto (`run-migration.mjs`, `apply-migration.js`, etc.) que devem ser executados manualmente para preparar o novo banco.

## 4. Passos para migrar corretamente

1. **Crie o novo projeto Supabase** e obtenha as novas credenciais.
2. **Rode os scripts de migração** do projeto para criar toda a estrutura necessária no novo banco.
3. **Rode os scripts de seed** para popular dados essenciais (usuários, perfis, etc.).
4. **Atualize o `.env`** com as novas credenciais:
   ```env
   VITE_SUPABASE_URL=https://novo-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   VITE_SUPABASE_SERVICE_KEY=...
   ```
5. **Reinicie o app/servidor** para carregar as novas variáveis.
6. **Teste as principais rotas e funcionalidades**.

## 5. Resumo objetivo

> Trocar as credenciais do `.env` faz o app apontar para outro banco, mas o funcionamento depende da estrutura e dados do novo banco estarem corretos. O projeto não faz migração automática ao trocar o `.env`.

---

**Este documento foi gerado automaticamente a partir da análise do código-fonte do projeto.** 