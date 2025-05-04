describe('Página inicial', () => {
  it('deve carregar a página de login corretamente', () => {
    cy.visit('/login');
    
    // Verifica elementos que existem na atual implementação
    cy.get('[data-cy="login-page"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="login-container"]', { timeout: 10000 }).should('be.visible');
    
    // Verifica se o formulário de login está visível
    cy.get('[data-cy="login-form"]', { timeout: 10000 }).should('be.visible');
    
    // Verifica campos de email e senha
    cy.get('[data-cy="email-input"]', { timeout: 10000 }).should('exist');
    cy.get('[data-cy="password-input"]', { timeout: 10000 }).should('exist');
  });
});