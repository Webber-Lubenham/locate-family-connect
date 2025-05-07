# Instruções para Cypress e Git

## Cypress – Testes End-to-End

### 1. Pré-requisitos
- Certifique-se de que o servidor local está rodando em `http://localhost:8080/` (`npm run dev`).
- Tenha o Cypress instalado como dependência de desenvolvimento (`npm install cypress --save-dev`).

### 2. Estrutura dos Testes
- Para Cypress 9.x: coloque os testes em `cypress/integration/`
- Para Cypress 10+: coloque os testes em `cypress/e2e/`
- Exemplo de arquivo: `login.cy.js`

### 3. Arquivo de Configuração
- Cypress 9.x: crie `cypress.json` na raiz do projeto:
  ```json
  {
    "baseUrl": "http://localhost:8080",
    "integrationFolder": "cypress/integration"
  }
  ```
- Cypress 10+: crie `cypress.config.js` na raiz do projeto:
  ```js
  const { defineConfig } = require('cypress');
  module.exports = defineConfig({
    e2e: {
      baseUrl: 'http://localhost:8080',
      specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    },
  });
  ```

### 4. Exemplo de Teste de Login
```js
describe('Login - Perfis do Sistema', () => {
  const users = [
    {
      email: 'developer@sistema-monitore.com.br',
      password: 'DevEduConnect2025!',
      dashboardText: 'Painel do Desenvolvedor'
    },
    {
      email: 'frankwebber33@hotmail.com',
      password: 'Escola2025!',
      dashboardText: 'Painel do Responsável'
    },
    {
      email: 'cetisergiopessoa@gmail.com',
      password: '4EG8GsjBT5KjD3k',
      dashboardText: 'Painel do Aluno'
    }
  ];

  users.forEach((user) => {
    it(`deve logar com sucesso: ${user.email}`, () => {
      cy.visit('http://localhost:8080/');
      cy.get('[data-cy=email]').type(user.email);
      cy.get('[data-cy=password]').type(user.password);
      cy.get('[data-cy=login-button]').click();
      cy.contains(user.dashboardText, { timeout: 10000 }).should('be.visible');
    });
  });
});
```
- Ajuste os seletores `[data-cy=...]` conforme o frontend.

### 5. Rodando os Testes
- Abra um terminal na raiz do projeto.
- Execute:
  ```bash
  npx cypress open
  ```
  ou
  ```bash
  npx cypress run
  ```
- Selecione o teste `login.cy.js` e execute.

### 6. Troubleshooting
- Se aparecer erro de configuração, confira se o arquivo `cypress.json` ou `cypress.config.js` existe e está correto.
- Se houver erro de PostCSS, garanta que o arquivo `postcss.config.js` existe e está válido, ou remova referências a PostCSS dos testes.
- Limpe o cache do Cypress se necessário:
  ```bash
  npx cypress cache clear
  ```

---

## Git – Boas Práticas

### 1. Comandos Básicos
Sempre utilize:
```bash
git status
git add -A
git commit -m "mensagem detalhada [type: fix/feature/docs]"
git push
```

### 2. Mensagens de Commit
- Seja claro e objetivo.
- Use `[type: fix]` para correções, `[type: feature]` para novas funcionalidades, `[type: docs]` para documentação.

### 3. Fluxo de Trabalho
1. Faça `git pull` antes de começar uma nova tarefa.
2. Crie branches para features ou correções importantes.
3. Faça commits frequentes e descritivos.
4. Sempre revise o código antes de dar push.

### 4. Resolvendo Conflitos
- Use `git status` para identificar arquivos em conflito.
- Edite os arquivos, remova os marcadores de conflito e faça um novo commit.

---

**Dúvidas? Consulte este documento ou peça ajuda ao time!** 