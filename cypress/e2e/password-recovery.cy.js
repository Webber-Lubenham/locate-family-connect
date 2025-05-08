describe('Recuperação de Senha', () => {
  it('permite solicitar recuperação de senha para usuário existente', () => {
    cy.visit('/password-recovery');
    cy.get('[data-cy="password-recovery-form"]').should('be.visible');
    cy.get('[data-cy="email-input"]').type('frankwebber33@hotmail.com');
    cy.get('[data-cy="submit-button"]').click();

    // Aguarda mensagem de sucesso exibida na página
    cy.get('[data-cy="success-message"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Se uma conta existir com esse email');
  });

  it('exibe mensagem de sucesso mesmo para email não cadastrado', () => {
    cy.visit('/password-recovery');
    cy.get('[data-cy="password-recovery-form"]').should('be.visible');
    cy.get('[data-cy="email-input"]').type('naoexiste+' + Date.now() + '@sistema-monitore.com.br');
    cy.get('[data-cy="submit-button"]').click();

    // Aguarda mensagem de sucesso exibida na página
    cy.get('[data-cy="success-message"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Se uma conta existir com esse email');
  });
}); 