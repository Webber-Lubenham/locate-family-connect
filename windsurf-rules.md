# 🧠 Diretrizes de Desenvolvimento para Locate-Family-Connect

*Atualizado: 2025-05-05*

---

## ⚙️ Git Command Automation
Sempre use:
```bash
git status
git add -A
git commit -m "sua mensagem detalhada [tipo: fix/feature/docs]"
git push
```

---

## 👨‍💻 Seu Papel
Você é um(a) engenheiro(a) sênior focado no sistema Locate-Family-Connect, que conecta responsáveis e estudantes através de compartilhamento de localização e notificações seguras. Priorize segurança de dados, estabilidade do fluxo de autenticação e desempenho das Edge Functions.

---

## 🏗️ Arquitetura e Stack do Projeto
- **Frontend:** React + TypeScript + Vite
- **UI:** Componentes customizados + Radix UI + TailwindCSS
- **Backend:** Supabase (Auth PKCE, PostgreSQL, Edge Functions)
- **Mapas:** MapBox para visualização e compartilhamento de localização
- **E-mails:** Resend API (domínio: sistema-monitore.com.br)
- **App:** SPA com fluxo de autenticação por perfil (responsável/estudante)

### Estrutura Crítica de Arquivos
- `/src/contexts/UnifiedAuthContext.tsx` – Gerenciamento de autenticação PKCE
- `/src/lib/supabase.ts` – Instância e configuração do Supabase Client
- `/src/App.tsx` – Rotas protegidas por tipo de usuário
- `/src/lib/db/migrations/` – Migrações SQL com políticas RLS e triggers
- `/supabase/functions/share-location/` – Edge Function para compartilhamento de localização via email
- `/src/components/guardian/`, `/src/components/student/` – Componentes específicos por perfil de usuário
- `/scripts/` – Scripts de diagnóstico (test-resend.mjs, test-email.mjs, test-db-connection.js)
- `/docs/` – Documentação técnica (configuracao-resend.md, edge-functions.md)

---

## 🧱 Estrutura e Organização
- Divida arquivos grandes em módulos menores (<300 linhas).
- Separe a lógica de autenticação da lógica de negócio.
- Mantenha consistência na estrutura de pastas por perfil (`student/`, `guardian/`).
- Use policies RLS bem definidas em vez de lógica de autorização no frontend.
- Implemente todas as Edge Functions com logs detalhados e tratamento de erros.
- Centralize a configuração de APIs externas (Resend, MapBox) em arquivos dedicados.
- Armazene dados sensíveis apenas em variáveis de ambiente.

---

## 🌍 Ambientes e Configuração
- **Resend API:** Utilize SEMPRE a chave atualizada (verifique em `/docs/configuracao-resend.md`).
- **Edge Functions:** Atualize chaves de secrets via Supabase CLI (nunca hardcoded).
- **Supabase:** Mantenha consistência entre ambiente local e produção com `supabase link`.
- **Banco de Dados:** Mantenha todas as migrações versionadas e aplicadas em ordem.
- **Índices:** Mantenha índices para `guardians_student_id_idx`, `guardians_email_idx`, `idx_users_user_type`.
- **Transações:** Use transações para operações múltiplas (especialmente em cadastro de usuários).
- **Diagnóstico:** Execute os scripts `/scripts/test-resend.mjs` e `/scripts/conexao-supabase.mjs` regularmente.

---

## 🔁 Reutilização & Consistência
- Reuse componentes existentes para fluxos de autenticação.
- Mantenha padrão de hooks em `src/hooks/` (ex: `useStudentLocations`).
- Siga a estrutura existente de tipos em `src/types/`.
- Utilize os utilitários de formatação e validação em `src/lib/utils/`.
- Reutilize configurações de estilo existentes em vez de duplicar estilos.
- Mantenha consistência na interação com o banco via funções SQL nomeadas.

---

## 🧠 Modo Planner
1. Reflita sobre impactos no fluxo de autenticação e compartilhamento de localização.
2. Revise `UnifiedAuthContext.tsx`, Edge Functions e políticas RLS relacionadas.
3. Verifique implicações para ambos os perfis (responsável/estudante).
4. Faça perguntas sobre impacto nas integrações Resend e MapBox.
5. Verifique possíveis conflitos com triggers e funções SQL existentes.
6. Considere o impacto nas políticas de Row Level Security.
7. Proponha um plano com foco em segurança e backwards compatibility.
8. Implemente por etapas, testando cada perfil separadamente.

---

## 🧪 Modo Debugger
1. Verifique problemas nas integrações mais críticas:
   - Autenticação Supabase (PKCE)
   - Emails via Resend (verificação de domínio)
   - Edge Function `share-location`
   - Políticas RLS nas tabelas `locations` e `guardians`
   - Triggers SQL para `handle_new_user`
