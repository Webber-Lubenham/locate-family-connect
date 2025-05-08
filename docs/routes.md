# Documentação das Rotas do Locate Family Connect

## Rotas Públicas

### `/login`
- Página de login do sistema
- Acesso público
- Não requer autenticação

### `/register`
- Página de registro de novos usuários
- Acesso público
- Não requer autenticação

### `/password-recovery`
- Página de recuperação de senha
- Acesso público
- Não requer autenticação

## Rotas Protegidas

### `/dashboard`
- Dashboard principal do sistema
- Acesso protegido
- Requer autenticação
- Acesso permitido para todos os tipos de usuários

### `/student/dashboard`
- Dashboard específico para estudantes
- Acesso protegido
- Requer autenticação
- Acesso permitido apenas para usuários do tipo 'student'

### `/student-dashboard`
- Redirecionamento para `/student/dashboard`
- Acesso protegido
- Requer autenticação
- Acesso permitido apenas para usuários do tipo 'student'

### `/guardian/dashboard`
- Dashboard específico para responsáveis
- Acesso protegido
- Requer autenticação
- Acesso permitido apenas para usuários do tipo 'parent' ou 'guardian'

### `/student/map/:id`
- Página de visualização do mapa do estudante
- Acesso protegido
- Requer autenticação
- Acesso permitido apenas para usuários do tipo 'student'
- Parâmetro `:id` - ID do estudante

## Rotas de Desenvolvedor

### `/webhook-admin`
- Página de administração de webhooks
- Acesso protegido
- Requer autenticação
- Acesso permitido apenas para usuários do tipo 'developer'

### `/developer-flow`
- Página de fluxo de desenvolvimento
- Acesso protegido
- Requer autenticação
- Acesso permitido apenas para usuários do tipo 'developer'

## Rota de Documentação

### `/api-docs`
- Documentação da API do sistema
- Acesso protegido
- Requer autenticação
- Acesso permitido apenas para usuários do tipo 'developer'

## Rotas de Redirecionamento

### `/` (raiz)
- Página inicial do sistema
- Comportamento:
  - Se usuário autenticado: redireciona para `/dashboard`
  - Se usuário não autenticado: redireciona para `/login`
  - Exibe loading spinner durante verificação

### `*` (wildcard)
- Página de erro 404
- Exibida quando nenhuma rota é encontrada

## Rotas de Compatibilidade

### `/webhook-admin`
- Redireciona para `/admin/webhook`
- Mantida para compatibilidade com versões anteriores
- Acesso protegido
- Requer autenticação
- Acesso permitido apenas para usuários do tipo 'developer'

## Componentes de Rota

- `AuthenticatedRoute`: Componente que protege as rotas baseado no tipo de usuário
- `DeveloperRoute`: Componente que protege as rotas de desenvolvimento
- `RouterProvider`: Gerenciador de rotas do React Router v6
- `createBrowserRouter`: Função que cria o roteador do React Router v6

## Notas de Segurança

- Todas as rotas protegidas são validadas através do `AuthenticatedRoute`
- Rotas de desenvolvedor têm acesso restrito apenas para usuários do tipo 'developer'
- Redirecionamentos são implementados usando `Navigate` do React Router
- A rota raiz (`/`) tem tratamento especial para loading e redirecionamento
