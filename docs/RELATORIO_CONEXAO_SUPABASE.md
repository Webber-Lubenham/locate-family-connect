# Relatório de Análise: Conexão Supabase e Estrutura do Banco de Dados
**Projeto:** Locate Family Connect  
**Data:** 26/04/2025  
**Objetivo:** Análise da estrutura atual e preparação para implementação da visualização de alunos por pais/responsáveis

## 1. Visão Geral da Conexão com Supabase

### 1.1 Implementação do Cliente Supabase

A conexão com o Supabase está implementada de forma robusta no arquivo `src/lib/supabase.ts`, seguindo o padrão Singleton para garantir uma única instância do cliente durante todo o ciclo de vida da aplicação. A configuração inclui:

```typescript
// Configuração do ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
```

Características principais da implementação:
- Inicialização lazy do cliente Supabase
- Sistema avançado de logging para depuração
- Validação rigorosa de dados com Zod
- Formatação padronizada para telefones
- Implementação de autenticação PKCE para maior segurança

### 1.2 Gestão de Autenticação

O sistema de autenticação implementa:
- Validação de email e senha via schemas Zod
- Fluxo completo de registro, login e logout
- Gerenciamento de sessão com persistência
- Atualização automática de tokens
- Tratamento abrangente de erros

## 2. Estrutura do Banco de Dados

### 2.1 Tabelas Principais

| Tabela | Descrição | Colunas Principais | Relacionamentos |
|--------|-----------|-------------------|-----------------|
| `users` | Usuários da aplicação | `id`, `name`, `role`, `phone` | Tabela principal |
| `profiles` | Perfis de usuário expandidos | `id`, `full_name`, `user_type`, `phone` | Referencia `users` |
| `guardians` | Responsáveis por estudantes | `id`, `student_id`, `full_name`, `email`, `phone`, `is_active` | Referencia `auth.users` |
| `auth_logs` | Logs de autenticação | `id`, `event_type`, `user_id`, `metadata`, `occurred_at` | Referencia `users` |

### 2.2 Políticas de Segurança (RLS)

A aplicação implementa Row Level Security (RLS) para proteger os dados:

1. **Política para guardians:**
   ```sql
   CREATE POLICY "Students can manage their guardians"
     ON public.guardians
     FOR ALL
     USING (auth.uid() = student_id);
   ```

2. **Política para localização:**
   ```sql
   CREATE POLICY "Guardians can view student locations"
     ON public.locations
     FOR SELECT
     USING (auth.uid() IN (
       SELECT student_id 
       FROM public.guardians 
       WHERE email = auth.jwt() ->> 'email' 
       AND is_active = true
     ));
   ```

### 2.3 Triggers e Funções

O banco de dados utiliza triggers e funções para automatizar operações:

1. **Atualização de timestamp:**
   - Trigger `update_users_updated_at` atualiza automaticamente `updated_at`

2. **Criação automática de perfil:**
   - Função `handle_new_user()` cria automaticamente perfil para novos usuários

3. **Logging de eventos:**
   - Função `log_auth_event()` registra eventos de autenticação para auditoria

## 3. Análise para Implementação da Visualização de Alunos por Pais

### 3.1 Estado Atual

Atualmente, a estrutura de dados possui:
- Tabela `guardians` que relaciona estudantes com seus responsáveis
- Política RLS que permite visualização de localizações pelos responsáveis
- Não há evidência de tabela explícita de `locations` nas migrações analisadas

### 3.2 Lacunas Identificadas

1. **Tabela de Localizações:** Falta evidência da implementação da tabela `locations` mencionada nas políticas RLS.

2. **Relação Bidirecional:** A relação atual é unidirecional (estudante → guardian), mas para a visualização de alunos por pais, precisamos de uma consulta eficiente na direção oposta.

3. **Interface no Frontend:** Não há componentes evidentes para listar estudantes relacionados a um responsável.

### 3.3 Modelo de Dados para Relação Pai-Aluno

O modelo atual usa uma estrutura onde:
- Cada estudante pode ter múltiplos responsáveis
- Os responsáveis são identificados pelo email e precisam estar ativos

