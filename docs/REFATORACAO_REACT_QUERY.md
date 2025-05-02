# Refatoração: Implementação de React Query

## Objetivo
Modernizar o gerenciamento de dados assíncronos do app, utilizando React Query para:
- Buscar estudantes, localizações e responsáveis de forma eficiente
- Melhorar cache, loading, feedback de erro e performance
- Facilitar manutenção e testes

---

## Etapas Realizadas

### 1. Criação de Hooks React Query
- **useStudents**: Busca estudantes vinculados a um responsável
  - Local: `src/hooks/queries/useStudents.ts`
  - Usa: `studentService.getStudentsByParent(parentId)`
- **useStudentLocations**: Busca localizações de um estudante
  - Local: `src/hooks/queries/useStudentLocations.ts`
  - Usa: `studentService.getStudentLocations(studentId)`
- **useGuardians**: Busca responsáveis de um estudante
  - Local: `src/hooks/queries/useGuardians.ts`
  - Usa: `studentService.getGuardiansByStudent(studentId)`

### 2. Atualização do Serviço
- **studentService** (`src/lib/services/studentService.ts`):
  - Adicionada função `getGuardiansByStudent(studentId)` para buscar responsáveis na tabela `guardians` e perfis relacionados
  - Serviço já possuía métodos para buscar estudantes e localizações, compatíveis com React Query

### 3. Integração e Planejamento
- Hooks prontos para serem usados em componentes/páginas (ex: dashboards, painéis de estudante/responsável)
- Query keys padronizadas para facilitar cache e invalidação
- `staleTime` configurado para otimizar performance

---

## Próximos Passos
- Refatorar componentes/páginas para usar os novos hooks (ex: dashboards, listas de estudantes, painéis de localização)
- Adicionar feedback visual de loading e erro usando estados do React Query
- Implementar invalidações de cache em mutações (ex: ao adicionar/remover estudante)
- Testar fluxos críticos para garantir que a refatoração não quebrou funcionalidades
- Documentar exemplos de uso dos hooks nos componentes

---

## Observações
- O uso de React Query facilita a manutenção, melhora a experiência do usuário e prepara o app para futuras otimizações (ex: prefetch, background sync)
- O serviço `studentService` pode ser expandido para outras entidades seguindo o mesmo padrão

---

*Última atualização: [preencher data]* 