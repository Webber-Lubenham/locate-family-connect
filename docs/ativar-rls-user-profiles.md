# Como habilitar RLS na tabela `public.user_profiles` do Supabase

## Problema
A tabela `public.user_profiles` possui políticas de Row Level Security (RLS) criadas, mas o RLS não está habilitado. Isso significa que as políticas não estão sendo aplicadas, deixando a tabela vulnerável a acessos não autorizados.

## Sintoma
- O Supabase aponta: "Table public.user_profiles has RLS policies but RLS is not enabled on the table."
- Ao tentar habilitar o RLS, pode aparecer o erro:
  
  ```
  ERROR: must be owner of table user_profiles
  ```

## O que é RLS?
Row Level Security (RLS) permite definir regras para controlar quais linhas de uma tabela cada usuário pode acessar ou modificar. É fundamental para proteger dados sensíveis.

## Como corrigir

### 1. Habilitar RLS (com permissão adequada)
Execute o comando SQL abaixo com um usuário que seja owner da tabela (normalmente o usuário padrão do Supabase é o `postgres`):

```sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

#### Passos:
- No painel do Supabase, acesse a aba **SQL Editor**.
- Certifique-se de estar logado como um usuário com permissão de owner (o SQL Editor do painel geralmente já usa o owner).
- Cole e execute o comando acima.

Se continuar recebendo o erro, pode ser necessário:
- Solicitar ao administrador do projeto para executar o comando.
- Verificar se o projeto foi migrado de outro ambiente, o que pode alterar o owner da tabela.

### 2. Testar as Políticas
Após habilitar o RLS:
- Teste as políticas já criadas para garantir que apenas usuários autorizados possam visualizar/alterar perfis.
- Use o SQL Editor para simular queries com diferentes usuários/roles.

### 3. Segurança
Habilitar o RLS é fundamental para proteger dados sensíveis dos usuários. Sem isso, qualquer usuário autenticado (ou até anônimo, dependendo das permissões) pode acessar ou modificar dados de perfis.

## Resumo Visual

| Status Atual | Correção Necessária |
|--------------|--------------------|
| Políticas criadas, mas não aplicadas | Habilitar RLS na tabela |
| Risco de acesso indevido | Políticas passam a ser aplicadas |

---

Se precisar de um checklist para garantir a segurança após habilitar o RLS ou revisar as políticas existentes, consulte o time responsável ou peça suporte ao administrador do Supabase. 