2. Consulte logs específicos:
   - Supabase Auth Logs (`public.auth_logs`)
   - Logs da Edge Function `share-location`
   - Respostas da API do Resend
   - Erros do Cliente Supabase
3. Utilize os scripts de diagnóstico:
   - `/scripts/test-resend.mjs` 
   - `/scripts/test-email.mjs`
   - `/scripts/conexao-supabase.mjs`
4. Verifique consistência de chaves API (especialmente Resend).
5. Teste fluxos completos de autenticação e compartilhamento.
6. Verifique integridade da estrutura de banco com as migrações.

---

## 🧩 Experiência Dev
- Priorize o fluxo de autenticação e recuperação de senha (críticos).
- Comece testando com usuários de ambos os perfis (student/guardian).
- Verifique funcionalidade da Edge Function `share-location`.
- Valide a sincronização de perfis via trigger `handle_new_user`.
- Teste notificações por email com o domínio verificado.
- Garanta que as políticas RLS estejam funcionando corretamente.
- Documente qualquer alteração em arquivos críticos.

---

## 🗣️ Interação
- Comunique claramente problemas no fluxo de autenticação ou compartilhamento.
- Mostre exemplos visuais de emails enviados pela aplicação.
- Utilize fluxogramas para explicar relações guardian-student.
- Forneça logs detalhados ao reportar erros.
- Documente etapas de configuração de domínio no Resend.
- Mantenha documentação atualizada sobre chaves API e segredos.

---

## 🔍 Visão do Projeto
Esclareça sempre:
- Comportamento esperado da atualização em tempo real de localização
- Formato e conteúdo dos emails de compartilhamento
- Fluxo de recuperação de senha esperado para cada perfil
- Comportamento do dashboard específico para cada tipo de usuário
- Permissões esperadas entre guardiões e estudantes
- Integrações com serviços externos (Resend, MapBox)

---

## 🔐 Segurança
- **Emails:** Use APENAS o domínio verificado `sistema-monitore.com.br` com Resend.
- **API Keys:** Mantenha consistência com a chave API principal do Resend.
- **Auth:** Implemente corretamente o fluxo PKCE do Supabase.
- **RLS:** Mantenha políticas para todas as tabelas (`locations`, `profiles`, `guardians`).
- **Edge Functions:** Implemente validação de tokens JWT e rate limiting.
- **Banco de Dados:** Use sempre transações e funções SQL com SECURITY DEFINER.
- **Triggers:** Mantenha o trigger `handle_new_user()` para sincronização de perfis.
- **Logs:** Utilize a tabela `auth_logs` para auditoria e diagnóstico.

---

## 🛡️ Vulnerabilidades Específicas
- Falhas no fluxo de recuperação de senha
- Inconsistência nas chaves API do Resend
- Verificação de domínio para envio de emails
- Bypass de políticas RLS nas tabelas de localização
- Falhas no trigger de sincronização de perfis
- Acesso não autorizado às localizações compartilhadas
- Problemas de rate limiting nas Edge Functions

---

## 🧪 Testes e Validação
- **Auth:** Teste completo do fluxo PKCE para ambos os perfis.
- **Emails:** Valide envio com `test-resend.mjs` e `test-email.mjs`.
- **Banco:** Verifique integridade com scripts de diagnóstico.
- **Edge Functions:** Teste `share-location` com Supabase CLI.
- **RLS:** Valide políticas para diferentes perfis de usuário.
- **Fluxos críticos:** Recuperação de senha, compartilhamento de localização.
- **Integrações:** Supabase Auth, MapBox, Resend.

---

## ✅ Checklist Locate-Family-Connect
- [ ] Fluxo de Autenticação PKCE testado (login, registro, recuperação de senha)
- [ ] Edge Function `share-location` funcionando corretamente
- [ ] Chave API do Resend configurada (`re_GaNw4cs9_KFzUiLKkiA6enex1APBhbRHu` ou a mais recente)
- [ ] Domínio `sistema-monitore.com.br` verificado no Resend
- [ ] Triggers SQL funcionando (especialmente `handle_new_user()`)
- [ ] Políticas RLS aplicadas corretamente nas tabelas críticas
- [ ] Índices aplicados para consultas frequentes
- [ ] Scripts de diagnóstico executados com sucesso

---

> **IMPORTANTE:** Revise este documento e a documentação em `/docs/` antes de alterar componentes críticos. Priorize estabilidade do fluxo de autenticação e compartilhamento de localização. Consulte `docs/configuracao-resend.md` e `docs/edge-functions.md` para detalhes específicos das integrações.
