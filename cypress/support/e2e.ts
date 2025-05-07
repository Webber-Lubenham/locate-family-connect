import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import 'cypress-real-events/support';

// Import our unified auth context for testing
import { UnifiedAuthProvider } from '../../src/contexts/UnifiedAuthContext';
import { Toaster } from '../../src/components/ui/toaster';

// We need to wrap our tests with the auth provider
cy.intercept('GET', '/api/auth/session', {
  fixture: 'auth/session.json'
});

cy.intercept('GET', '/api/user', {
  fixture: 'user.json'
});

// Custom command to wrap elements with auth provider
Cypress.Commands.add('wrapWithAuthProvider', (element) => {
  return cy.wrap(
    <UnifiedAuthProvider>
      {element}
      <Toaster />
    </UnifiedAuthProvider>
  );
});

// Custom command to sign in with test credentials
Cypress.Commands.add('signIn', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/login');
  cy.get('[data-cy="email-input"]').type(email);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="submit-button"]').click();
});

// Custom command to sign out
Cypress.Commands.add('signOut', () => {
  cy.get('[data-cy="logout-button"]').click();
});

// Custom command to visit protected routes
Cypress.Commands.add('visitProtected', (url) => {
  cy.signIn();
  cy.visit(url);
});
