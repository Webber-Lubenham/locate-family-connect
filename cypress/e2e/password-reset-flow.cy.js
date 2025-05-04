/**
 * Testes de fluxo completo de recuperação de senha
 * Inclui solicitação, recebimento de email e redefinição
 */

describe('Fluxo de Recuperação de Senha', () => {
  // Email de teste para recuperação
  const testEmail = 'teste-recuperacao@example.com';
  
  beforeEach(() => {
    // Limpar estado
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visitar página de login
    cy.visit('/login', { timeout: 10000 });
    cy.get('[data-cy="login-page"]', { timeout: 10000 }).should('be.visible');
  });

  it('deve exibir e navegar para o formulário de recuperação de senha', () => {
    // Navegar para recuperação de senha
    cy.get('[data-cy="forgot-password-link"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Verificar se o formulário de recuperação está visível
    cy.get('[data-cy="forgot-password-form"]', { timeout: 10000 })
      .should('be.visible');
    
    // Verificar se o título da tela mudou
    cy.get('[data-cy="login-title"]')
      .should('be.visible')
      .and('contain.text', 'Recuperar Senha');
    
    // Verificar elementos do formulário
    cy.get('[data-cy="email-input"]').should('be.visible');
    cy.get('[data-cy="submit-button"]').should('be.visible');
    cy.get('[data-cy="back-to-login"]').should('be.visible');
  });

  it('deve validar o email antes de enviar', () => {
    // Navegar para recuperação de senha
    cy.get('[data-cy="forgot-password-link"]').click();
    
    // Tentar enviar formulário vazio
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar mensagem de erro
    cy.get('body').should('contain.text', 'obrigatório');
    
    // Inserir email inválido
    cy.get('[data-cy="email-input"]').type('email-invalido');
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar mensagem de erro de formato
    cy.get('body').should('contain.text', 'válido');
  });

  it('deve permitir solicitar recuperação com email válido', () => {
    // Intercept de solicitação de redefinição para simular sucesso
    cy.intercept('POST', '**/auth/v1/recover*', {
      statusCode: 200,
      body: {}
    }).as('passwordRecovery');
    
    // Navegar para recuperação de senha
    cy.get('[data-cy="forgot-password-link"]').click();
    
    // Preencher com email válido
    cy.get('[data-cy="email-input"]').type(testEmail);
    
    // Submeter formulário
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar requisição
    cy.wait('@passwordRecovery').its('request.body').should('include', {
      email: testEmail
    });
    
    // Verificar mensagem de confirmação
    cy.get('[data-cy="success-message"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Email enviado');
  });

  it('deve permitir voltar para o login', () => {
    // Navegar para recuperação de senha
    cy.get('[data-cy="forgot-password-link"]').click();
    
    // Clicar no botão de voltar
    cy.get('[data-cy="back-to-login"]').click();
    
    // Verificar se voltou para tela de login
    cy.get('[data-cy="login-title"]')
      .should('be.visible')
      .and('contain.text', 'Entrar');
  });

  it('deve validar o token de recuperação na URL', () => {
    // Simular acesso direto à página de redefinição com token
    const mockToken = 'mock-valid-token-123456';
    cy.visit(`/reset-password?token=${mockToken}`);
    
    // Verificar se o formulário de redefinição está visível
    cy.get('[data-cy="reset-password-form"]', { timeout: 10000 })
      .should('be.visible');
    
    // Verificar campos de nova senha
    cy.get('[data-cy="new-password-input"]').should('be.visible');
    cy.get('[data-cy="confirm-password-input"]').should('be.visible');
    cy.get('[data-cy="submit-button"]').should('be.visible');
  });

  // Test que simula fluxo completo incluindo email
  it('deve completar o fluxo completo de recuperação de senha', () => {
    // Intercept da API de recuperação
    cy.intercept('POST', '**/auth/v1/recover*', {
      statusCode: 200,
      body: {}
    }).as('passwordRecovery');
    
    // Intercept da API de redefinição
    cy.intercept('PUT', '**/auth/v1/user', {
      statusCode: 200,
      body: {}
    }).as('passwordReset');
    
    // Iniciar recuperação
    cy.get('[data-cy="forgot-password-link"]').click();
    cy.get('[data-cy="email-input"]').type(testEmail);
    cy.get('[data-cy="submit-button"]').click();
    
    // Esperar confirmação
    cy.wait('@passwordRecovery');
    cy.get('[data-cy="success-message"]', { timeout: 10000 }).should('be.visible');
    
    // Simular acesso ao link de recuperação enviado por email
    const mockToken = 'mock-valid-token-123456';
    cy.visit(`/reset-password?token=${mockToken}`);
    
    // Preencher nova senha
    cy.get('[data-cy="new-password-input"]').type('NovaSenha2025!');
    cy.get('[data-cy="confirm-password-input"]').type('NovaSenha2025!');
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar mensagem de sucesso
    cy.wait('@passwordReset');
    cy.get('[data-cy="success-message"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'alterada com sucesso');
    
    // Verificar redirecionamento para login
    cy.url().should('include', '/login');
  });
});
