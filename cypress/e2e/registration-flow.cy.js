/**
 * Testes para o fluxo de registro de novos usuários
 * Verifica formulário, validações e processo completo
 */

describe('Fluxo de Registro de Usuário', () => {
  // Dados de teste
  const testUser = {
    email: `test-user-${Date.now()}@example.com`,
    password: 'SenhaSegura2025!',
    fullName: 'Usuário de Teste'
  };
  
  beforeEach(() => {
    // Limpar estado
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visitar página de login e navegar para registro
    cy.visit('/login', { timeout: 10000 });
    cy.get('[data-cy="login-page"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="register-link"]', { timeout: 10000 }).click();
  });

  it('deve exibir o formulário de registro corretamente', () => {
    // Verificar se foi redirecionado para a página de registro
    cy.url().should('include', '/register');
    
    // Verificar elementos do formulário
    cy.get('[data-cy="register-form"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="auth-tabs"]').should('be.visible'); // Tabs de tipo de usuário
    
    // Verificar campos específicos
    cy.get('[data-cy="fullname-input"]').should('be.visible');
    cy.get('[data-cy="email-input"]').should('be.visible');
    cy.get('[data-cy="password-input"]').should('be.visible');
    cy.get('[data-cy="password-confirm-input"]').should('be.visible');
    cy.get('[data-cy="submit-button"]').should('be.visible');
    
    // Verificar link para voltar para login
    cy.get('[data-cy="login-link"]').should('be.visible');
  });

  it('deve alternar entre tipos de usuário', () => {
    // Verificar se o estudante está selecionado por padrão
    cy.get('[data-cy="auth-tabs"] [data-state="active"]')
      .should('contain.text', 'Estudante');
    
    // Mudar para responsável
    cy.get('[data-cy="auth-tabs"]').contains('Responsável').click();
    cy.get('[data-cy="auth-tabs"] [data-state="active"]')
      .should('contain.text', 'Responsável');
    
    // Voltar para estudante
    cy.get('[data-cy="auth-tabs"]').contains('Estudante').click();
    cy.get('[data-cy="auth-tabs"] [data-state="active"]')
      .should('contain.text', 'Estudante');
  });

  it('deve validar campos antes de enviar', () => {
    // Tentar enviar sem preencher campos
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar mensagens de erro
    cy.get('body').should('contain.text', 'obrigatório');
    
    // Inserir email inválido
    cy.get('[data-cy="email-input"]').type('email-invalido');
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar mensagem de erro de formato
    cy.get('body').should('contain.text', 'Email inválido');
    
    // Testar senha fraca
    cy.get('[data-cy="email-input"]').clear().type(testUser.email);
    cy.get('[data-cy="fullname-input"]').type(testUser.fullName);
    cy.get('[data-cy="password-input"]').type('123');
    cy.get('[data-cy="submit-button"]').click();
    cy.get('body').should('contain.text', 'senha');
    
    // Testar senhas que não coincidem
    cy.get('[data-cy="password-input"]').clear().type(testUser.password);
    cy.get('[data-cy="password-confirm-input"]').type(testUser.password + '1');
    cy.get('[data-cy="submit-button"]').click();
    cy.get('body').should('contain.text', 'coincidem');
  });

  it('deve registrar novo usuário estudante com sucesso', () => {
    // Intercept de registro para simular sucesso
    cy.intercept('POST', '**/auth/v1/signup*', {
      statusCode: 200,
      body: {
        user: {
          id: 'mock-user-id',
          email: testUser.email,
          user_metadata: {
            full_name: testUser.fullName,
            user_type: 'student'
          }
        },
        session: {
          access_token: 'mock-token'
        }
      }
    }).as('userSignup');
    
    // Preencher formulário como estudante
    cy.get('[data-cy="auth-tabs"]').contains('Estudante').click();
    cy.get('[data-cy="fullname-input"]').type(testUser.fullName);
    cy.get('[data-cy="email-input"]').type(testUser.email);
    cy.get('[data-cy="password-input"]').type(testUser.password);
    cy.get('[data-cy="password-confirm-input"]').type(testUser.password);
    
    // Enviar formulário
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar requisição
    cy.wait('@userSignup').its('request.body').should('include', {
      email: testUser.email
    });
    
    // Verificar redirecionamento para página de confirmação
    cy.url({ timeout: 15000 }).should('include', '/register/confirm');
  });

  it('deve registrar novo usuário responsável com sucesso', () => {
    // Email único para responsável
    const parentEmail = `test-parent-${Date.now()}@example.com`;
    
    // Intercept de registro para simular sucesso
    cy.intercept('POST', '**/auth/v1/signup*', {
      statusCode: 200,
      body: {
        user: {
          id: 'mock-parent-id',
          email: parentEmail,
          user_metadata: {
            full_name: testUser.fullName,
            user_type: 'parent'
          }
        },
        session: {
          access_token: 'mock-token'
        }
      }
    }).as('parentSignup');
    
    // Preencher formulário como responsável
    cy.get('[data-cy="auth-tabs"]').contains('Responsável').click();
    cy.get('[data-cy="fullname-input"]').type(testUser.fullName);
    cy.get('[data-cy="email-input"]').type(parentEmail);
    cy.get('[data-cy="password-input"]').type(testUser.password);
    cy.get('[data-cy="password-confirm-input"]').type(testUser.password);
    
    // Enviar formulário
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar requisição
    cy.wait('@parentSignup').its('request.body').should('include', {
      email: parentEmail
    });
    
    // Verificar redirecionamento para página de confirmação
    cy.url({ timeout: 15000 }).should('include', '/register/confirm');
  });

  it('deve lidar com erros de registro corretamente', () => {
    // Simular erro de email já em uso
    cy.intercept('POST', '**/auth/v1/signup*', {
      statusCode: 400,
      body: {
        error: 'User already registered',
        message: 'O email informado já está em uso'
      }
    }).as('signupError');
    
    // Preencher formulário
    cy.get('[data-cy="fullname-input"]').type(testUser.fullName);
    cy.get('[data-cy="email-input"]').type(testUser.email);
    cy.get('[data-cy="password-input"]').type(testUser.password);
    cy.get('[data-cy="password-confirm-input"]').type(testUser.password);
    
    // Enviar formulário
    cy.get('[data-cy="submit-button"]').click();
    
    // Verificar mensagem de erro
    cy.wait('@signupError');
    cy.get('[data-cy="error-message"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Erro ao realizar cadastro');
    
    // Verificar que o formulário ainda está visível (não redirecionou)
    cy.get('[data-cy="register-form"]').should('be.visible');
  });

  it('deve voltar para a tela de login', () => {
    // Clicar no link para voltar ao login
    cy.get('[data-cy="login-link"]').click();
    
    // Verificar se voltou para tela de login
    cy.get('[data-cy="login-title"]')
      .should('be.visible')
      .and('contain.text', 'Entrar');
  });
});
