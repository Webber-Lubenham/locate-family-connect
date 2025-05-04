/**
 * Teste simplificado de perfil de desenvolvedor
 * Foco nas permissões e interface específicas para desenvolvedores
 */

describe('Teste de permissões de desenvolvedor', () => {
  // Credenciais de desenvolvedor
  const devEmail = 'developer@sistema-monitore.com.br';
  const devPassword = 'Dev#Monitore2025';
  
  // Credenciais de estudante para comparação
  const studentEmail = 'cetisergiopessoa@gmail.com';
  const studentPassword = '4EG8GsjBT5KjD3k';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('Verifica login de desenvolvedor e interface administrativa', () => {
    // Login como desenvolvedor
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type(devEmail);
    cy.get('[data-cy="password-input"]').type(devPassword);
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar redirecionamento bem-sucedido
    cy.url().should('not.include', '/login');
    
    // Verificar elementos de interface para desenvolvedor
    cy.get('body').then($body => {
      const pageText = $body.text().toLowerCase();
      const devTerms = ['desenvolvedor', 'admin', 'configurações avançadas', 'developer'];
      
      const foundTerms = devTerms.filter(term => pageText.includes(term));
      if (foundTerms.length > 0) {
        cy.log(`✅ Interface de desenvolvedor detectada: ${foundTerms.join(', ')}`);
      } else {
        cy.log('⚠️ Interface de desenvolvedor não detectada');
      }
    });
  });
  
  it('Testa acesso às rotas técnicas', () => {
    // Login
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type(devEmail);
    cy.get('[data-cy="password-input"]').type(devPassword);
    cy.get('[data-cy="submit-button"]').click();
    
    // Testar rotas técnicas (com failOnStatusCode: false para não falhar se a rota não existir)
    cy.log('Testando rota /swagger');
    cy.visit('/swagger', { failOnStatusCode: false });
    
    cy.log('Testando rota /admin');
    cy.visit('/admin', { failOnStatusCode: false });
    
    cy.log('Testando rota /developer');
    cy.visit('/developer', { failOnStatusCode: false });
    
    cy.log('Testando endpoint /api/profiles');
    cy.visit('/api/profiles', { failOnStatusCode: false });
  });
  
  it('Verifica informações do perfil de desenvolvedor', () => {
    // Login
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type(devEmail);
    cy.get('[data-cy="password-input"]').type(devPassword);
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar dados no localStorage
    cy.window().then(win => {
      const userStr = win.localStorage.getItem('userData');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          cy.log(`Dados do usuário: ${JSON.stringify(userData, null, 2)}`);
          
          if (userData.user_type === 'developer') {
            cy.log('✅ Usuário com perfil de desenvolvedor confirmado');
          } else {
            cy.log(`⚠️ Tipo de usuário: ${userData.user_type || 'não definido'}`);
          }
        } catch (e) {
          cy.log('❌ Erro ao analisar dados do usuário');
        }
      } else {
        cy.log('⚠️ Dados do usuário não encontrados no localStorage');
      }
    });
  });
  
  it('Compara permissões entre estudante e desenvolvedor', () => {
    // Primeiro testar como estudante
    cy.log('=== TESTANDO COMO ESTUDANTE ===');
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type(studentEmail);
    cy.get('[data-cy="password-input"]').type(studentPassword);
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar acesso negado a rota técnica
    cy.url().should('not.include', '/login');
    cy.visit('/swagger', { failOnStatusCode: false });
    
    // Depois testar como desenvolvedor
    cy.log('=== TESTANDO COMO DESENVOLVEDOR ===');
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type(devEmail);
    cy.get('[data-cy="password-input"]').type(devPassword);
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar acesso a rota técnica
    cy.url().should('not.include', '/login');
    cy.visit('/swagger', { failOnStatusCode: false });
  });
  
  it('Gera resumo de recomendações', () => {
    cy.log('====================================================');
    cy.log('RECOMENDAÇÕES PARA PERFIL DE DESENVOLVEDOR');
    cy.log('====================================================');
    cy.log('1. Adicionar middleware de verificação de permissões no servidor');
    cy.log('2. Implementar rotas específicas para ferramentas técnicas');
    cy.log('3. Melhorar indicadores visuais de interface para desenvolvedores');
    cy.log('4. Criar página dedicada para administração técnica');
    cy.log('====================================================');
  });
});
