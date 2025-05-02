describe('Página inicial', () => {
  it('deve carregar o título da aplicação', () => {
    cy.visit('/login');
    cy.get('[data-cy="login-title"]', { timeout: 10000 }).should('be.visible');
  });
}); 