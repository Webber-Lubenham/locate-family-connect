# GUIA DE ANÁLISE COMPLETA DO PROJETO

## 📚 Objetivo
Este documento orienta como analisar, auditar e compreender todos os arquivos e documentos do projeto Locate-Family-Connect, garantindo continuidade, segurança e evolução sustentável.

---

## 1. Estrutura do Projeto: O que analisar

### a) **Documentação (`/docs/`)**
- **Leitura obrigatória:**
  - `knowledge-base-locate-family-connect.md`: visão geral, objetivos, papéis, integrações e requisitos.
  - `relatorio-tecnico-05-05-2025.md`: problemas críticos, recomendações e estado real do projeto.
  - `configuracao-resend.md`, `edge-functions.md`, `rls-student-guardians-policy.md`: integrações e segurança.
  - `BOAS_PRATICAS_DESENVOLVIMENTO.md`, `SUPABASE_CLIENT_BEST_PRACTICES.md`: padrões de código e arquitetura.
  - Relatórios de bugs e análises de erros: para entender falhas recorrentes e pontos frágeis.
- **Como analisar:**
  - Busque por inconsistências entre documentação e código.
  - Verifique se recomendações e padrões estão sendo seguidos.
  - Atualize sempre que houver mudanças relevantes.

### b) **Código-fonte (`/src/`)**
- **Componentes React:**
  - Separe lógica de autenticação, negócio e apresentação.
  - Verifique se há duplicidade de lógica entre perfis (estudante/guardião).
  - Analise hooks customizados: devem ser reutilizáveis e testados.
- **Contextos:**
  - `UnifiedAuthContext.tsx`: deve ser revisado para separar fluxos de autenticação.
  - `UserContext.tsx`, `AuthContext.tsx`: garantir que estados e permissões estejam corretos.
- **Serviços e integrações:**
  - `/lib/services/`, `/integrations/supabase/`: centralize chamadas externas e lógica de negócio.
  - `/lib/db/`: revise migrations, funções SQL e seeds.
- **Como analisar:**
  - Busque por acesso direto ao Supabase fora dos serviços.
  - Verifique se migrations estão aplicadas e versionadas.
  - Garanta que funções SQL estejam documentadas e seguras (SECURITY DEFINER, RLS).

### c) **Testes Automatizados (`/cypress/`, `/src/__tests__/`)**
- **E2E (Cypress):**
  - Analise se os testes refletem o comportamento real do sistema.
  - Corrija seletores e mocks inconsistentes.
  - Priorize fluxos críticos: autenticação, recuperação de senha, compartilhamento de localização.
- **Unitários (Jest):**
  - Garanta cobertura dos hooks, serviços e componentes principais.
- **Como analisar:**
  - Rode todos os testes e verifique falhas recorrentes.
  - Atualize ou crie novos testes para cenários não cobertos.

### d) **Scripts de Diagnóstico (`/scripts/`)**
- **Função:**
  - Validar integrações (Resend, Supabase, banco de dados).
  - Diagnosticar falhas de envio de email, conexão e permissões.
- **Como analisar:**
  - Execute periodicamente e registre logs.
  - Atualize scripts conforme mudanças nas integrações.

### e) **Migrations e Banco de Dados (`/src/lib/db/migrations/`, `/supabase/migrations/`)**
- **Função:**
  - Versionar e aplicar mudanças estruturais no banco.
  - Implementar e revisar políticas RLS, triggers e funções SQL.
- **Como analisar:**
  - Confirme que todas as migrations foram aplicadas.
  - Revise se as políticas RLS garantem segurança e acesso correto por perfil.
  - Documente funções e triggers customizadas.

### f) **Configuração de Ambiente (`.env`, `.env.example`, `/docs/configuracao-resend.md`)**
- **Função:**
  - Centralizar chaves, tokens e variáveis sensíveis.
- **Como analisar:**
  - Verifique se não há chaves hardcoded no código.
  - Confirme que todas as variáveis necessárias estão documentadas e presentes.

### g) **Relatórios Técnicos e de Bugs (`/docs/relatorio-*.md`, `/docs/ERROS_RELATADOS.md`)**
- **Função:**
  - Registrar problemas, decisões e soluções.
- **Como analisar:**
  - Use como referência para priorizar correções e refatorações.
  - Atualize sempre após resolução de problemas críticos.

---

## 2. Passos para Análise Completa

1. **Leia toda a documentação essencial.**
2. **Rode todos os scripts de diagnóstico e testes automatizados.**
3. **Analise o código-fonte, priorizando contextos, hooks e serviços.**
4. **Revise migrations, funções SQL e políticas RLS.**
5. **Verifique configurações de ambiente e integrações externas.**
6. **Consulte relatórios técnicos para entender problemas históricos e recorrentes.**
7. **Documente toda descoberta, ajuste ou decisão tomada.**

---

## 3. Recomendações Gerais

- **Centralize integrações e lógica de negócio.**
- **Separe fluxos de autenticação por perfil.**
- **Padronize uso de chaves e tokens.**
- **Garanta que todas as migrations estejam aplicadas.**
- **Priorize correção de falhas críticas antes de novas features.**
- **Mantenha documentação e scripts sempre atualizados.**
- **Implemente revisões obrigatórias de código e testes.**

---

## 4. Checklist de Continuidade

- [ ] Documentação lida e compreendida
- [ ] Scripts de diagnóstico executados
- [ ] Testes automatizados rodando sem falhas críticas
- [ ] Migrations aplicadas e banco consistente
- [ ] Políticas RLS revisadas e seguras
- [ ] Integrações externas funcionando
- [ ] Decisões e descobertas documentadas

---

## 5. Dicas para Analisar Qualquer Arquivo

- **Leia o cabeçalho e comentários:** Busque contexto e propósito.
- **Procure por TODOs e FIXMEs:** Indicam pontos frágeis ou pendentes.
- **Compare com a documentação:** O código reflete o que está documentado?
- **Verifique dependências:** O arquivo depende de integrações, variáveis ou outros módulos?
- **Teste localmente:** Sempre que possível, rode o código/teste/script para validar seu funcionamento.

---

> **Este guia deve ser revisado e atualizado a cada ciclo de desenvolvimento ou sempre que houver mudanças estruturais no projeto.** 