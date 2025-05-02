# 📘 Guia Técnico Essencial - Locate Family Connect

**Data de criação:** 02/05/2025  
**Última atualização:** 02/05/2025

> **IMPORTANTE:** Este documento deve ser consultado antes de realizar qualquer modificação no projeto.

## 📑 Índice

1. [Arquitetura Geral](#arquitetura-geral)
2. [Componentes Críticos](#componentes-críticos)
3. [Fluxos de Autenticação](#fluxos-de-autenticação)
4. [Integração com Serviços Externos](#integração-com-serviços-externos)
5. [Banco de Dados](#banco-de-dados)
6. [Diagnóstico de Problemas Comuns](#diagnóstico-de-problemas-comuns)
7. [Checklist Pré-Modificação](#checklist-pré-modificação)

---

## 🏗️ Arquitetura Geral

### Stack Tecnológica
- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Componentes personalizados + Radix UI + TailwindCSS
- **Backend:** Supabase (autenticação, banco PostgreSQL, Edge Functions)
- **Serviços de Terceiros:** MapBox (mapas), Resend (emails)
- **Formato de Projeto:** SPA (Single Page Application)

### Estrutura de Arquivos Crítica
- `/src/contexts/UnifiedAuthContext.tsx` - **Principal contexto de autenticação**
- `/src/lib/supabase.ts` - Configuração de conexão com Supabase
- `/src/App.tsx` - Definição de rotas e guardas de autenticação
- `/src/lib/db/` - Migrações e configurações de banco de dados
- `/supabase/functions/` - Edge Functions serverless

---

## 🧩 Componentes Críticos

### Autenticação
- `UnifiedAuthContext` gerencia todo o estado de autenticação
- Sistema baseado em fluxo PKCE do Supabase Auth
- Integração direta com tabela `profiles` para metadados adicionais do usuário
- Diferentes níveis de acesso: estudante, responsável, desenvolvedor

### Recuperação de Senha
- Utiliza método `resetPasswordForEmail` do Supabase Auth
- Emails enviados pelo Resend via integração SMTP com Supabase
- Fluxo com redirecionamento para `/reset-password`

### Compartilhamento de Localização
- Edge Function `share-location` envia emails via API do Resend
- Tabela `locations` armazena histórico de localizações
- Políticas RLS protegem dados sensíveis
- Integração com MapBox para visualização

---

## 🔄 Fluxos de Autenticação

### Login
1. Formulário de login envia credenciais para Supabase Auth
2. `UnifiedAuthContext` recebe e armazena sessão/token
3. Perfil do usuário é carregado da tabela `profiles`
4. Redirecionamento baseado no tipo de usuário

### Recuperação de Senha
1. Usuário solicita recuperação através do formulário
2. Supabase Auth gera token único e envia email via Resend
3. Email contém link para página de redefinição com token na URL
4. Usuário define nova senha que é validada e atualizada

### Registro
1. Dados básicos capturados no formulário de registro
2. Conta criada via Supabase Auth
3. Trigger do Postgres cria automaticamente registro na tabela `profiles`
4. Email de confirmação enviado se necessário

---

## 🌐 Integração com Serviços Externos

### Resend (Emails)
- **API Keys:**
  - Principal: `re_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu`
  - Edge Function: `re_eABGXYtU_5dDqRgs47KYx4yhsvSGSmctx`
  - Scripts: `re_YjGYsdCT_LedLKDERsm4t8GBq9pPwZKiJ`
  - Testes: `re_P8whBAgb_QDkLcB9DHzGfBy4JiBTw5f29`
- **Domínio:** `sistema-monitore.com.br` (status verificação inconsistente)
- **Email padrão:** `notificacoes@sistema-monitore.com.br`
- **Implementações:**
  - API REST direta (Edge Functions)
  - SMTP para Supabase Auth

### Supabase
- URL: `https://rsvjnndhbyyxktbczlnk.supabase.co`
- Chave anônima (pública): presente em `supabase.ts`
- Funções Edge: `share-location` (principal)

### MapBox
- API configurada via variáveis de ambiente
- Componentes em `/src/components/map/`

---

## 🗃️ Banco de Dados

### Tabelas Principais
- `auth.users` - Gerenciada pelo Supabase Auth
- `public.profiles` - Perfis estendidos dos usuários
- `public.guardians` - Relações entre estudantes e responsáveis
- `public.locations` - Histórico de localizações
- `public.auth_logs` - Logs de diagnóstico

### Políticas de Segurança (RLS)
- Usuários só acessam seus próprios dados
- Responsáveis só veem localizações compartilhadas explicitamente
- Políticas diferentes por tipo de usuário

### Pontos de Atenção
- Migrações devem seguir convenção de nomenclatura
- Triggers automatizados para sincronização de tabelas
- Campos críticos: `user_type`, `reset_token`, `reset_token_expires`

---

## 🔍 Diagnóstico de Problemas Comuns

### Autenticação
- **Problema:** Login não redireciona corretamente
  - **Verificar:** `App.tsx` (componente `RequireAuth`)
  - **Solução:** Garantir que tipo de usuário é verificado corretamente

- **Problema:** Recuperação de senha não envia email
  - **Verificar:** 
    1. Status do Resend
    2. Chave API correta
    3. Configuração SMTP no Supabase
    4. Verificação de domínio
  - **Solução:** Executar scripts de teste em `/scripts`

### Serviços Externos
- **Problema:** Emails não são entregues
  - **Verificar:** 
    1. Logs no Supabase (`share-location` function)
    2. Testar domínio e API Key com scripts
    3. Verificar pasta de spam
  - **Solução:** Ver `/docs/configuracao-resend.md`

- **Problema:** Mapas não carregam
  - **Verificar:** API key do MapBox em variáveis de ambiente
  - **Solução:** Regenerar chave ou verificar limites de quota

### Banco de Dados
- **Problema:** Erro em trigger ou constraint
  - **Verificar:** Logs SQL no painel do Supabase
  - **Solução:** Rodar querys de diagnóstico via console SQL

---

## ✅ Checklist Pré-Modificação

Antes de realizar qualquer alteração no projeto, verifique:

1. **Componentes afetados:**
   - [ ] Fluxo de autenticação?
   - [ ] Integrações com serviços externos?
   - [ ] Esquema do banco de dados?
   - [ ] Edge Functions?

2. **Arquivos a examinar:**
   - [ ] `UnifiedAuthContext.tsx`
   - [ ] `supabase.ts`
   - [ ] Componentes relacionados à funcionalidade
   - [ ] Migrações SQL se aplicável

3. **Testes necessários:**
   - [ ] Fluxo de autenticação
   - [ ] Envio de email (script de teste)
   - [ ] Integridade do banco de dados
   - [ ] Permissões de acesso (RLS)

4. **Verificações pós-modificação:**
   - [ ] Login funciona para todos os tipos de usuários
   - [ ] Recuperação de senha envia emails
   - [ ] Permissões respeitam o tipo de usuário
   - [ ] Edge Functions operam normalmente

---

## 🛠️ Recursos Adicionais

- **Dashboard Supabase:** https://app.supabase.com/project/rsvjnndhbyyxktbczlnk
- **Dashboard Resend:** https://resend.com/dashboard
- **Documentação Resend:** `/docs/RESEND.md` e `/docs/configuracao-resend.md`
- **Scripts de diagnóstico:** `/scripts/test-resend-connection-with-log.js`

---

> **Nota:** Este guia deve ser atualizado regularmente conforme o projeto evolui. Se encontrar informações desatualizadas, por favor atualize o documento.
