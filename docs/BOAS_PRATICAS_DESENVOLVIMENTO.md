
# Boas Práticas de Desenvolvimento - EduConnect

## Introdução

Este documento estabelece padrões e boas práticas para o desenvolvimento do sistema EduConnect, visando garantir código consistente, seguro e de fácil manutenção.

## 1. Interfaces e Tipos TypeScript

### 1.1. Definição de Interfaces

- **Use interfaces para objetos e tipos para unions/aliases**:
  ```typescript
  // Bom
  interface User {
    id: string;
    name: string;
  }

  type UserRole = 'admin' | 'student' | 'guardian';

  // Evite
  type User = {
    id: string;
    name: string;
  }
  ```

- **Documente todas as propriedades**:
  ```typescript
  /**
   * Representa um responsável no sistema
   */
  interface Guardian {
    /**
     * Identificador único do responsável
     */
    id: string;

    /**
     * Nome completo do responsável
     */
    full_name: string;

    /**
     * Email do responsável (usado para login e notificações)
     */
    email: string;
  }
  ```

- **Separe arquivos por domínio**:
  ```
  src/
  └── types/
      ├── auth.ts       # Tipos de autenticação
      ├── student.ts    # Tipos relacionados a estudantes
      ├── guardian.ts   # Tipos relacionados a responsáveis
      └── location.ts   # Tipos de localização
  ```

### 1.2. Propriedades Opcionais e Nullable

- **Use o modificador `?` para propriedades opcionais**:
  ```typescript
  interface Profile {
    name: string;        // Obrigatório
    phone?: string;      // Opcional
    avatar_url?: string; // Opcional
  }
  ```

- **Defina explicitamente o tipo `null` quando necessário**:
  ```typescript
  interface UserData {
    name: string;
    bio: string | null;      // Pode ser string ou null
    lastLogin: Date | null;  // Pode ser Date ou null
  }
  ```

- **Evite o uso de `any`**:
  ```typescript
  // Evite
  function processUser(user: any) { ... }

  // Melhor
  function processUser(user: User) { ... }
  
  // Para casos realmente genéricos
  function processData<T>(data: T) { ... }
  ```

## 2. Funções RPC Seguras

### 2.1. Implementação

- **Use `SECURITY DEFINER` para funções que acessam dados protegidos**
- **Sempre verifique permissões no início da função**:
  ```sql
  IF auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Permissão negada';
  END IF;
  ```

- **Defina explicitamente o `search_path`**:
  ```sql
  CREATE OR REPLACE FUNCTION my_function()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    -- código
  END;
  $$;
  ```

### 2.2. Teste de Funções RPC

- **Teste com diferentes perfis de usuário**
- **Verifique cenários de negação de acesso**
- **Teste com parâmetros nulos e inválidos**
- **Documente exemplos de chamadas válidas**

## 3. Gerenciamento de Estado

### 3.1. React Query

- **Use React Query para dados de servidor**:
  ```typescript
  const { data, isLoading, error } = useQuery({
    queryKey: ['guardians', studentId],
    queryFn: () => fetchGuardians(studentId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  ```

- **Estruture corretamente as query keys**:
  ```typescript
  // Para lista de estudantes
  ['students']
  
  // Para um estudante específico
  ['student', studentId]
  
  // Para responsáveis de um estudante
  ['guardians', studentId]
  ```

- **Configure tempos de invalidação adequados**:
  ```typescript
  // Dados que mudam frequentemente
  staleTime: 30 * 1000, // 30 segundos
  
  // Dados relativamente estáticos
  staleTime: 60 * 60 * 1000, // 1 hora
  ```

### 3.2. Contextos React

- **Use contextos para estado global**
- **Divida contextos por domínio**:
  ```
  src/
  └── contexts/
      ├── AuthContext.tsx        # Autenticação
      ├── NotificationContext.tsx # Notificações
      ├── LocationContext.tsx    # Localização
      └── PreferencesContext.tsx # Preferências do usuário
  ```

## 4. Tratamento de Erros

### 4.1. Frontend

- **Use componentes de feedback consistentes**:
  ```tsx
  {error && (
    <Alert variant="destructive">
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )}
  ```

- **Classifique erros por tipo**:
  ```typescript
  if (error.status === 403) {
    // Erro de permissão
    setError('Você não tem permissão para realizar esta ação.');
  } else if (error.status === 404) {
    // Recurso não encontrado
    setError('O recurso solicitado não foi encontrado.');
  } else {
    // Erro genérico
    setError('Ocorreu um erro. Tente novamente mais tarde.');
  }
  ```