Para implementar a visualização de alunos por pais, precisamos considerar:
1. Como um pai se autentica no sistema
2. Como vincular o email autenticado com registros na tabela `guardians`
3. Como exibir e gerenciar múltiplos estudantes vinculados ao mesmo responsável

## 4. Recomendações de Implementação

### 4.1 Backend (Supabase)

1. **Criar View ou Função SQL:**
   ```sql
   CREATE OR REPLACE FUNCTION get_student_profiles_for_guardian(guardian_email TEXT)
   RETURNS TABLE (
     student_id UUID,
     student_name TEXT,
     student_email TEXT,
     relation_type TEXT
   ) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       u.id AS student_id,
       u.name AS student_name,
       u.email AS student_email,
       g.tipo_vinculo AS relation_type
     FROM 
       public.guardians g
       JOIN auth.users u ON g.student_id = u.id
       JOIN public.profiles p ON u.id = p.id
     WHERE 
       g.email = guardian_email
       AND g.is_active = true;
   END;
   $$ LANGUAGE plpgsql;
   ```

2. **Adicionar Edge Function para Responsáveis:**
   - Implementar função Supabase Edge para listar estudantes vinculados ao responsável atual

3. **Expandir Política RLS:**
   - Garantir que responsáveis possam visualizar dados básicos de perfil de seus estudantes

### 4.2 Frontend

1. **Componente de Lista de Estudantes:**
   ```tsx
   // Componente para exibir estudantes vinculados ao responsável
   const StudentsForGuardianList = () => {
     const [students, setStudents] = useState<Student[]>([]);
     const { user } = useAuth();
     
     useEffect(() => {
       if (user) {
         // Buscar estudantes vinculados ao email do usuário autenticado
         supabase.from('guardians')
           .select(`
             student_id,
             students:users!inner(
               id, 
               name, 
               email
             )
           `)
           .eq('email', user.email)
           .eq('is_active', true)
           .then(({ data, error }) => {
             if (data) setStudents(data.map(d => d.students));
           });
       }
     }, [user]);
     
     return (
       <div className="student-list">
         <h2>Seus Estudantes</h2>
         {students.length > 0 ? (
           <ul>
             {students.map(student => (
               <li key={student.id}>
                 <StudentCard student={student} />
               </li>
             ))}
           </ul>
         ) : (
           <p>Nenhum estudante vinculado à sua conta.</p>
         )}
       </div>
     );
   };
   ```

2. **Página de Dashboard para Responsáveis:**
   - Implementar visualização específica para pais/responsáveis
   - Incluir mapa com localização dos estudantes vinculados
   - Adicionar funcionalidades de notificação e gerenciamento

3. **Fluxo de Registro/Vínculo:**
   - Permitir que estudantes enviem convites para responsáveis
   - Implementar fluxo de aceitação de convite para responsáveis

## 5. Considerações de Segurança

1. **Validação de Email:** Garantir que apenas o proprietário legítimo do email possa acessar dados dos estudantes.

2. **Consentimento:** Implementar sistema onde o estudante deve consentir explicitamente ao compartilhamento de sua localização.

3. **Auditoria:** Registrar todos os acessos de responsáveis às informações dos estudantes.

4. **Controle de Desativação:** Permitir que estudantes desativem temporariamente o acesso de responsáveis.

## 6. Conclusão

A estrutura atual do banco de dados já suporta o relacionamento básico entre estudantes e responsáveis, com políticas RLS implementadas para segurança. Para implementar a visualização de alunos por pais no frontend, será necessário:

1. Criar componentes de UI específicos para usuários do tipo "parent"
2. Implementar consultas eficientes à tabela `guardians` para recuperar os estudantes vinculados
3. Desenvolver interface de mapa para exibir localização dos estudantes
4. Implementar sistema de notificação para atualizações de localização

A arquitetura Supabase existente está bem estruturada para suportar estes desenvolvimentos, necessitando principalmente de adições no frontend e possivelmente algumas funções ou views adicionais no backend para facilitar as consultas de relacionamento.

---

**Próximos Passos:**
1. Verificar a implementação atual da tabela `locations`
2. Desenvolver os componentes de UI para visualização de alunos por pais
3. Implementar as consultas RLS-aware para relacionamento bidirecional
4. Testar com diferentes cenários de usuário (1 pai - múltiplos alunos, 1 aluno - múltiplos pais)
