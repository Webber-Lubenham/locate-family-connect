# Tipo de Usuário "Developer" - Documentação

## Descrição

O tipo de usuário "developer" foi implementado para facilitar o acesso a ferramentas de desenvolvimento, diagnóstico e documentação. Este papel é restrito a administradores do sistema e não é acessível através do fluxo de registro normal.

## Características Principais

- Acesso a painéis de diagnóstico e ferramentas de desenvolvedores
- Visualização de documentação técnica completa
- Acesso a testes Cypress e funcionalidades de depuração
- Exploração do banco de dados e ferramentas de administração

## Implementação Técnica

### Banco de Dados

A migração `008_add_developer_user_type.sql` adiciona suporte ao tipo "developer" no banco de dados Supabase, criando automaticamente um usuário desenvolvedor de exemplo com as seguintes credenciais:

- **Email**: dev@educonnect.com
- **Senha**: DevEduConnect2025!

> ⚠️ **IMPORTANTE**: Altere esta senha em ambientes de produção!

### Tipos e Utilidades

O módulo `src/lib/types/user-types.ts` define o tipo "developer" e fornece utilidades para verificação de tipos de usuário.

```typescript
export type UserType = 'student' | 'parent' | 'developer';
```

### Autenticação e Controle de Acesso

Os hooks em `src/hooks/use-developer.ts` fornecem ferramentas para verificar e controlar o acesso baseado em tipo de usuário:

```typescript
// Verificar se o usuário atual é um desenvolvedor
export function useIsDeveloper() {
  return useIsUserType('developer');
}
```

### Proteção de Rotas

O componente `DeveloperRoute` em `src/components/DeveloperRoute.tsx` protege rotas para que apenas desenvolvedores possam acessá-las:

```tsx
<Route path="/dev-dashboard" element={
  <DeveloperRoute>
    <DevDashboard />
  </DeveloperRoute>
} />
```

## Rotas e Funcionalidades

| Rota | Descrição | Funcionalidades |
|------|-----------|----------------|
| `/dev-dashboard` | Painel principal para desenvolvedores | Acesso a todas as ferramentas de desenvolvedor |
| `/dev/cypress` | Painel de testes Cypress | Execução e monitoramento de testes E2E |
| `/dev/api-docs` | Documentação completa da API | Swagger UI, esquema do banco, endpoints |
| `/dev/database` | Explorador de banco de dados | Visualização e manipulação do banco de dados |

## Criação de Usuários Developer

Novos usuários desenvolvedores só podem ser criados através do banco de dados ou pela aplicação por outros desenvolvedores. O processo consiste em:

1. Adicionar o usuário via Supabase Auth
2. Definir `user_metadata.user_type` como "developer"
3. Criar um perfil correspondente na tabela `profiles`

## Indicações Visuais

Usuários desenvolvedores têm indicações visuais especiais na interface:

- Badge "Developer Mode" em diversas telas
- Menu adicional de ferramentas de desenvolvedor
- Acesso a painéis e controles avançados

## Considerações de Segurança

- Os usuários desenvolvedores têm acesso a funcionalidades que podem modificar dados
- Considere restringir o acesso a desenvolvedores em ambientes de produção
- Implemente registros de auditoria para ações de usuários desenvolvedores
- Mantenha a lista de desenvolvedores o mais restrita possível

## Como Usar

1. Faça login com o usuário desenvolvedor criado (dev@educonnect.com)
2. Acesse o dashboard de desenvolvedor em `/dev-dashboard`
3. Navegue pelas diferentes ferramentas e painéis disponíveis

## Adição de Novas Ferramentas

Para adicionar novas ferramentas ao painel de desenvolvedor:

1. Crie a página ou componente da nova ferramenta
2. Adicione uma rota protegida em `App.tsx` usando o componente `DeveloperRoute`
3. Adicione um card de acesso no `DevDashboard.tsx`
