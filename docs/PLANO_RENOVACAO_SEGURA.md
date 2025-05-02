# Plano de Refatoração Segura

Baseado nas análises do código e nas necessidades do projeto, este plano detalha como realizar uma refatoração segura, mantendo a aplicação funcionando durante todo o processo. O plano está organizado em fases incrementais, cada uma com passos específicos e testes para garantir a integridade do sistema.

---

## Fases de Implementação

### Fase 1: Configuração de Testes e Preparação

**Etapa 1.1: Configurar Ambiente de Teste**
- Instalar dependências de teste:
  - Jest para testes unitários
  - React Testing Library para testes de componentes
  - MSW (Mock Service Worker) para mocks de API
- Configurar arquivos de configuração:
  - `jest.config.js` na raiz do projeto
  - `setupTests.ts` para configurações globais de teste
- Criar mocks para Supabase em `src/test/mocks/supabase.ts`

**Etapa 1.2: Criar Funções Utilitárias**
- Criar arquivo `src/lib/utils/user-utils.ts`:

```ts
export function getUserType(user: any): 'student' | 'parent' | 'teacher' | 'unknown' {
  if (!user) return 'unknown';
  return user.user_type || user.user_metadata?.user_type || 'unknown';
}

export function isStudent(user: any): boolean {
  return getUserType(user) === 'student';
}

export function isParent(user: any): boolean {
  return getUserType(user) === 'parent';
}

export function hasPermission(user: any, requiredType: string | null): boolean {
  if (!requiredType) return true;
  return getUserType(user) === requiredType;
}
```
- Criar testes para essas funções em `src/lib/utils/__tests__/user-utils.test.ts`

---

### Fase 2: Unificação dos Contextos de Autenticação

**Etapa 2.1: Preparar o Contexto Unificado**
- Criar um novo contexto em `src/contexts/UnifiedAuthContext.tsx` que combine as funcionalidades de ambos
- Implementar backward compatibility para garantir que aplicativos existentes continuem funcionando
- Adicionar todos os tipos necessários de ambos os contextos

**Etapa 2.2: Implementar Migração Gradual**
- Modificar o `App.tsx` para usar o novo contexto unificado
- Adicionar wrappers de compatibilidade para ambos os hooks `useUser` e `useAuth`
- Testar cada página crítica após a mudança

---

### Fase 3: Implementação do React Query

**Etapa 3.1: Configuração do React Query**
- Configurar o `QueryClient` com opções otimizadas
- Implementar mecanismos de tratamento de erro global
- Configurar devtools do React Query para ambiente de desenvolvimento

**Etapa 3.2: Criar Hooks Baseados em React Query**
- Implementar `src/hooks/queries/useStudents.ts`:

```ts
export function useStudents(parentId: string) {
  return useQuery({
    queryKey: ['students', parentId],
    queryFn: () => studentService.getStudentsByParent(parentId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
```
- Implementar `useStudentLocations`, `useGuardians` e outros hooks necessários
- Adicionar invalidações inteligentes para operações de mutação

**Etapa 3.3: Refatorar Serviços Existentes**
- Adaptar `studentService.ts` para trabalhar bem com React Query
- Adicionar tipos adequados para todas as funções
- Implementar mecanismos de cache consistentes

---

### Fase 4: Padronização das Verificações de Tipo de Usuário

**Etapa 4.1: Aplicar Utilitários em Toda a Aplicação**
- Substituir verificações diretas como `user.user_type === 'student'` por chamadas às funções utilitárias
- Atualizar componentes de proteção de rota para usar os novos utilitários
- Testar todos os fluxos de autorização após cada mudança

**Etapa 4.2: Melhorar Feedback Visual**
- Implementar componentes de skeleton para estados de carregamento
- Criar `ToastProvider` centralizado para notificações consistentes
- Implementar tratamento de erro padronizado

---

### Fase 5: Finalização e Documentação

**Etapa 5.1: Testes Finais**
- Realizar testes de integração completos
- Verificar a cobertura de código
- Validar o desempenho da aplicação

**Etapa 5.2: Documentação**
- Atualizar `README.md` com as novas configurações
- Documentar o uso dos novos hooks e contexto
- Criar exemplos de código para funcionalidades comuns

---

## Princípios de Implementação Segura

- Nunca comprometer a funcionalidade existente: Cada mudança deve ser testada para garantir que o comportamento existente seja preservado.
- Mudanças incrementais: Implementar e testar em pequenos incrementos em vez de grandes refatorações.
- Testes antes da refatoração: Adicionar testes antes de fazer alterações importantes no código.
- Manter compatibilidade: Garantir que o código existente continue funcionando durante a transição.
- Validação contínua: Validar cada fase antes de prosseguir para a próxima.

---

## Riscos e Mitigações

- **Problema:** Dois contextos de autenticação podem causar conflitos.
  - **Mitigação:** Usar wrapper de compatibilidade e migrar gradualmente.
- **Problema:** Refatoração de componentes grandes pode introduzir bugs.
  - **Mitigação:** Testes automatizados antes de cada refatoração.
- **Problema:** Migração para React Query pode afetar o estado da aplicação.
  - **Mitigação:** Implementar gradualmente, inicialmente mantendo o estado existente em paralelo.
- **Problema:** Mudanças nas verificações de tipo de usuário podem quebrar o controle de acesso.
  - **Mitigação:** Testes exaustivos dos fluxos de autorização após cada mudança.

---

Este plano servirá como um guia para implementar as melhorias necessárias de forma segura, garantindo que a aplicação continue funcionando corretamente durante todo o processo de refatoração. 