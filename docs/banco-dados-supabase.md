# Relatório do Banco de Dados Supabase

## Estrutura do Banco de Dados

### Tabela: users
**Tamanho:** 80KB
**Registros:** 3

| Campo         | Tipo de Dado          | Obrigatório | Único | Descrição |
|---------------|----------------------|-------------|-------|-----------|
| id            | integer              | Sim         | Não   | Chave primária |
| email         | text                 | Sim         | Sim   | Email do usuário |
| user_type     | text                 | Sim         | Não   | Tipo de usuário |
| created_at    | timestamp with time zone | Sim | Não | Data/hora de criação |
| updated_at    | timestamp with time zone | Sim | Não | Data/hora de atualização |

### Tabela: profiles
**Tamanho:** 88KB

| Campo         | Tipo de Dado          | Obrigatório | Único | Descrição |
|---------------|----------------------|-------------|-------|-----------|
| id            | integer              | Sim         | Não   | Chave primária |
| full_name     | text                 | Sim         | Não   | Nome completo do usuário |
| phone         | varchar              | Não         | Não   | Número de telefone |
| user_type     | text                 | Sim         | Não   | Tipo de usuário |
| created_at    | timestamp with time zone | Sim | Não | Data/hora de criação |
| updated_at    | timestamp with time zone | Sim | Não | Data/hora de atualização |
| email         | text                 | Sim         | Não   | Email do usuário |

## Tabelas do Sistema de Autenticação

### auth.users
Tabela padrão do Supabase para gerenciamento de usuários autenticados.

### auth.refresh_tokens
Gerencia os tokens de refresh para autenticação.

### auth.instances
Gerencia as sessões de autenticação ativas.

### auth.audit_log_entries
Registra o histórico de auditoria do sistema de autenticação.

### pgsodium.key
Tabela do sistema pgsodium para gerenciamento de chaves de criptografia.

## Observações

1. O sistema utiliza um modelo de separação entre usuários e perfis:
   - Tabela `users`: Armazena informações básicas de autenticação
   - Tabela `profiles`: Armazena informações detalhadas do perfil do usuário

2. Todas as tabelas possuem campos de auditoria (created_at e updated_at)

3. O sistema utiliza chaves estrangeiras para relacionar as tabelas

4. O sistema de autenticação está integrado com o Supabase Auth

5. Há implementação de criptografia através do sistema pgsodium

## Recomendações

1. Manter backups regulares do banco de dados
2. Monitorar o crescimento das tabelas
3. Implementar limpeza de logs antigos
4. Manter atualizações de segurança do sistema de autenticação
5. Revisar regularmente o histórico de auditoria
