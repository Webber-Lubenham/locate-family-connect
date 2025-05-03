/**
 * Teste simplificado do fluxo de recuperação de senha
 * 
 * Esta versão foca apenas na navegação básica e elementos de UI,
 * sem depender de interceptações complexas ou atributos data-cy.
 */

describe('Fluxo de Recuperação de Senha (Simplificado)', () => {
  const testUser = {
    email: 'mauro.lima@educacao.am.gov.br',
    password: 'DevEduConnect2025!' // Senha usada apenas para testes
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // Teste 1: Verificar se o formulário de recuperação aparece
  it('deve mostrar o formulário de recuperação de senha', () => {
    // Usar comando personalizado para navegar à recuperação de senha
    cy.navigateToPasswordRecovery();
    
    // Verificar se o formulário aparece (verificando algum texto que deve estar presente)
    cy.containsText('E-mail').should('be.visible');
  });

  // Teste 2: Verificar se é possível inserir um email e submeter o formulário
  it('deve permitir inserir email e submeter o formulário', () => {
    cy.navigateToPasswordRecovery();
    
    // Encontrar o input de email através do tipo
    cy.get('input[type="email"]').type(testUser.email);
    
    // Submeter o formulário usando JQuery para evitar erros de compatibilidade
    cy.get('button[type="submit"]').then($btn => {
      $btn[0].click();
    });
    
    // Verificar se alguma resposta visual aparece (mensagem de sucesso ou similar)
    cy.containsText('enviado|sucesso|verifique').should('exist');
  });

  // Teste 3: Verificar se a página de redefinição carrega corretamente
  it('deve carregar a página de redefinição de senha', () => {
    // Simular acesso via link de redefinição (com token simulado)
    cy.visit(`/reset-password?token=valid-token-simulation&email=${encodeURIComponent(testUser.email)}`);
    
    // Verificar se elementos básicos da página estão presentes
    cy.containsText('senha|redefinir').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  // Teste 4: Verificar se é possível inserir nova senha
  it('deve permitir inserir nova senha na página de redefinição', () => {
    // Simular acesso via link de redefinição (com token simulado)
    cy.visit(`/reset-password?token=valid-token-simulation&email=${encodeURIComponent(testUser.email)}`);
    
    // Verificar se o formulário está visível antes de continuar
    cy.get('[data-cy="reset-password-form"]').should('be.visible');
    
    // Preencher os campos de senha usando uma abordagem mais robusta
    cy.get('[data-cy="new-password-input"]').type(testUser.password);
    cy.get('[data-cy="confirm-password-input"]').type(testUser.password);
    
    // Submeter o formulário usando JQuery para evitar erros de compatibilidade
    cy.get('[data-cy="reset-password-button"]').then($btn => {
      $btn[0].click();
    });
    
    // Verificar resposta visual
    cy.containsText('sucesso|redirecionando|alterada').should('exist');
  });

  // Teste 5: Validar erro de senhas não coincidentes
  it('deve mostrar erro quando senhas não coincidem', () => {
    cy.visit(`/reset-password?token=valid-token-simulation&email=${encodeURIComponent(testUser.email)}`);
    cy.get('[data-cy="reset-password-form"]').should('be.visible');
    
    // Preencher com senhas diferentes
    cy.get('[data-cy="new-password-input"]').type(testUser.password);
    cy.get('[data-cy="confirm-password-input"]').type(testUser.password + '123');
    
    // Submeter o formulário
    cy.get('[data-cy="reset-password-button"]').then($btn => {
      $btn[0].click();
    });
    
    // Verificar erro usando comando personalizado
    cy.checkErrorMessage('mismatch').should('exist');
  });
});
