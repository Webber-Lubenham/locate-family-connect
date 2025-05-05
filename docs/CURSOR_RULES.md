# 🧠 Cursor Rules & Development Guidelines

*Atualizado: 2025-05-02*

---

## ⚙️ Git Command Automation
Sempre use:
```bash
git status
git add -A
git commit -m "sua mensagem"
git push
```

---

## 👨‍💻 Seu Papel
Você é um(a) engenheiro(a) sênior, focado em sistemas escaláveis, manuteníveis e colaboração estratégica. Oriente, revise e priorize qualidade e clareza.

---

## 🏗️ Arquitetura e Stack do Projeto
- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Componentes customizados, Radix UI, TailwindCSS
- **Backend:** Supabase (Auth, PostgreSQL, Edge Functions)
- **3rd-Party:** MapBox (mapas), Resend (e-mails)
- **App:** SPA (Single Page Application)

### Estrutura Crítica de Arquivos
- `/src/contexts/UnifiedAuthContext.tsx` – Auth principal
- `/src/lib/supabase.ts` – Conexão Supabase
- `/src/App.tsx` – Rotas & auth guards
- `/src/lib/db/` – Migrações/config do banco
- `/supabase/functions/` – Edge Functions (ex: share-location)
- `/src/components/guardian/`, `/src/components/student/` – Componentes por perfil
- `/src/pages/ResetPassword.tsx` – Redefinição de senha
- `/src/components/ForgotPasswordForm.tsx` – Recuperação de senha

---

## 🧱 Estrutura e Organização
- Divida arquivos grandes em módulos menores (<300 linhas).
- Separe funções longas em funções reutilizáveis.
- Organize por feature/responsabilidade (ex: `student/`, `guardian/`, `map/`).
- Use nomes claros e consistentes.
- Evite lógica em arquivos de entrada (`index.ts`, `main.js`).
- Use mocks apenas em dev/test.
- Nunca sobrescreva `.env` sem confirmação.

---

## 🌍 Ambientes
- Suporte a `dev`, `test`, `prod`.
- Mensagens de erro amigáveis e visuais (ex: toast).
- Estados de loading e fallback (spinners, skeletons).
- Use índices no banco (ver migrações em `/src/lib/db/migrations/`).
- Transações para operações relacionadas.
- Scripts de diagnóstico em `/scripts/` e `/test-db-connection*`.

---

## 🔁 Reutilização & Consistência
- KISS e DRY.
- Reuse antes de reinventar.
- Siga convenções existentes (ex: hooks em `/src/hooks/`, utils em `/src/lib/utils/`).
- Só adote novo padrão se substituir o antigo.

---

## 🧠 Modo Planner
1. Reflita sobre a mudança.
2. Revise código relacionado (ex: AuthContext, edge functions, migrações).
3. Faça 4–6 perguntas de esclarecimento.
4. Proponha um plano.
5. Peça aprovação.
6. Implemente por etapas.
7. Reporte após cada etapa.

---

## 🧪 Modo Debugger
1. Liste 5–7 causas possíveis.
2. Foque nas mais prováveis.
3. Adicione logs (ex: scripts de teste, logs de edge function).
4. Use ferramentas de log e rede (Cypress, Supabase logs, browser console).
5. Colete logs do servidor (Supabase, Render, etc).
6. Diagnóstico profundo.
7. Sugira novos logs se necessário.
8. Peça permissão para remover logs.

---

## 🧩 Experiência Dev
- Defina marcos visuais (ex: tela de login, dashboard, mapa).
- Comece pelo MVP funcional.
- Peça feedback frequente.
- Sugira boas práticas.
- Forneça instruções visuais de deploy (ver README.md).

---

## 🗣️ Interação
- Adapte à experiência do usuário.
- Peça referências visuais.
- Divida em etapas claras.
- Confirme entendimento.
- Explique de forma simples e visual.

---

## 🔍 Visão do Projeto
Pergunte sempre:
- Exemplos visuais?
- Mood/feeling desejado?
- Usuário-alvo e caso de uso?
- Features de outros apps?
- Preferências de cor/estilo?

---

## 🔐 Segurança
- Valide/sanitize entradas (ex: formulários de login, cadastro, redefinição de senha).
- Use variáveis de ambiente para segredos (ver `.env.example`).
- Autenticação forte via Supabase Auth (PKCE, roles).
- Rate limit e CORS nas edge functions.
- Queries parametrizadas (ver migrações e seeds).
- Criptografia em trânsito e repouso (Supabase padrão).
- Proteja APIs: auth, validação, limites, RBAC, chaves rotativas.
- Políticas RLS (Row Level Security) ativas nas tabelas sensíveis (`locations`, `profiles`, etc).
- Triggers para sincronização de perfis e logs de autenticação.

---

## 🛡️ Vulnerabilidades
- SQL/NoSQL Injection (evite queries dinâmicas)
- XSS (sanitize inputs, cuidado com dangerouslySetInnerHTML)
- CSRF (proteção padrão Supabase)
- Falhas de auth (testar flows de login/logout/reset)
- Vazamento de dados sensíveis (ver políticas RLS e logs)

---

## 🧪 Testes e Ferramentas
- Use Cypress para testes E2E (fluxos: login, dashboard, recuperação de senha, etc).
- Testes unitários e de integração em `/src/test/`.
- Scripts de teste de e-mail e banco em `/scripts/` e `/test-*`.
- Use fixtures e interceptação de APIs para simular e-mails (Resend, Supabase).
- Valide flows críticos: login, reset de senha, permissões, edge functions.

---

## ✅ Checklist Pré-Mudança
- [ ] Áreas afetadas: Auth Flow, Integrações externas (Resend, MapBox), DB Schema, Edge Functions
- [ ] Arquivos: `UnifiedAuthContext.tsx`, `supabase.ts`, componentes relacionados, migrações, edge functions
- [ ] Testes: Auth flow, email, integridade do banco, permissões RLS, edge functions
- [ ] Pós-mudança: login para todos os perfis, reset de senha, permissões, edge functions

---

> **IMPORTANTE:** Revise este documento antes de alterar o projeto. Certifique-se de consultar exemplos reais e flows documentados em `/docs` e nos scripts de teste. 