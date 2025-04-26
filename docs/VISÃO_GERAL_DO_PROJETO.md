# Visão Geral do Projeto locate-family-connect

## Estrutura Principal

- **docs/**: Documentação técnica, análises, diagnósticos, instruções de configuração, troubleshooting e histórico de decisões.
- **src/**: Código-fonte principal (React/TypeScript). Componentes de UI, hooks, integrações com Supabase, páginas e lógica de negócio.
- **node_modules/**: Dependências do projeto.
- **supabase/**: Infraestrutura Supabase (funções Edge, migrações, scripts de automação e integração).
- **scripts/**: Scripts auxiliares para automação (deploy, sincronização, testes, criação de usuários, etc).
- **dist/**: Arquivos gerados pelo build para deploy.
- **public/**: Arquivos estáticos públicos.

## Arquivos e Configurações Importantes

- **MIGRATIONS.md, README.md, diagnostico.md**: Documentação e instruções gerais.
- **package.json, package-lock.json**: Dependências, scripts e metadados do projeto.
- **.env, .env.example**: Variáveis de ambiente para Supabase, banco, MapBox, Resend, SMTP.
- **.gitignore**: Exclusão de arquivos/diretórios do controle de versão.
- **docker-compose.yml, Dockerfile**: Orquestração e build de ambiente via Docker.
- **tsconfig*.json, tailwind.config.*, postcss.config.js, eslint.config.js, vite.config.ts**: Configurações de ferramentas de build, lint, estilização e ambiente.
- **.mcp.json, .windsurfrules, blackbox_mcp_settings.json**: Configurações de automação e integração MCP/Windsurf.

## Funcionalidades e Integrações

- **Frontend moderno** com React/TypeScript, UI modular e responsiva, integração com MapBox.
- **Backend e banco** gerenciados via Supabase, com políticas de segurança (RLS), triggers e migrações versionadas.
- **Automação** de tarefas administrativas (deploy, testes, sincronização, migrações) via scripts JS/TS/MJS/BAT e Docker.
- **Integrações externas**: MapBox para mapas, Resend/SMTP para envio de emails.
- **Documentação detalhada** para onboarding, troubleshooting e evolução do projeto.

## Conclusão

O projeto locate-family-connect apresenta arquitetura moderna, modular e escalável, com integração robusta entre frontend, backend e serviços externos. A documentação é abrangente e o uso de automação (scripts e Docker) facilita o setup, manutenção e deploy. O projeto está bem estruturado para colaboração, evolução contínua e facilidade de troubleshooting.
