# Plano de Teste E2E com Cypress

## Objetivo
Garantir a robustez, usabilidade e segurança dos fluxos críticos do sistema Locate-Family-Connect, especialmente localização, clustering de marcadores, histórico e compartilhamento, utilizando testes automatizados com Cypress.

---

## Escopo dos Testes
- Autenticação (login/logout)
- Compartilhamento de localização
- Renderização do mapa e marcadores (incluindo clusters)
- Histórico de localizações
- Navegação entre dashboards (estudante, responsável)
- Fluxos de erro e mensagens de feedback

---

## Pré-requisitos
- Servidor de desenvolvimento rodando (`npm run dev`)
- Cypress instalado (versão 9.x)
- Configuração correta do arquivo `cypress.json` com a porta do servidor (`baseUrl`)
- Testes localizados em `cypress/integration/`

---

## Estrutura dos Testes

### 1. Autenticação
- Login com usuário válido
- Logout
- Feedback de erro para credenciais inválidas

### 2. Compartilhamento de Localização
- Acesso ao dashboard do estudante
- Mock da API de geolocalização
- Clique no botão de compartilhar localização
- Verificação de feedback (toast, diálogo, status)
- Verificação de atualização das coordenadas

### 3. Renderização do Mapa e Clustering
- Verificar se o mapa é exibido (`[data-cy="location-map-container"]`)
- Verificar se há pelo menos um marcador de cluster (`[data-cy="cluster-marker"]`) ou individual (`[data-cy="single-marker"]`)
- Clicar em um cluster e verificar zoom

### 4. Histórico de Localizações
- Acesso ao histórico
- Verificação de itens ou estado vazio
- Verificação de datas, coordenadas e detalhes

### 5. Navegação
- Troca entre dashboards e páginas
- Verificação de rotas ativas

### 6. Fluxos de Erro
- Simulação de falha de rede
- Simulação de dados inválidos
- Verificação de mensagens de erro amigáveis

---

## Exemplo de Comando para Rodar Teste
```bash
npx cypress run --spec "cypress/integration/location-sharing.cy.js"
```

---

## Critérios de Sucesso
- Todos os testes devem passar sem falhas críticas
- O erro `_data$event.startsWith is not a function` deve ser ignorado nos testes
- O sistema deve exibir feedback visual claro para todas as ações
- Clusters e marcadores devem ser renderizados corretamente
- O histórico deve refletir as ações do usuário

---

## Troubleshooting
- Se o Cypress não encontrar os testes, verifique se estão em `cypress/integration/`
- Se o servidor não estiver rodando, inicie com `npm run dev`
- Se ocorrer erro de `.startsWith`, garanta que há verificação de tipo antes de usar esse método
- Use o patch de erro no `cypress/support/e2e.js` para ignorar erros conhecidos

---

## Observações
- Atualize este plano conforme novos fluxos e testes forem adicionados
- Mantenha os dados de teste (usuários, senhas) seguros e atualizados
- Documente qualquer workaround ou patch temporário aplicado nos testes

---

**Última atualização:** 2025-05-07 