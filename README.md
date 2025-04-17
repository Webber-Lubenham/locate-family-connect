## EduConnect - Sistema de Autenticação

O EduConnect é um sistema educacional moderno e eficiente que conecta estudantes e professores em um ambiente virtual de aprendizagem. Este repositório contém o sistema de autenticação do projeto, responsável por gerenciar o acesso e as interações dos usuários na plataforma.

## Objetivo

O objetivo principal do EduConnect é:

- Fornecer uma plataforma educacional moderna e acessível
- Facilitar a comunicação entre estudantes e professores
- Oferecer recursos de aprendizagem interativos e eficientes
- Gerenciar o conteúdo educacional de forma organizada
- Promover a colaboração e o engajamento entre os usuários

## Funcionalidades

- Sistema de autenticação robusto com Supabase
- Perfis personalizados para estudantes e professores
- Interface moderna e responsiva
- Gerenciamento de conteúdo educacional
- Sistema de comunicação integrado
- Relatórios e métricas de desempenho

## Tecnologias Utilizadas

- React 18
- TypeScript
- Supabase (Backend)
- Drizzle ORM
- Tailwind CSS
- Docker (para ambiente de desenvolvimento)

## Requisitos

- Node.js 18+
- npm ou yarn
- Docker e Docker Compose (opcional, para ambiente de desenvolvimento)

## Como Executar

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

## Estrutura do Projeto

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
├── pages/            # Páginas da aplicação
│   ├── Login/       # Página de login
│   ├── Register/    # Página de registro
│   └── StudentDashboard/ # Dashboard do estudante
└── types/           # Tipos TypeScript
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Autor

Desenvolvido por Frank Webber

---

Este README foi atualizado em 17/04/2025

## Drizzle ORM Commands

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
