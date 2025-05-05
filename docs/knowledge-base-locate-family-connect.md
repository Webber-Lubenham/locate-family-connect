# Banco de Conhecimento: Locate-Family-Connect

**Atualizado:** 2025-05-13

---

## 🎯 Visão Geral do Projeto
O Locate-Family-Connect é um sistema de rastreamento e compartilhamento de localização que conecta estudantes e responsáveis (guardians), permitindo visualização em tempo real, notificações seguras e gestão de perfis. O objetivo é garantir segurança, transparência e comunicação eficiente entre famílias e instituições.

---

## 🏗️ Arquitetura e Tecnologias
- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Componentes customizados, Radix UI, TailwindCSS
- **Backend:** Supabase (Auth PKCE, PostgreSQL, Edge Functions)
- **Mapas:** MapBox (visualização e compartilhamento de localização)
- **Emails:** Resend API (domínio: sistema-monitore.com.br)
- **SPA:** Fluxo de autenticação por perfil (estudante/guardião)

---

## 👤 Perfis de Usuário
- **Estudante:** Compartilha localização, gerencia responsáveis, visualiza mapa
- **Responsável (Guardian):** Visualiza localização dos estudantes vinculados no seu proprio mapa, recebe notificações, gerencia vínculos

---

## 🌐 Rotas Principais
- `/login` — Autenticação de usuário
- `/student-dashboard` — Painel do estudante
- `/parent-dashboard` — Painel do responsável
- `/password-recovery` — Recuperação de senha
- `/location-history` — Histórico de localizações
- `/add-guardian` — Adicionar responsável
- `/add-student` — Adicionar estudante

---

## 🗺️ Integração com Mapas
- **MapBox:**
  - Visualização de localização em tempo real
  - Compartilhamento de localização por email
  - Token configurado em variáveis de ambiente

---

## 🔐 Autenticação e Segurança
- **Supabase Auth:** PKCE, JWT, RLS (Row Level Security)
- **RLS Policies:**
  - `guardians`: Estudante só vê seus responsáveis
  - `locations`: Acesso restrito por perfil
  - `profiles`: Sincronização via trigger `handle_new_user()`
- **Edge Functions:**
  - `share-location`: Compartilhamento seguro de localização
  - JWT validation e rate limiting

---

## 🗄️ Banco de Dados
- **Tabelas principais:**
  - `users`: Usuários autenticados
  - `profiles`: Dados de perfil (nome, email, tipo)
  - `guardians`: Relacionamento estudante-responsável
  - `locations`: Histórico de localizações
- **Views e Funções:**
  - `get_guardian_students()`: Retorna estudantes vinculados ao responsável autenticado
  - Triggers para sincronização de perfis
- **Migrations:**
  - Versionadas em `/src/lib/db/migrations/`

---

## 📧 Integração com Email
- **Resend API:**
  - Envio de notificações e compartilhamento de localização
  - Domínio verificado: `sistema-monitore.com.br`
  - Chave em variável de ambiente (ver `/docs/configuracao-resend.md`)

---

## 🧪 Testes e Diagnóstico
- Scripts em `/scripts/`:
  - `test-resend.mjs`, `test-email.mjs`, `conexao-supabase.mjs`
- Testes de fluxo crítico: autenticação, recuperação de senha, compartilhamento de localização
- Validação de RLS e triggers

---

## 📚 Documentação e Boas Práticas
- **Documentos úteis:**
  - `/docs/configuracao-resend.md` — Configuração de email
  - `/docs/edge-functions.md` — Edge Functions
  - `/docs/rls-student-guardians-policy.md` — Políticas RLS
  - `/docs/bug-relato-dashboard-pai.md` — Relatos de bugs
- **Padrão de commit:**
  - Sempre use mensagens claras e o tipo `[type: fix/feature/docs]`
- **Segurança:**
  - Nunca exponha chaves ou segredos no código
  - Use variáveis de ambiente para tokens e APIs

---

## 📝 Checklist de Integração
- [ ] PKCE Auth testado (login, registro, recuperação)
- [ ] Edge Function `share-location` funcional
- [ ] Resend API key configurada e domínio verificado
- [ ] Triggers e RLS aplicados corretamente
- [ ] Scripts de diagnóstico executados

---

