# Checklist de Progresso - Refatoração Segura

> Consulte sempre este checklist e o plano em PLANO_RENOVACAO_SEGURA.md antes de cada etapa!

## Fase 1: Configuração de Testes e Preparação
- [x] 1.1 Instalar dependências de teste (Jest, React Testing Library, MSW)
- [x] 1.1 Configurar arquivos de teste (jest.config.js, setupTests.ts)
- [x] 1.1 Criar mocks para Supabase (src/test/mocks/supabase.ts)
- [x] 1.2 Criar utilitários de usuário (src/lib/utils/user-utils.ts)
- [x] 1.2 Criar testes para utilitários (src/lib/utils/__tests__/user-utils.test.ts)

## Fase 2: Unificação dos Contextos de Autenticação
- [x] 2.1 Criar contexto unificado (src/contexts/UnifiedAuthContext.tsx)
- [x] 2.1 Implementar backward compatibility
- [x] 2.2 Modificar App.tsx para usar o novo contexto
- [x] 2.2 Adicionar wrappers de compatibilidade (useUser, useAuth)
- [ ] 2.2 Testar páginas críticas após mudança (login, logout, dashboards, rotas protegidas)
  - [ ] Validar redirecionamento por tipo de usuário
  - [ ] Validar feedback visual e fluxo de sessão

## Fase 3: Implementação do React Query
- [ ] 3.1 Configurar QueryClient e devtools
- [ ] 3.1 Implementar tratamento de erro global
- [ ] 3.2 Criar hooks baseados em React Query (useStudents, useStudentLocations, useGuardians)
- [ ] 3.2 Adicionar invalidações inteligentes
- [ ] 3.3 Refatorar studentService.ts para React Query
- [ ] 3.3 Adicionar tipos e cache

## Fase 4: Padronização das Verificações de Tipo de Usuário
- [ ] 4.1 Substituir verificações diretas por utilitários
- [ ] 4.1 Atualizar proteção de rotas
- [ ] 4.1 Testar fluxos de autorização
- [ ] 4.2 Implementar skeletons de loading
- [ ] 4.2 Criar ToastProvider centralizado
- [ ] 4.2 Implementar tratamento de erro padronizado

## Fase 5: Finalização e Documentação
- [ ] 5.1 Testes de integração completos
- [ ] 5.1 Verificar cobertura de código
- [ ] 5.1 Validar desempenho
- [ ] 5.2 Atualizar README.md
- [ ] 5.2 Documentar hooks/contexto
- [ ] 5.2 Criar exemplos de código 