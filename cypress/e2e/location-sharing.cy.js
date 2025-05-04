/**
 * Testes para a funcionalidade de compartilhamento de localização
 * Foco nas implementações refatoradas recentemente
 */

describe('Compartilhamento de Localização', () => {
  // Usuário estudante para teste
  const studentUser = {
    email: 'cetisergiopessoa@gmail.com',
    password: '4EG8GsjBT5KjD3k'
  };

  beforeEach(() => {
    // Limpar estado e fazer login como estudante
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('/login', { timeout: 10000 });
    cy.get('[data-cy="email-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(studentUser.email, { delay: 50 });
    
    cy.get('[data-cy="password-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(studentUser.password, { delay: 50 });
    
    cy.get('[data-cy="submit-button"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Aguardar redirecionamento para o dashboard do estudante
    cy.url({ timeout: 30000 }).should('include', '/student-dashboard');
  });

  it('exibe componentes de localização no dashboard do estudante', () => {
    // Verificar se o mapa está presente
    cy.get('[data-cy="location-map"]', { timeout: 15000 })
      .should('exist');
    
    // Verificar botão de compartilhar localização
    cy.get('[data-cy="share-location-button"]', { timeout: 10000 })
      .should('be.visible');
    
    cy.log('✅ Componentes de localização verificados');
  });

  it('permite compartilhar localização atual', () => {
    // Antes de clicar no botão, verificamos se o LocationService está carregado
    // Mock da API de geolocalização para simular posição
    cy.window().then((win) => {
      // Mock da API de geolocalização
      const mockGeolocation = {
        getCurrentPosition: (callback) => {
          callback({
            coords: {
              latitude: -3.1190275,
              longitude: -60.0217314,
              accuracy: 10
            }
          });
        },
        watchPosition: () => 123
      };
      
      cy.stub(win.navigator.geolocation, 'getCurrentPosition')
        .callsFake(mockGeolocation.getCurrentPosition);
      
      cy.stub(win.navigator.geolocation, 'watchPosition')
        .callsFake(mockGeolocation.watchPosition);
      
      cy.log('✅ Geolocalização mockada para teste');
    });
    
    // Clicar no botão de compartilhar localização
    cy.get('[data-cy="share-location-button"]', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    // Verificar diálogo de confirmação ou feedback
    cy.get('body').then(($body) => {
      // Possíveis cenários após clicar no botão:
      
      // 1. Diálogo de confirmação
      if ($body.find('[data-cy="share-location-dialog"]').length > 0) {
        cy.get('[data-cy="share-location-dialog"]')
          .should('be.visible');
        
        cy.get('[data-cy="confirm-share-button"]')
          .should('be.visible')
          .click();
        
        // Verificar feedback de sucesso
        cy.get('[data-cy="success-toast"]', { timeout: 20000 })
          .should('be.visible')
          .and('contain.text', 'compartilhada');
      } 
      // 2. Toast direto (sem diálogo)
      else if ($body.find('[data-cy="success-toast"]').length > 0) {
        cy.get('[data-cy="success-toast"]', { timeout: 20000 })
          .should('be.visible')
          .and('contain.text', 'compartilhada');
      }
      // 3. Status no botão 
      else {
        cy.get('[data-cy="share-location-button"]', { timeout: 15000 })
          .should('contain.text', 'Compartilhada');
      }
      
      cy.log('✅ Compartilhamento de localização verificado');
    });
    
    // Verificar se as coordenadas foram atualizadas na interface
    cy.get('[data-cy="location-coordinates"]', { timeout: 15000 })
      .should('exist')
      .and('contain.text', '-3.1190')  // Latitude parcial
      .and('contain.text', '-60.0217'); // Longitude parcial
  });

  it('exibe o histórico de localizações compartilhadas', () => {
    // Navegar para a página de histórico ou exibir o histórico
    cy.get('[data-cy="location-history-button"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Verificar se o componente de histórico está visível
    cy.get('[data-cy="location-history"]', { timeout: 15000 })
      .should('be.visible');
    
    // Verificar se há itens no histórico ou mensagem de vazio
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="history-empty-state"]').length > 0) {
        // Estado vazio
        cy.get('[data-cy="history-empty-state"]')
          .should('be.visible')
          .and('contain.text', 'Nenhum registro');
        
        cy.log('✅ Estado vazio de histórico verificado');
      } else {
        // Verificar se há itens no histórico
        cy.get('[data-cy="history-item"]')
          .should('have.length.at.least', 1);
        
        // Verificar informações de data/hora e coordenadas
        cy.get('[data-cy="history-item"]').first().within(() => {
          cy.get('[data-cy="history-datetime"]').should('be.visible');
          cy.get('[data-cy="history-coordinates"]').should('be.visible');
        });
        
        cy.log('✅ Histórico de localizações verificado');
      }
    });
  });
});
