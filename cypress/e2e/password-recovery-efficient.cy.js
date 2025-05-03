/**
 * Testes focados em UI para o fluxo de recuperação de senha
 * Implementação que não depende de interceptações de rede
 */

describe('Fluxo de Recuperação de Senha (Foco em UI)', () => {
  // Usuário de teste (usando usuário real do sistema)
  const testUser = {
    email: 'frankwebber33@hotmail.com', // Usando email real verificado no sistema
    password: 'DevEduConnect2025!',
    oldPassword: 'Test@123456',
    userType: 'parent' // Tipo de usuário conforme dados reais
  };

  // Executa antes de cada teste
  beforeEach(() => {
    // Limpar cookies e localStorage
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.log('Ambiente limpo para iniciar teste');
  });

  // Teste 1: Solicitar recuperação de senha - foco na UI
  it('deve mostrar o formulário de recuperação de senha', () => {
    // Navegar para o login
    cy.visit('/login');
    
    // Clicar no link de recuperação
    cy.get('[data-cy="forgot-password-link"]').should('be.visible').then($el => {
      $el[0].click();
    });
    
    // Verificar que o formulário foi carregado
    cy.contains(/E-mail/i).should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });
  
  // Teste 2: Testar preenchimento do formulário de recuperação
  it('deve permitir preencher o formulário de recuperação', () => {
    // Navegar para o login
    cy.visit('/login');
    
    // Clicar no link de recuperação
    cy.get('[data-cy="forgot-password-link"]').should('be.visible').then($el => {
      $el[0].click();
    });
    
    // Preencher email
    cy.get('input[type="email"]').type(testUser.email);
    
    // Verificar que o botão está habilitado
    cy.get('button[type="submit"]').should('not.be.disabled');
  });
  
  // Teste 3: Simular visualização do formulário de redefinição
  it('deve mostrar formulário de redefinição de senha', () => {
    // Acessar diretamente a página de redefinição com token
    cy.visit(`/reset-password?token=valid-token-simulation&email=${encodeURIComponent(testUser.email)}`);
    
    // Verificar elementos da página
    cy.contains(/senha/i).should('be.visible'); // Procura qualquer texto que contenha "senha"
    cy.get('input[type="password"]').should('have.length.at.least', 1);
  });

  // Teste 4: Validar erro de senhas não coincidentes
  it('deve mostrar erro quando senhas não coincidem', () => {
    // Visitar página de redefinição de senha
    cy.visit(`/reset-password?token=valid-token-simulation&email=${encodeURIComponent(testUser.email)}`);
    
    // Verificar que a página de redefinição carregou verificando componentes visuais
    cy.get('input[type="password"]').first().should('be.visible');
    
    // Preencher com senhas diferentes
    cy.get('input[type="password"]').first().type(testUser.password);
    cy.get('input[type="password"]').last().type(testUser.password + '123');
    
    // Clicar no botão de envio
    cy.get('button[type="submit"]').then($btn => {
      $btn[0].click();
    });
    
    // Verificar mensagem de erro (qualquer texto que indique erro de senhas)
    cy.contains(/não coincidem|diferentes|não conferem/i).should('be.visible');
  });

  // Teste 5: Validar erro de senha muito curta
  it('deve mostrar erro quando a senha é muito curta', () => {
    // Visitar página de redefinição de senha
    cy.visit(`/reset-password?token=valid-token-simulation&email=${encodeURIComponent(testUser.email)}`);
    
    // Verificar que a página de redefinição carregou verificando componentes visuais
    cy.get('input[type="password"]').first().should('be.visible');
    
    // Preencher com senha curta (3 caracteres)
    cy.get('input[type="password"]').first().type('123');
    cy.get('input[type="password"]').last().type('123');
    
    // Clicar no botão de envio
    cy.get('button[type="submit"]').then($btn => {
      $btn[0].click();
    });
    
    // Verificar mensagem de erro (qualquer texto que indique erro de tamanho de senha)
    cy.contains(/curta|mínimo|caracteres/i).should('be.visible');
  });

  // Teste 6: Validar elementos essenciais da página de login
  it('deve mostrar elementos essenciais na página de login', () => {
    // Visitar página de login
    cy.visit('/login');
    
    // Verificar elementos essenciais da página
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    
    // Verificar link para recuperar senha 
    cy.contains(/Esqueceu|esqueceu|recuperar|recuperação/i).should('be.visible');
  });
  
  // Teste 7: Validar campos obrigatórios de recuperação de senha
  it('deve validar email obrigatório na recuperação de senha', () => {
    // Navegar para o login
    cy.visit('/login');
    
    // Clicar no link de recuperação
    cy.get('[data-cy="forgot-password-link"]').should('be.visible').then($el => {
      $el[0].click();
    });
    
    // Tentar submeter sem preencher
    cy.get('button[type="submit"]').then($btn => {
      $btn[0].click();
    });
    
    // Verificar que existe validação de campo obrigatório
    // (verificando elemento input inválido usando seletor nativo)
    cy.get('input:invalid').should('exist');
  });
});
