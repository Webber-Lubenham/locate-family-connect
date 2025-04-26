# EduConnect - Sistema de Localização de Alunos

[![GitHub license](https://img.shields.io/github/license/FrankWebber33/educonnect-auth-system)](https://github.com/FrankWebber33/educonnect-auth-system/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/FrankWebber33/educonnect-auth-system)](https://github.com/FrankWebber33/educonnect-auth-system/issues)
[![GitHub stars](https://img.shields.io/github/stars/FrankWebber33/educonnect-auth-system)](https://github.com/FrankWebber33/educonnect-auth-system/stargazers)

O EduConnect é um sistema moderno e seguro de localização de alunos que permite que responsáveis acompanhem a localização de seus filhos/alunos em tempo real através de um mapa interativo.

## 🎯 Objetivo

O objetivo principal do EduConnect é:

- Permitir que responsáveis acompanhem a localização de seus filhos/alunos em tempo real
- Fornecer uma interface intuitiva e segura para visualização de localização
- Garantir a privacidade e segurança dos dados dos alunos
- Facilitar a comunicação entre responsáveis e instituições educacionais

## 🚀 Funcionalidades

- 🔐 Sistema de autenticação robusto com Supabase
- 👤 Perfis personalizados para responsáveis e alunos
- 🗺️ Visualização de localização em mapa interativo
- 📊 Histórico de localização
- 🔑 Sistema de permissões e privacidade
- 📱 Notificações em tempo real
- 📊 Relatórios detalhados de localização

## 🛠️ Tecnologias Utilizadas

- React 18
- TypeScript
- Supabase (Backend)
- Drizzle ORM
- Tailwind CSS
- Postgres
- Docker

## 📋 Requisitos

- Node.js 18+
- npm ou yarn
- Docker (opcional, para ambiente de desenvolvimento)
- Conta no Supabase

## 🚀 Como Executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/FrankWebber33/educonnect-auth-system.git
   cd educonnect-auth-system
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas credenciais do Supabase.

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse a aplicação em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
src/
├── components/         # Componentes React reutilizáveis
│   ├── RegisterForm/  # Componentes de registro
│   ├── LoginForm/     # Componentes de login
│   └── RegisterConfirmation/ # Componente de confirmação de registro
├── contexts/          # Contextos React
│   └── UserContext/   # Contexto de autenticação
├── lib/              # Configurações e utilitários
│   ├── db/          # Configuração do banco de dados
│   │   └── migrations/ # Migrações do banco de dados
│   └── supabase/    # Configuração do Supabase
└── types/           # Tipos TypeScript
```

## 🔐 Segurança

- Autenticação segura com Supabase
- Proteção de rotas
- Validação de dados
- Criptografia de senhas
- Sistema de sessões seguro

## 🔐 Fluxo de Autenticação

O sistema utiliza o Supabase Auth para gerenciar autenticação:

1. **Registro de Usuários**:
   - Cadastro com email/senha
   - Verificação por email
   - Opção de login social (Google, Facebook)

2. **Login**:
   - Autenticação por email/senha
   - Login com provedores sociais
   - Recuperação de senha

3. **Autorização**:
   - Sistema de roles (Admin, Responsável, Aluno)
   - Controle de acesso baseado em regras
   - Tokens JWT para sessões seguras

4. **Recuperação de Senha**:
   - Sistema automático de "Esqueci minha senha" via Supabase Auth
   - Fluxo seguro com links de uso único enviados por email
   - Implementação com as seguintes etapas:
     ```typescript
     // Solicitar redefinição de senha
     const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
       redirectTo: 'https://seuapp.com/reset-password'
     })
     
     // Na página de redefinição, atualizar a senha
     const { data, error } = await supabase.auth.updateUser({
       password: novaSenha
     })
     ```
   - Configuração de emails personalizados via painel do Supabase
   - Segurança com tokens de expiração automática
   - Proteção contra ataques de força bruta

## 📚 Análise do Projeto e Status Atual

O projeto EduConnect apresenta uma estrutura bem organizada, com separação clara entre componentes, páginas e serviços. Utiliza componentes funcionais React com hooks, gerenciamento de estado via Context API, e integração robusta com Supabase para backend e autenticação.

### Pontos Fortes

- Estrutura consistente e nomenclatura semântica
- Fluxo completo de autenticação e autorização
- Interface responsiva e design moderno com Tailwind CSS
- Segurança reforçada com criptografia, validação e proteção contra ataques comuns
- Otimização de performance com lazy loading e cache
- Documentação e comentários no código

### Pontos a Melhorar

- Cobertura de testes limitada, com necessidade de testes unitários e e2e
- Documentação parcial, recomendando atualização e ampliação
- Simplificação e unificação de dashboards e menus para melhor manutenção
- Padronização de feedback visual e redução de elementos redundantes

## 🛠️ Diagnóstico e Plano de Melhoria

### Diagnóstico

- Separação clara de responsabilidades, mas com redundâncias em dashboards e menus
- Design moderno e responsivo, porém com botões e menus redundantes
- Documentação rica, mas com necessidade de atualização e remoção de arquivos obsoletos

### Recomendações

- Unificar dashboards em um único componente parametrizado
- Simplificar menus e sidebars, removendo itens não essenciais
- Padronizar mensagens de erro e sucesso
- Atualizar documentação e remover scripts obsoletos
- Implementar testes unitários, integração e e2e
- Configurar CI/CD para garantir qualidade contínua

### Próximos Passos

1. Reunião para validação das sugestões
2. Priorização das melhorias
3. Prototipação visual (wireframes)
4. Implementação incremental das melhorias aprovadas

## 📝 Documentação

- [Drizzle ORM](https://orm.drizzle.team/)
- [Supabase](https://supabase.com/docs)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Edge Functions](docs/edge-functions.md)
- [Configuração do Resend](docs/configuracao-resend.md)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 🙏 Agradecimentos

- [Supabase](https://supabase.com/) - Backend como serviço
- [Drizzle ORM](https://orm.drizzle.team/) - ORM leve e rápido
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS

## 📞 Contato

- Email: frank.webber@educonnect.com
- GitHub: [FrankWebber33](https://github.com/FrankWebber33)

---

Este README foi atualizado em 23/04/2023

## 📚 Drizzle ORM Commands

### Instalação do Drizzle
Para instalar o Drizzle ORM, execute o seguinte comando:
```bash
npm install drizzle-orm
```

### Configuração
Certifique-se de que o arquivo `drizzle.config.ts` está configurado corretamente com as credenciais do banco de dados e o esquema.

### Comandos Comuns
- **Executar Migrações**:
```bash
npx drizzle-kit push
```
- **Gerar Migrações**:
```bash
npx drizzle-kit migrate
```
- **Verificar o Status das Migrações**:
```bash
npx drizzle-kit status
```
- **Reverter Migrações**:
```bash
npx drizzle-kit rollback
```

# Supabase Configuration
VITE_SUPABASE_URL=https://rsvjnndhbyyxktbczlnk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQwOTc3OSwiZXhwIjoyMDU4OTg1Nzc5fQ.cnmSutfsHLOWHqMpgIOv5fCHBI0jZG4AN5YJSeHDsEA

# Database Configuration
DATABASE_URL="postgresql://postgres.rsvjnndhbyyxktbczlnk:P+-@@6CUDUJSUpyJSUpy@aws-0-eu-west-2.pooler.supabase.com:6543/postgres"
VITE_DATABASE_URL="postgresql://postgres:postgres@db:5432/postgres"

# MapBox Configuration
VITE_MAPBOX_TOKEN=pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ
VITE_MAPBOX_STYLE_URL=mapbox://styles/mapbox/streets-v12
VITE_MAPBOX_INITIAL_CENTER=-23.5489,-46.6388
VITE_MAPBOX_INITIAL_ZOOM=12
SUPABASE_ACCESS_TOKEN=sbp_d3b5d49b51951b112fa5061d0443a82f8651474b
