# 🛡️ Development Rules — Locate-Family-Connect

## 1. 🧱 Project Structure and Architecture

### 1.1. 📁 File Organization
- `/src/pages/`: Componentes de página (Login, Dashboard, etc.)
- `/src/components/`: Componentes reutilizáveis
- `/src/context/`: Contextos React (UnifiedAuthContext)
- `/src/hooks/`: Custom hooks
- `/src/lib/`: Utilitários e configurações
- `/src/types/`: Tipos TypeScript
- `/supabase/functions/`: Edge Functions
- `/docs/`: Documentação

### 1.2. 📦 Component Structure
- Todos os componentes devem ter no máximo 50 linhas
- Usar apenas dois níveis de indentação
- Evitar uso de `else`
- Encapsular tipos primitivos
- Wrappar coleções em classes
- Usar um único ponto por linha
- Não abreviar nomes de variáveis e métodos

## 2. 🔐 Security Rules

### 2.1. 🛡️ Authentication
- Usar PKCE flow do Supabase Auth
- Implementar RLS policies no PostgreSQL
- Usar JWT para autenticação
- Validar tokens em Edge Functions

### 2.2. 🔑 Route Protection
- Usar AuthenticatedRoute para rotas protegidas
- Usar DeveloperRoute para rotas de desenvolvedor
- Implementar role-based access control
- Validar tipos de usuários em tempo real

## 3. 📦 Route Structure

### 3.1. 📋 Public Routes
- `/login` - Página de login
- `/register` - Registro de usuários
- `/password-recovery` - Recuperação de senha

### 3.2. 🔐 Protected Routes
- `/dashboard` - Dashboard principal
- `/student/dashboard` - Dashboard do estudante
- `/guardian/dashboard` - Dashboard do responsável
- `/student/map/:id` - Mapa do estudante

### 3.3. 👨‍💻 Developer Routes
- `/webhook-admin` - Administração de webhooks
- `/developer-flow` - Fluxo de desenvolvimento
- `/api-docs` - Documentação da API

### 3.4. 🔄 Redirect Routes
- `/` - Redireciona para `/dashboard` ou `/login`
- `/student-dashboard` - Redireciona para `/student/dashboard`
- `*` - Página 404 para rotas não encontradas

## 4. 📝 Documentation

### 4.1. 📄 API Documentation
- Usar OpenAPI 3.0 para documentação
- Manter arquivo `api-docs.yaml` atualizado
- Documentar todos os endpoints
- Incluir exemplos de uso

### 4.2. 📋 Code Documentation
- Manter README.md atualizado
- Documentar hooks e componentes
- Manter logs de diagnóstico
- Documentar integrações externas

## 5. 🛠️ Development Tools

### 5.1. 🛠️ Build Tools
- Vite para build e desenvolvimento
- TypeScript para tipagem
- React Router v6 para rotas
- TailwindCSS para estilização

### 5.2. 📦 Package Management
- npm para gerenciamento de pacotes
- Supabase CLI para Edge Functions
- Resend API para envio de emails

## 6. 🧪 Testing and Quality

### 6.1. 🧪 Testing
- Jest para testes unitários
- Cypress para testes e2e
- Jest globals para testes

### 6.2. 🛠️ Code Quality
- ESLint para linting
- TypeScript strict mode
- Jest para cobertura de código

## 7. 📱 User Experience

### 7.1. 📱 Responsive Design
- Usar TailwindCSS
- Componentes adaptativos
- Interface intuitiva
- Suporte a múltiplos idiomas

### 7.2. 🎯 User Flows
- Autenticação simplificada
- Navegação intuitiva
- Feedback visual
- Redirecionamentos claros

## 8. 📈 Performance

### 8.1. 🚀 Optimization
- Lazy loading de componentes
- Caching estratégico
- Otimização de rotas
- Redução de re-renders

### 8.2. 📊 Monitoring
- Logs de erros
- Métricas de performance
- Monitoramento de usuários
- Diagnósticos de problemas
