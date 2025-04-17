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

## 📝 Documentação

- [Drizzle ORM](https://orm.drizzle.team/)
- [Supabase](https://supabase.com/docs)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)

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

Este README foi atualizado em 17/04/2025

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
