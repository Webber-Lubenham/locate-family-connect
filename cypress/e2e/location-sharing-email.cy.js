/**
 * Testes para o fluxo de compartilhamento de localização por email
 * Verifica a integração com a Edge Function share-location e o serviço Resend
 */

describe('Compartilhamento de Localização por Email', () => {
  // Usuário estudante para teste
  const studentUser = {
    email: 'cetisergiopessoa@gmail.com',
    password: '4EG8GsjBT5KjD3k'
  };
  
  // Dados de localização de teste
  const testLocation = {
    latitude: -3.1190275,
    longitude: -60.0217314,
    accuracy: 10
  };

  beforeEach(() => {
    // Limpar estado e fazer login como estudante
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('/login', { timeout: 10000 });
    cy.get('[data-cy="email-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(studentUser.email);
    
    cy.get('[data-cy="password-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(studentUser.password);
    
    cy.get('[data-cy="submit-button"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Aguardar redirecionamento para o dashboard do estudante
    cy.url({ timeout: 30000 }).should('include', '/student-dashboard');

    // Mock da API de geolocalização
    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition')
        .callsFake((callback) => {
          callback({
            coords: testLocation
          });
        });
    });
  });

  it('deve enviar email de compartilhamento de localização', () => {
    // Interceptar chamada para a Edge Function share-location
    cy.intercept('POST', '**/functions/v1/share-location**', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Email enviado com sucesso',
        data: {
          id: 'mock-email-id'
        }
      }
    }).as('shareLocationEmail');
    
    // Clicar no botão de compartilhar localização
    cy.get('[data-cy="share-location-button"]', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    // Verificar se o dialog de confirmação foi exibido ou se o toast apareceu diretamente
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="share-location-dialog"]').length > 0) {
        // Cenário 1: Dialog de confirmação
        cy.get('[data-cy="confirm-share-button"]')
          .should('be.visible')
          .click();
      }
      
      // Aguardar chamada à Edge Function
      cy.wait('@shareLocationEmail').then((interception) => {
        // Verificar payload enviado
        expect(interception.request.body).to.have.property('latitude');
        expect(interception.request.body).to.have.property('longitude');
        expect(interception.request.body).to.have.property('student_id');
      });
      
      // Verificar feedback de sucesso
      cy.get('[data-cy="success-toast"]', { timeout: 15000 })
        .should('be.visible')
        .and('contain.text', 'compartilhada');
    });
  });

  it('deve registrar a localização compartilhada no banco de dados', () => {
    // Interceptar chamada para salvar localização
    cy.intercept('POST', '**/rest/v1/locations**', {
      statusCode: 201,
      body: {
        id: 'mock-location-id',
        created_at: new Date().toISOString()
      }
    }).as('saveLocation');
    
    // Clicar no botão de compartilhar localização
    cy.get('[data-cy="share-location-button"]', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    // Verificar diálogo ou compartilhar diretamente
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="share-location-dialog"]').length > 0) {
        cy.get('[data-cy="confirm-share-button"]')
          .should('be.visible')
          .click();
      }
      
      // Verificar se a localização foi salva no banco
      cy.wait('@saveLocation').then((interception) => {
        // Verificar payload enviado
        expect(interception.request.body).to.have.property('latitude', testLocation.latitude);
        expect(interception.request.body).to.have.property('longitude', testLocation.longitude);
        expect(interception.request.body).to.have.property('student_id');
        expect(interception.request.body).to.have.property('shared_with_guardians', true);
      });
    });
  });

  it('deve mostrar histórico das localizações compartilhadas', () => {
    // Interceptar consulta de histórico
    cy.intercept('GET', '**/rest/v1/locations**', {
      statusCode: 200,
      body: [
        {
          id: 'mock-location-1',
          latitude: testLocation.latitude,
          longitude: testLocation.longitude,
          created_at: new Date().toISOString(),
          student_id: 'mock-student-id',
          shared_with_guardians: true
        },
        {
          id: 'mock-location-2',
          latitude: testLocation.latitude + 0.001,
          longitude: testLocation.longitude + 0.001,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          student_id: 'mock-student-id',
          shared_with_guardians: true
        }
      ]
    }).as('getLocationHistory');
    
    // Navegar para histórico de localizações
    cy.get('[data-cy="location-history-button"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Aguardar carregamento do histórico
    cy.wait('@getLocationHistory');
    
    // Verificar se o histórico é exibido corretamente
    cy.get('[data-cy="location-history"]', { timeout: 15000 })
      .should('be.visible');
    
    cy.get('[data-cy="history-item"]')
      .should('have.length', 2);
    
    // Verificar detalhes do primeiro item
    cy.get('[data-cy="history-item"]').first().within(() => {
      cy.get('[data-cy="history-datetime"]').should('be.visible');
      cy.get('[data-cy="history-coordinates"]')
        .should('be.visible')
        .and('contain.text', testLocation.latitude.toFixed(4))
        .and('contain.text', testLocation.longitude.toFixed(4));
    });
  });

  it('deve tratar erros no envio de email corretamente', () => {
    // Interceptar com erro de chamada para a Edge Function
    cy.intercept('POST', '**/functions/v1/share-location**', {
      statusCode: 500,
      body: {
        success: false,
        message: 'Erro ao enviar email',
        error: 'Falha na conexão com o serviço Resend'
      }
    }).as('shareLocationError');
    
    // Clicar no botão de compartilhar localização
    cy.get('[data-cy="share-location-button"]', { timeout: 15000 })
      .should('be.visible')
      .click();
    
    // Confirmar se necessário
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="share-location-dialog"]').length > 0) {
        cy.get('[data-cy="confirm-share-button"]')
          .should('be.visible')
          .click();
      }
      
      // Aguardar chamada com erro
      cy.wait('@shareLocationError');
      
      // Verificar feedback de erro
      cy.get('[data-cy="error-toast"]', { timeout: 15000 })
        .should('be.visible')
        .and('contain.text', 'erro');
      
      // Verificar que a localização ainda é salva localmente mesmo com erro de email
      cy.get('[data-cy="location-coordinates"]')
        .should('be.visible')
        .and('contain.text', testLocation.latitude.toFixed(4))
        .and('contain.text', testLocation.longitude.toFixed(4));
    });
  });
});