### 4.2. Backend (SQL)

- **Use `RAISE NOTICE` para log de debugging**:
  ```sql
  RAISE NOTICE 'Processando usuário: %', user_id;
  ```

- **Use `RAISE EXCEPTION` com mensagens claras**:
  ```sql
  IF NOT user_exists THEN
    RAISE EXCEPTION 'Usuário com ID % não encontrado', user_id;
  END IF;
  ```

## 5. Segurança

### 5.1. Row-Level Security (RLS)

- **Sempre habilite RLS em tabelas com dados sensíveis**:
  ```sql
  ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
  ```

- **Crie políticas específicas por operação**:
  ```sql
  CREATE POLICY "Users can view their own data" 
    ON my_table 
    FOR SELECT 
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own data" 
    ON my_table 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  ```

- **Evite políticas muito permissivas**
- **Teste políticas com diferentes perfis de usuário**

### 5.2. Autenticação e Autorização

- **Verifique autenticação em todas as rotas protegidas**
- **Implemente controle de acesso baseado em função (RBAC)**
- **Revise regularmente permissões de usuários**

## 6. Performance

### 6.1. Consultas SQL

- **Use índices para campos frequentemente consultados**:
  ```sql
  CREATE INDEX idx_my_table_user_id ON my_table(user_id);
  ```

- **Evite SELECT * em tabelas grandes**:
  ```sql
  -- Evite
  SELECT * FROM users;
  
  -- Prefira
  SELECT id, name, email FROM users;
  ```

- **Use paginação para grandes conjuntos de dados**:
  ```sql
  SELECT * FROM locations 
  WHERE user_id = $1 
  ORDER BY timestamp DESC 
  LIMIT 10 OFFSET 0;
  ```

### 6.2. React e UI

- **Use memoização para componentes pesados**:
  ```tsx
  const MemoizedComponent = React.memo(MyComponent);
  ```

- **Utilize lazy loading para rotas**:
  ```tsx
  const LazyComponent = React.lazy(() => import('./HeavyComponent'));
  ```

- **Implemente virtualization para listas longas**

## 7. Migrações de Banco de Dados

### 7.1. Nomenclatura

- **Use timestamp como prefixo**:
  ```
  20250505_fix_guardians_permissions.sql
  ```

- **Nomes descritivos e específicos**:
  ```
  20250422_add_is_active_to_guardians.sql
  ```

### 7.2. Conteúdo

- **Inclua comentários explicativos**:
  ```sql
  -- Adiciona coluna is_active na tabela guardians para permitir desativação
  -- sem perder o histórico de relacionamentos
  ALTER TABLE guardians ADD COLUMN is_active BOOLEAN DEFAULT true;
  ```

- **Sempre inclua instruções de rollback**:
  ```sql
  -- Rollback:
  -- ALTER TABLE guardians DROP COLUMN is_active;
  ```

- **Documente as migrações aplicadas**

## 8. Logs e Monitoramento

- **Use níveis de log apropriados**
- **Inclua contexto suficiente**:
  ```typescript
  console.error('[GuardianService] Erro ao excluir responsável:', error, { guardianId, studentId });
  ```

- **Implemente telemetria para operações críticas**
- **Monitore erros e exceções**

## 9. Testes

### 9.1. Testes Unitários

- **Teste funções isoladamente**
- **Use mocks para dependências externas**
- **Cubra casos de borda e exceções**

### 9.2. Testes de Integração

- **Teste fluxos completos**
- **Verifique interações entre componentes**
- **Teste com dados realistas**

### 9.3. Testes E2E

- **Valide fluxos de usuário de ponta a ponta**
- **Teste em diferentes navegadores/dispositivos**
- **Verifique respostas de UI a diferentes cenários**

## 10. Documentação

- **Documente decisões de arquitetura**
- **Mantenha documentação técnica atualizada**
- **Use JSDoc para documentar funções e classes**:
  ```typescript
  /**
   * Busca os responsáveis de um estudante.
   * 
   * @param studentId - ID do estudante
   * @returns Lista de responsáveis
   * @throws {Error} Se o usuário não tiver permissão
   */
  async function fetchGuardians(studentId: string): Promise<Guardian[]> {
    // ...
  }
  ```

- **Inclua exemplos de uso**
