# Sistema de Sincronização de Usuários

## Problema Identificado

Foi identificado um problema de integridade nos dados dos usuários, onde existiam usuários no sistema de autenticação do Supabase (auth.users) que não tinham registros correspondentes nas tabelas `users` e `profiles` do nosso sistema.

## Solução Implementada

### 1. Script de Sincronização

Foi criado um script em TypeScript (`scripts/sync-users.ts`) que:
- Busca todos os usuários do Supabase Auth
- Verifica se já existem registros nas tabelas `users` e `profiles`
- Cria registros faltantes
- Atualiza informações existentes

Para executar o script:
```bash
node scripts/sync-users.ts
```

### 2. Trigger Automático

Foi criado um trigger no banco de dados que:
- Executa automaticamente quando um novo usuário é criado no Supabase Auth
- Cria um registro correspondente na tabela `users`
- Cria/atualiza o perfil do usuário na tabela `profiles`

### 3. Verificação de Integridade

Foi criada uma função SQL (`verify_user_integrity()`) que:
- Verifica todos os usuários do sistema
- Identifica usuários faltantes
- Detecta dados incompletos
- Gera relatório de integridade

## Como Usar

### Sincronização Inicial
1. Execute o script de sincronização:
```bash
node scripts/sync-users.ts
```

### Verificação de Integridade
Execute a função no banco de dados:
```sql
SELECT * FROM verify_user_integrity();
```

### Manutenção Automática
O trigger manterá a sincronização automática após a primeira execução do script.

## Recomendações

1. Executar o script de sincronização inicialmente
2. Verificar a integridade dos dados regularmente
3. Monitorar logs de erros
4. Manter backups regulares

## Segurança

- O script usa variáveis de ambiente para conexão com o banco
- O trigger é executado com permissões mínimas necessárias
- A função de verificação não modifica dados, apenas os verifica

## Manutenção

- O script deve ser executado sempre que houver mudanças significativas no sistema
- O trigger deve ser revisado se houver alterações na estrutura das tabelas
- A função de verificação deve ser atualizada se novos campos forem adicionados
