# EduConnect - Sistema de Autenticação e Localização de Alunos

## Descrição
EduConnect é um sistema web que permite o cadastro e autenticação de alunos e responsáveis, além de oferecer funcionalidades de localização em tempo real. O sistema é construído com React, TypeScript e utiliza Supabase como backend.

## Estrutura do Projeto
```
educonnect-auth-system/
├── src/
│   ├── components/      # Componentes React reutilizáveis
│   ├── contexts/        # Contextos React para gerenciamento de estado
│   ├── hooks/          # Custom hooks React
│   ├── layouts/        # Layouts principais da aplicação
│   ├── pages/          # Páginas da aplicação
│   ├── utils/          # Funções utilitárias
│   └── lib/            # Configurações e integrações
├── public/             # Arquivos estáticos
└── supabase/          # Configurações do Supabase
```

## Funcionalidades

### Autenticação
- Cadastro de usuários (alunos e responsáveis)
- Login com email e senha
- Validação de senhas (mínimo 8 caracteres)
- Formatação automática de números de telefone (formato UK)

### Cadastro
- Nome completo
- Email (validação de formato)
- Senha e confirmação de senha
- Número de telefone (formato UK)
- Responsáveis podem adicionar múltiplos emails de alunos

### Navegação
- Interface responsiva
- Menu de navegação
- Páginas separadas para alunos e responsáveis

## Configuração do Ambiente

### Pré-requisitos
- Node.js (versão LTS)
- npm ou yarn

### Instalação
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
- Crie um arquivo `.env` na raiz do projeto
- Adicione as seguintes variáveis:
```
VITE_SUPABASE_URL=seu_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_SUPABASE_SERVICE_KEY=sua_chave_service

# Configurações do MapBox (se aplicável)
VITE_MAPBOX_TOKEN=sua_chave_mapbox
VITE_MAPBOX_STYLE_URL=url_do_estilo
VITE_MAPBOX_INITIAL_CENTER=latitude,longitude
VITE_MAPBOX_INITIAL_ZOOM=nivel_de_zoom
```

### Executando o Projeto
```bash
npm run dev  # Modo de desenvolvimento
npm run build # Build para produção
npm run preview # Prévia do build
```

## Como Usar

### Cadastro
1. Acesse a página de cadastro
2. Selecione o tipo de usuário (aluno ou responsável)
3. Preencha os campos obrigatórios:
   - Nome completo
   - Email
   - Senha (mínimo 8 caracteres)
   - Confirmação da senha
   - Número de telefone (formato UK: +44 XXXX XXXXXX)
4. Responsáveis podem adicionar múltiplos emails de alunos
5. Clique em "Cadastrar"

### Login
1. Acesse a página de login
2. Insira seu email e senha
3. Clique em "Entrar"

## Status Atual do Projeto

### Progresso Realizado
1. **Configuração Inicial**
   - Configuração do ambiente de desenvolvimento com Node.js e npm
   - Configuração do Docker para ambiente de desenvolvimento
   - Integração com Supabase para autenticação
   - Configuração inicial do PostgreSQL para armazenamento de dados

2. **Desenvolvimento Frontend**
   - Estrutura básica do projeto com React e TypeScript
   - Componentes de autenticação (login e cadastro)
   - Validação de formulários
   - Formatação de números de telefone (formato UK)
   - Interface responsiva

3. **Configurações de Banco de Dados**
   - Configuração do PostgreSQL com Docker
   - Tentativas de conexão com Drizzle ORM
   - Configuração de variáveis de ambiente

### Desafios Enfrentados
1. **Conexão com PostgreSQL**
   - Dificuldades na configuração da conexão via Drizzle ORM
   - Problemas com autenticação do PostgreSQL
   - Desafios na comunicação entre containers Docker

2. **Configuração do Drizzle**
   - Problemas com a geração de migrações
   - Dificuldades na aplicação das migrações
   - Erros de conexão com o banco de dados

### Próximos Passos de Desenvolvimento

1. **Resolução de Conexão com PostgreSQL**
   - Finalizar configuração do PostgreSQL
   - Implementar migrações com Drizzle ORM
   - Garantir integração com o banco de dados

2. **Desenvolvimento de Funcionalidades**
   - Implementar sistema de localização
   - Desenvolver painel de administração
   - Implementar notificações em tempo real
   - Adicionar funcionalidades de relatórios

3. **Melhorias na Autenticação**
   - Implementar recuperação de senha
   - Adicionar autenticação via email
   - Implementar sistema de tokens
   - Adicionar verificação de email

4. **Otimizações e Melhorias**
   - Implementar cache para melhor performance
   - Otimizar carregamento de dados
   - Adicionar testes unitários
   - Implementar monitoramento de erros

5. **Preparação para Produção**
   - Configurar variáveis de ambiente para produção
   - Implementar logs de produção
   - Configurar backup do banco de dados
   - Preparar ambiente de staging

## Arquitetura

### Frontend
- **Tecnologias**: React, TypeScript, Tailwind CSS
- **Componentes Principais**:
  - `RegisterForm`: Formulário de cadastro
  - `LoginForm`: Formulário de login
  - `Map`: Componente de mapa (se aplicável)
  - `Navbar`: Barra de navegação

### Backend (Supabase)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL
- **API**: Supabase API

### Comunicação
1. **Autenticação**:
   - O frontend se comunica com o Supabase Auth via API
   - Os dados do usuário são armazenados no banco de dados
   - O estado de autenticação é gerenciado via context

2. **Dados do Usuário**:
   - As informações do usuário são armazenadas no Supabase
   - O frontend faz requisições para obter e atualizar dados
   - Os dados são validados tanto no frontend quanto no backend

## Contribuição
1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença
Este projeto está sob a licença MIT.
