# Migrations para Supabase

Este diretório contém migrações SQL para manter e atualizar o esquema do banco de dados do Supabase.

## Como aplicar uma migration

### Opção 1: Através do painel do Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Clique em **+ New Query**
5. Copie e cole o conteúdo do arquivo de migration
6. Clique em **Run** para executar a migration

### Opção 2: Usando Supabase CLI (Recomendado)

Para aplicar as migrações usando o Supabase CLI:

1. Instale o Supabase CLI seguindo a [documentação oficial](https://supabase.com/docs/guides/cli)
2. Configure o acesso ao seu projeto:

```bash
supabase login
supabase link --project-ref rsvjnndhbyyxktbczlnk
```

3. Aplique a migration:

```bash
supabase db push
```

## Migration: 20250425_fix_user_registration.sql

Esta migration corrige problemas relacionados ao cadastro de usuários:

1. Torna o campo `phone` opcional na tabela `profiles`
2. Remove restrições de formato no campo de telefone
3. Melhora o trigger `handle_new_user` para ser mais tolerante a erros
4. Adiciona uma tabela `auth_logs` para facilitar a depuração

### O que esta migration resolve:

- Erro "Database error saving new user" durante o cadastro
- Problemas com formato de telefone
- Falhas silenciosas na criação de perfil após registro de usuário

### Após aplicar esta migration:

1. Teste o cadastro de novos usuários
2. Verifique se os perfis estão sendo criados corretamente
3. Consulte a tabela `auth_logs` para ver detalhes sobre as operações de autenticação
