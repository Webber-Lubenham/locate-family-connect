# Guia para Teste Local da Implementação do Perfil "Developer"

Para testar localmente o perfil de desenvolvedor e todas as funcionalidades implementadas, vamos seguir um processo passo a passo:

## 1. Preparação do Ambiente

Primeiro, vamos garantir que o ambiente local esteja configurado corretamente:

```bash
# Instalar dependências (caso não tenha feito ainda)
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

## 2. Aplicar a Migração do Banco de Dados

Precisamos aplicar a nova migração que adiciona o perfil "developer":

```bash
# Aplicar a migração específica para o perfil developer
node scripts/apply-migration.js src/lib/db/migrations/008_add_developer_user_type.sql
```

Alternativamente, você pode aplicar a migração diretamente pelo Supabase CLI:

```bash
npx supabase migration up --db-url=postgresql://postgres:postgres@localhost:54322/postgres
```

## 3. Verificar a Criação do Usuário Developer

Após aplicar a migração, verifique se o usuário developer foi criado corretamente:

```bash
# Script para verificar usuários
node scripts/verify-user.js dev@educonnect.com
```

## 4. Testar o Login com Usuário Developer

Acesse o sistema através da interface de login:

1. Abra seu navegador e vá para `http://localhost:8080/login`
2. Faça login com as credenciais do desenvolvedor:
   - **Email**: dev@educonnect.com
   - **Senha**: DevEduConnect2025!

## 5. Verificar o Acesso às Rotas de Desenvolvedor

Após fazer login, verifique se você pode acessar as seguintes rotas:

- Dashboard principal: `http://localhost:8080/dev-dashboard`
- Painel Cypress: `http://localhost:8080/dev/cypress`
- Documentação de API: `http://localhost:8080/dev/api-docs`
- Explorador de Banco de Dados: `http://localhost:8080/dev/database`

## 6. Testar a Proteção de Rotas

Para verificar se a proteção de rotas está funcionando corretamente:

1. Faça logout (se estiver logado como desenvolvedor)
2. Faça login com uma conta comum (estudante ou responsável)
3. Tente acessar diretamente as rotas de desenvolvedor através da URL
4. Verifique se você é redirecionado para o dashboard padrão

## 7. Testar as Funcionalidades Específicas

### Dashboard de Desenvolvedor
- Verifique se todos os cards estão sendo exibidos
- Teste os links para as diferentes ferramentas

### Painel Cypress
- Teste a navegação entre as abas
- Verifique se os botões de execução de testes estão visíveis

### Documentação de API
- Verifique se a documentação expandida é exibida
- Teste a navegação entre Swagger UI, Schema e Endpoints

### Explorador de Banco de Dados
- Verifique se as opções de visualização do esquema estão disponíveis
- Teste os botões para gerenciamento de dados

## 8. Testar com Cypress

Você também pode usar os testes Cypress para verificar a implementação:

```bash
# Executar testes Cypress específicos para o perfil developer
npx cypress run --spec "cypress/e2e/developer-role.cy.js"
```

Se o arquivo de teste específico ainda não existir, você pode criá-lo seguindo o padrão dos testes existentes.

## 9. Solução de Problemas Comuns

Se encontrar algum problema durante os testes, verifique:

1. **Erro de login**: Confirme se o usuário foi criado corretamente no banco
2. **Acesso negado**: Verifique se o campo `user_metadata.user_type` está definido como "developer"
3. **Componentes não renderizados**: Verifique o console do navegador para erros
4. **Redirecionamento incorreto**: Verifique a implementação do componente `DeveloperRoute`

## 10. Próximos Passos Após os Testes

Após confirmar que tudo está funcionando corretamente:

1. Documente quaisquer problemas encontrados
2. Faça os ajustes necessários no código
3. Commit das alterações finais
4. Atualize a documentação com informações adicionais, se necessário

Esse processo de teste abrangente garantirá que a implementação do perfil de desenvolvedor esteja funcionando conforme esperado em seu ambiente local antes de ser implantada em ambientes de produção.
