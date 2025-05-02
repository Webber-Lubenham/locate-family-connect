# 🩺 Diagnóstico Geral — Projeto `locate-family-connect`

## 1. Estrutura do Projeto

- **Organização modular:**
  O projeto está bem dividido em `src/components`, `src/pages`, `src/layouts`, `src/contexts`, `src/hooks`, `src/lib`, etc.
- **Contextos de autenticação:**
  - O contexto antigo (`UserContext.tsx`) foi substituído pelo novo (`UnifiedAuthContext.tsx`), mas o arquivo legado ainda existe.
- **Seeds e migrations:**
  - Seeds SQL e scripts para usuários, perfis e localizações de teste estão presentes e bem organizados.
  - Migrations cobrem criação de tabelas, funções, RLS e ajustes de schema.

---

## 2. Testes Automatizados (Cypress)

- **Cobertura:**
  - Testes de login e dashboard para perfis de pai e aluno.
  - Teste de exemplo para a página de login.
- **Seletores robustos:**
  - Uso consistente de `data-cy` para elementos críticos.
- **Usuários de teste reais:**
  - Testes usam credenciais reais do Supabase Auth, garantindo fluxo realista.

---

## 3. Principais Problemas e Débitos Técnicos

### A. Erro recorrente: `.startsWith is not a function`
- Ocorre em algum listener global de eventos (`window.addEventListener('message', ...)`).
- Já há verificação de tipo, mas eventos inesperados ainda disparam o erro.
- **Recomendação:**
  - Continue monitorando os logs `[DEBUG][window.message]` para identificar a origem.
  - Considere filtrar eventos por origem ou tipo antes de processar.

### B. Contexto de Autenticação
- O contexto antigo (`UserContext.tsx`) ainda existe no projeto.
- **Recomendação:**
  - Remover o arquivo legado se não houver mais dependências.

### C. Testes Cypress
- Testes estavam desatualizados em relação à UI (ex: texto "EduConnect").
- Agora usam seletores robustos, mas é importante manter sempre alinhados com a UI real.
- **Recomendação:**
  - Sempre preferir `data-cy` a textos dinâmicos.
  - Automatizar a criação de usuários de teste no Supabase Auth para ambientes de CI.

### D. Seeds e Dados de Teste
- Seeds SQL criam usuários e localizações, mas IDs devem sempre bater com o Auth real.
- **Recomendação:**
  - Automatizar a criação de usuários no Auth e sincronizar com as tabelas de domínio.

---

## 4. Boas Práticas e Pontos Fortes

- **Componentização e reutilização:**
  Componentes bem divididos e reutilizáveis.
- **Separação de responsabilidades:**
  Layouts, páginas, hooks e serviços bem separados.
- **Uso de variáveis de ambiente:**
  Informações sensíveis e configs externas não estão hardcoded.
- **Políticas de segurança (RLS):**
  Migrations implementam Row Level Security e políticas de acesso.

---

## 5. Recomendações Gerais

1. **Remover arquivos legados** (`UserContext.tsx`) para evitar confusão.
2. **Padronizar e documentar comandos de seed** para facilitar onboarding e CI.
3. **Monitorar e filtrar eventos globais** para evitar erros de JS em produção.
4. **Automatizar criação de usuários de teste no Auth** (script ou comando npm).
5. **Documentar o fluxo de testes e dados de teste** no README.
6. **Adicionar testes para fluxos de erro e edge cases** (ex: login inválido, usuário sem perfil).

---

## 6. Exemplo de Documentação para o README

```md
## Diagnóstico e Boas Práticas

- O projeto utiliza contexto unificado de autenticação (`UnifiedAuthContext`).
- Todos os testes Cypress usam seletores `data-cy` para robustez.
- Seeds SQL e scripts garantem dados de teste consistentes.
- Políticas de segurança (RLS) ativas no banco.
- Recomenda-se remover arquivos legados e automatizar a criação de usuários de teste no Auth.
- Para rodar os testes:
  ```sh
  npx cypress open
  ```
- Para rodar seeds:
  ```sh
  psql ... -f src/lib/db/seeds/seed_users.sql
  psql ... -f src/lib/db/seeds/seed_locations.sql
  ```
```

---

Este diagnóstico foi gerado automaticamente para apoiar a manutenção, evolução e onboarding do projeto.
