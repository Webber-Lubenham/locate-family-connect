describe('Fluxo de Login e Dashboard', () => {
  const testUsers = [
    {
      email: 'frankwebber33@hotmail.com',
      password: 'Escola2025!',
      expectedDashboard: '/parent-dashboard',
      description: 'Perfil de Pai'
    },
    {
      email: 'cetisergiopessoa@gmail.com',
      password: '4EG8GsjBT5KjD3k',
      expectedDashboard: '/student-dashboard',
      description: 'Perfil de Aluno'
    }
  ];

  testUsers.forEach(({ email, password, expectedDashboard, description }) => {
    it(`permite login e acesso ao dashboard (${description})`, () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit('/login');
      cy.get('[data-cy="login-page"]').should('be.visible');
      cy.get('[data-cy="login-form"]').should('be.visible');
      cy.get('[data-cy="login-title"]').should('be.visible');
      cy.get('[data-cy="email-input"]').should('be.visible').type(email);
      cy.get('[data-cy="password-input"]').should('be.visible').type(password);
      cy.get('[data-cy="submit-button"]').should('be.visible').click();
      cy.url({ timeout: 15000 }).should('include', expectedDashboard);
      cy.get('[data-cy="dashboard-container"]', { timeout: 10000 }).should('be.visible');
    });
  });
}); 