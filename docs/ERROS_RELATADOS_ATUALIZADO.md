
# Relatório de Erros no Sistema EduConnect - Atualizado

## Índice
1. [Erro: process is not defined](#1-erro-process-is-not-defined)
2. [Erro: 422 Unprocessable Content na Requisição de Signup](#2-erro-422-unprocessable-content-na-requisição-de-signup)
3. [Erro: 403 Forbidden no acesso à tabela guardians](#3-erro-403-forbidden-no-acesso-à-tabela-guardians)
4. [Erro: 400 Bad Request na chamada RPC get_student_guardians_secure](#4-erro-400-bad-request-na-chamada-rpc-get_student_guardians_secure)
5. [Erro: Property 'is_active' does not exist on type 'Guardian'](#5-erro-property-is_active-does-not-exist-on-type-guardian)
6. [Erro: Uncaught TypeError: Cannot read properties of null](#6-erro-uncaught-typeerror-cannot-read-properties-of-null)

## 1. Erro: process is not defined

### Descrição
Este erro ocorre quando o código tenta acessar a variável global `process` no ambiente do navegador, onde ela não está definida. O erro foi identificado no arquivo:

```
https://ad2bf0f2-d5c0-44f9-82fd-8b2eeeb1165f.lovableproject.com/src/components/RegisterForm.tsx
```

Na linha 20, coluna 21, o erro de referência não definida para `process` foi lançado, causando uma falha em tempo de execução e uma tela em branco.

### Causa Provável
O objeto `process` é uma variável global do Node.js e não está disponível no ambiente do navegador. Isso geralmente acontece quando o código tenta acessar variáveis de ambiente ou outras propriedades do Node.js diretamente no frontend sem o devido tratamento.

### Sugestão de Correção
- Verificar o uso da variável `process` no código frontend e substituir por variáveis de ambiente configuradas corretamente para o ambiente de build (ex: usando Vite, Webpack, etc).
- Utilizar variáveis de ambiente prefixadas (ex: `import.meta.env` no Vite) para acessar configurações no frontend.
- Garantir que o bundler está configurado para substituir ou definir variáveis de ambiente corretamente.

## 2. Erro: 422 Unprocessable Content na Requisição de Signup

### Descrição
O erro HTTP 422 indica que o servidor entendeu a requisição, mas não conseguiu processar os dados enviados devido a erros semânticos. No contexto do cadastro de usuário, isso geralmente significa que os dados enviados (email, senha, etc) não passaram nas validações do backend.

Exemplo de erro no console:

```
POST https://rsvjnndhbyyxktbczlnk.supabase.co/auth/v1/signup 422 (Unprocessable Content)
```

E mensagem de erro no hook:

```
Supabase signup error: {message: 'User already registered', code: 'user_already_exists'}
```

### Como Verificar
- Inspecionar a aba "Response" no painel Network do DevTools para a requisição que falhou.
- O corpo da resposta deve conter um objeto JSON com detalhes dos erros de validação.

### Possíveis Causas
- Campos obrigatórios ausentes.
- Formato inválido do email.
- Senha com tamanho ou complexidade insuficiente.
- Confirmação de senha não batendo com a senha.
- Usuário já cadastrado (erro `user_already_exists`).

### Sugestões de Correção
- Corrigir os dados enviados no formulário de cadastro conforme as mensagens de erro.
- Implementar validação no frontend para evitar envio de dados inválidos.
- Garantir que o usuário não está tentando cadastrar um email já registrado.
- Tratar erros de forma amigável para o usuário, exibindo mensagens claras.

## 3. Erro: 403 Forbidden no acesso à tabela guardians

### Descrição
Este erro ocorre ao tentar acessar diretamente a tabela `guardians` via API REST do Supabase. O erro 403 (Forbidden) indica que o servidor entende a solicitação, mas se recusa a autorizá-la.

Erro observado no console:

```
GET https://rsvjnndhbyyxktbczlnk.supabase.co/rest/v1/guardians?select=*&student_id=eq.864a6c0b-4b17-4df7-8709-0c3f7cf0be91 403 (Forbidden)
```

### Causa
As políticas de segurança Row-Level Security (RLS) estão impedindo o acesso direto à tabela, mesmo quando o usuário está autenticado. Isso pode ocorrer por:

1. Políticas RLS não configuradas corretamente
2. O usuário não possui as permissões necessárias
3. O acesso direto à tabela não é permitido por design (deve-se usar funções RPC seguras)

### Sugestões de Correção
1. **Solução recomendada**: Usar a função RPC segura `get_student_guardians_secure` em vez de acessar a tabela diretamente:

```typescript
const { data, error } = await supabase.rpc(
  'get_student_guardians_secure',
  { p_student_id: studentId }
);
```

2. Alternativa: Revisar as políticas RLS para garantir que:
   - A política `Students can view their own guardians` está presente
   - A política está usando a condição correta `auth.uid() = student_id`
   - O usuário está autenticado corretamente

### Verificação de Políticas
Execute o seguinte SQL para verificar as políticas existentes:

```sql
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'guardians';
```

## 4. Erro: 400 Bad Request na chamada RPC get_student_guardians_secure

### Descrição
Este erro ocorre ao chamar a função RPC `get_student_guardians_secure`. O erro 400 (Bad Request) indica que o servidor encontrou um erro na requisição que impede o seu processamento.

Erro observado no console:

```
POST https://rsvjnndhbyyxktbczlnk.supabase.co/rest/v1/rpc/get_student_guardians_secure 400 (Bad Request)
```

### Causas Possíveis
1. **Parâmetros incorretos**: A função espera um parâmetro `p_student_id` que pode estar ausente ou com formato incorreto
2. **Função não existe**: A função RPC não foi criada no banco de dados
3. **Erro de implementação**: A função contém um bug que gera erro ao ser executada

### Sugestões de Correção

1. **Verificar os parâmetros**:
   ```typescript
   // Verifique se está passando o parâmetro corretamente
   const { data, error } = await supabase.rpc(
     'get_student_guardians_secure',
     { p_student_id: user.id } // Use o formato correto do objeto de parâmetros
   );
   ```

2. **Verificar se a função existe**:
   Execute o SQL abaixo no Supabase SQL Editor para verificar se a função existe:
   ```sql
   SELECT 
     routine_name, 
     parameter_name,
     parameter_mode,
     data_type 
   FROM 
     information_schema.parameters 
   WHERE 
     specific_schema = 'public' AND 
     routine_name = 'get_student_guardians_secure';
   ```

3. **Recriar a função se necessário**:
   Se a função não existir, execute o SQL de criação da função conforme definido em `20250505_fix_guardians_permissions.sql`

### Diagnóstico Avançado
Para diagnosticar melhor o problema, adicione logs detalhados:

```typescript
console.log('Chamando RPC get_student_guardians_secure com parâmetro:', { p_student_id: studentId });
const { data, error } = await supabase.rpc(
  'get_student_guardians_secure',
  { p_student_id: studentId }
);
console.log('Resposta da RPC:', { data, error });
```

## 5. Erro: Property 'is_active' does not exist on type 'Guardian'

### Descrição
Este erro de TypeScript indica que a propriedade `is_active` está sendo acessada no tipo `Guardian`, mas não está definida na interface.

Erro observado durante a compilação:

```
src/components/GuardianList.tsx(90,34): error TS2339: Property 'is_active' does not exist on type 'Guardian'.
```

### Causa
A interface `Guardian` em `src/hooks/guardian/types.ts` não inclui a propriedade `is_active`, mas o código tenta acessá-la.

### Solução

1. **Atualizar a interface Guardian para incluir a propriedade is_active**:

```typescript
export interface Guardian {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  created_at: string;
  is_active?: boolean; // Adicionar esta propriedade
}
```

2. **Tratar o valor undefined no componente**:

```typescript
<GuardianCard
  // ...
  isActive={guardian.is_active !== undefined ? guardian.is_active : true}
  // ...
/>
```

### Verificação

- Certifique-se de que todas as propriedades acessadas em objetos estão devidamente definidas nas interfaces.
- Use uma verificação de nulidade ou forneça valores padrão para propriedades opcionais.

## 6. Erro: Uncaught TypeError: Cannot read properties of null

### Descrição
Este erro ocorre quando o código tenta acessar uma propriedade de um objeto que é `null` ou `undefined`. 

Exemplo típico:
```
Uncaught TypeError: Cannot read properties of null (reading 'id')
```

### Causas Comuns
1. Tentativa de acessar propriedades antes que os dados estejam carregados
2. Falha em tratamento adequado de resposta nula de API
3. Desestruturação sem verificação de nulidade

### Prevenção e Correção

1. **Usar guardas de nulidade**:
   ```typescript
   // Antes
   const studentId = user.id;
   
   // Depois
   const studentId = user?.id;
   ```

2. **Adicionar verificações antes de acessar propriedades**:
   ```typescript
   if (user && user.id) {
     // Acessar properties com segurança
   }
   ```

3. **Fornecer valores padrão durante desestruturação**:
   ```typescript
   const { data = [], error = null } = await supabase.rpc(
     'get_student_guardians_secure',
     { p_student_id: studentId }
   );
   ```

4. **Usar operador de coalescência nula**:
   ```typescript
   const guardians = data ?? [];
   ```

### Padrão Recomendado para Consumo de API

```typescript
const fetchData = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase.rpc(
      'get_student_guardians_secure',
      { p_student_id: user?.id }
    );
    
    if (error) throw error;
    
    setData(data || []);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    setError(error.message || 'Erro desconhecido');
  } finally {
    setLoading(false);
  }
};
```

## Resumo

- O erro `process is not defined` indica uso incorreto de variáveis de ambiente no frontend.
- O erro 422 no signup do Supabase indica falha na validação dos dados enviados.
- O erro 403 no acesso à tabela guardians indica que as políticas RLS estão impedindo o acesso direto e deve-se usar a função RPC segura.
- O erro 400 na chamada RPC indica parâmetros incorretos ou problemas com a função.
- O erro de propriedade inexistente em tipo Guardian indica desalinhamento entre interface e uso real do objeto.
- Erros de propriedades de `null` ou `undefined` podem ser evitados com guardas de nulidade e valores padrão.