## 🔗 Links Úteis
- [Supabase Docs](https://supabase.com/docs)
- [MapBox Docs](https://docs.mapbox.com/)
- [Resend Docs](https://resend.com/docs)

---

## 👥 Personas
- **Estudante:** Jovem ou criança que compartilha sua localização com responsáveis.
- **Responsável (Guardian):** Pai, mãe ou tutor que acompanha a localização dos estudantes sob sua responsabilidade.
- **Administrador:** (Futuro) Usuário com permissões para gerenciar perfis, relacionamentos e auditoria.

---

## 📝 Especificações de Features
- **Autenticação PKCE (Supabase Auth)**
- **Dashboard por perfil (estudante/guardião)**
- **Compartilhamento de localização em tempo real (MapBox)**
- **Histórico de localizações**
- **Gestão de responsáveis e estudantes vinculados**
- **Notificações por email (Resend API)**
- **Recuperação de senha**
- **Políticas de segurança (RLS, JWT, Edge Functions)**

### User Stories & Critérios de Aceite
- Como estudante, quero adicionar responsáveis para compartilhar minha localização.
- Como responsável, quero visualizar no mapa a localização dos meus estudantes vinculados.
- Como usuário, quero recuperar minha senha de forma segura.

---

## 🎨 Ativos de Design
- **Paleta:** TailwindCSS padrão + customizações do projeto
- **Componentes:** Radix UI, componentes customizados em `/src/components/`
- **Logo:** Disponível em `/public/`
- **Wireframes:** (Adicionar link se disponível)

---

## 📚 Documentação de API
- **Autenticação:** Supabase PKCE, JWT
- **Endpoints principais:**
  - `/rest/v1/guardians` — CRUD de responsáveis
  - `/rest/v1/locations` — CRUD de localizações
  - `/rest/v1/rpc/get_guardian_students` — RPC para estudantes vinculados
  - `/rest/v1/profiles` — Perfis de usuário
- **Exemplo de chamada RPC:**
  ```js
  supabase.rpc('get_guardian_students')
  ```
- **Autorização:** JWT no header, RLS no banco

---

## 🗄️ Esquema do Banco de Dados
- **Tabelas:**
  - `users`, `profiles`, `guardians`, `locations`
- **Funções:**
  - `get_guardian_students()`
- **Triggers:**
  - `handle_new_user()`
- **ER Diagram:** (Adicionar imagem/link se disponível)
- **Migrations:** Versionadas em `/src/lib/db/migrations/`

---

## ⚙️ Setup de Ambiente
- **Pré-requisitos:** Node.js, pnpm/npm, Supabase CLI
- **Variáveis de ambiente:**
  - `.env` com chaves do Supabase, Resend, MapBox
- **Instalação:**
  ```sh
  pnpm install
  pnpm dev
  # ou
  npm install
  npm run dev
  ```
- **Supabase local:**
  ```sh
  supabase start
  supabase db reset
  supabase db push
  ```

---

## 🧪 Guidelines de Teste
- **Testes unitários:** Jest
- **Testes end-to-end:** Cypress (`/cypress/`)
- **Cobertura:** Priorizar fluxos críticos (auth, location sharing, recovery)
- **Scripts de diagnóstico:** `/scripts/test-resend.mjs`, `/scripts/test-email.mjs`, `/scripts/conexao-supabase.mjs`

---

## 🚀 Instruções de Deploy
- **Ambientes:** Local, staging, produção
- **Deploy frontend:** Vercel, Netlify ou similar
- **Deploy backend:** Supabase (CLI ou painel)
- **Checklist:**
  - [ ] Migrations aplicadas
  - [ ] Variáveis de ambiente corretas
  - [ ] Testes executados

---

## 🔀 Práticas de Versionamento
- **Branch principal:** `main`
- **Branches de feature/fix:** `feature/<nome>`, `fix/<nome>`
- **Commits:**
  - Mensagens claras, padrão: `fix: <descrição> [type: fix]`
  - Sempre use `git status`, `git add -A`, `git commit -m`, `git push`
- **Pull Requests:** Revisão obrigatória para produção

---

## 🔐 Segurança
- **Nunca exponha chaves ou segredos no código**
- **Use variáveis de ambiente**
- **RLS em todas as tabelas sensíveis**
- **Edge Functions:** JWT validation, rate limiting
- **Auditoria:** Tabela `auth_logs`

---

## ⚖️ Compliance
- **LGPD/GDPR:** Dados pessoais protegidos, consentimento explícito para compartilhamento
- **Auditoria:** Logs de acesso e ações críticas
- **Emails:** Apenas domínio verificado

---

## 🏆 Melhores Práticas de Manutenção
- **Documentação sempre atualizada**
- **Automatize scripts de diagnóstico**
- **Checklist de integração para cada release**
- **Revisão de código obrigatória**
- **Atribuição de responsáveis por seção do projeto**

---

**Arquivo gerado automaticamente via instrução GPT-4.1** 