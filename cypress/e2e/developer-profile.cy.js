// Tests focused on verifying the Developer profile functionality

describe('Developer Profile Diagnostics', () => {
  // Variáveis compartilhadas
  const developerEmail = 'mauro.lima@educacao.am.gov.br';
  const developerPassword = 'DevEduConnect2025!';
  const expectedDashboard = '/dev-dashboard';

  beforeEach(() => {
    // Limpar estado entre testes
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // FASE 1: Pré-requisitos e Verificação de Autenticação
  describe('Fase 1: Verificação de Usuário e Autenticação', () => {
    it('verifica se o usuário developer existe no Supabase', () => {
      // Obter valores do environment
      const supabaseUrl = Cypress.env('SUPABASE_URL') || 'https://rsvjnndhbyyxktbczlnk.supabase.co';
      const supabaseKey = Cypress.env('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4';
      
      // Verificar se o usuário existe na tabela user_profiles
      cy.request({
        method: 'GET',
        url: `${supabaseUrl}/rest/v1/user_profiles`,
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        qs: {
          select: 'auth_user_id,email,user_type,name',
          email: `eq.${developerEmail}`
        },
        failOnStatusCode: false
      }).then(response => {
        cy.log(`Status da verificação (user_profiles): ${response.status}`);
        cy.log(`Resposta: ${JSON.stringify(response.body)}`);
        
        if (response.status === 200 && response.body.length > 0) {
          cy.log('✅ Usuário encontrado na tabela user_profiles');
          cy.log(`Tipo do usuário: ${response.body[0].user_type}`);
        } else {
          cy.log('⚠️ Usuário não encontrado na tabela user_profiles');
        }
      });
    });

    it('tenta autenticar o usuário developer via API direta', () => {
      // Obter valores do environment
      const supabaseUrl = Cypress.env('SUPABASE_URL') || 'https://rsvjnndhbyyxktbczlnk.supabase.co';
      const supabaseKey = Cypress.env('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdmpubmRoYnl5eGt0YmN6bG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDk3NzksImV4cCI6MjA1ODk4NTc3OX0.AlM_iSptGQ7G5qrJFHU9OECu1wqH6AXQP1zOU70L0T4';
      
      // Tentar autenticação direta via API
      cy.request({
        method: 'POST',
        url: `${supabaseUrl}/auth/v1/token?grant_type=password`,
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: {
          email: developerEmail,
          password: developerPassword,
          grant_type: 'password'
        },
        failOnStatusCode: false
      }).then(response => {
        cy.log(`Status da autenticação: ${response.status}`);
        
        // Armazenar resposta completa incluindo corpo e headers
        const authResponse = {
          status: response.status,
          body: response.body,
          headers: response.headers,
          timestamp: new Date().toISOString()
        };
        
        // Salvar o resultado para análise posterior
        cy.writeFile('cypress/fixtures/auth-response-developer.json', authResponse);
        
        if (response.status === 200) {
          cy.log('✅ Autenticação API bem-sucedida');
        } else {
          cy.log(`⚠️ Erro de autenticação API: ${JSON.stringify(response.body)}`);
        }
      });
    });
  });

  // FASE 2: Interface do Usuário e Login Visual
  describe('Fase 2: Verificação de Interface e Tentativa de Login', () => {
    it('verifica elementos da UI na página de login', () => {
      cy.visit('/login');
      
      // Verificar elementos críticos
      cy.get('[data-cy="login-page"]').should('be.visible');
      cy.get('[data-cy="login-form"]').should('be.visible');
      cy.get('[data-cy="email-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.get('[data-cy="submit-button"]').should('be.visible');
      
      cy.log('✅ Elementos de UI da página de login verificados');
      
      // Capturar screenshot para análise
      cy.screenshot('developer-login-ui-elements');
    });

    it('tenta login via UI com monitoramento de rede', () => {
      cy.visit('/login');
      
      // Monitorar requisições de rede
      cy.intercept('POST', '**/auth/v1/token*').as('authRequest');
      
      // Inserir credenciais
      cy.get('[data-cy="email-input"]').clear().type(developerEmail);
      cy.get('[data-cy="password-input"]').clear().type(developerPassword);
      
      // Monitorar console para ver mensagens de erro
      cy.window().then(win => {
        cy.spy(win.console, 'error').as('consoleError');
      });
      
      // Clicar no botão de login
      cy.get('[data-cy="submit-button"]').click();
      
      // Verificar a requisição de autenticação
      cy.wait('@authRequest', { timeout: 10000 }).then(interception => {
        cy.log(`Status da requisição: ${interception.response?.statusCode}`);
        cy.log(`Corpo da requisição: ${JSON.stringify(interception.request.body)}`);
        cy.log(`Resposta de erro: ${JSON.stringify(interception.response?.body)}`);
        
        // Capturar detalhes do erro específico
        if (interception.response?.body?.error) {
          cy.log(`⚠️ Erro específico: ${interception.response.body.error}`);
          cy.log(`⚠️ Detalhes: ${interception.response.body.error_description}`);
        }
        
        // Capturar screenshot após tentativa
        cy.screenshot('developer-login-response-network');
      });
      
      // Verificar erros no console
      cy.get('@consoleError').then(errorSpy => {
        const errorCalls = errorSpy.getCalls();
        cy.log(`Número de erros no console: ${errorCalls.length}`);
        
        if (errorCalls.length > 0) {
          errorCalls.forEach((call, index) => {
            cy.log(`Erro de console ${index + 1}: ${JSON.stringify(call.args)}`);
          });
        }
      });
      
      // Verificar localStorage sem falhar o teste
      cy.window().then(win => {
        const authData = win.localStorage.getItem('supabase.auth.token');
        cy.log(`Auth data presente: ${!!authData}`);
        
        if (authData) {
          cy.log('✅ Dados de autenticação encontrados');
        } else {
          cy.log('⚠️ Sem dados de autenticação no localStorage');
        }
      });
    });
  });
});
