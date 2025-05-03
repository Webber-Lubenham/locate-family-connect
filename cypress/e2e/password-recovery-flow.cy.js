/**
 * Testes do fluxo de recuperação de senha
 * Este conjunto de testes verifica o fluxo completo de recuperação de senha,
 * incluindo validações de entrada, mensagens de erro e simulação do fluxo completo.
 *
 * Sistema de email: Resend API
 * Integração: Via Supabase Auth (SMTP) e implementação direta via API Resend
 * Email padrão: notificacoes@sistema-monitore.com.br
 * 
 * @see docs/RESEND.md - Documentação completa do sistema de email
 */

describe('Fluxo de Recuperação de Senha', () => {
  // Usuário de teste para recuperação de senha (usuário real do sistema)
  const testUser = {
    email: 'mauro.lima@educacao.am.gov.br', // Usuário developer real do sistema
    newPassword: 'DevEduConnect2025!', // Manter a senha igual à original para não afetar o acesso
    invalidEmail: 'email.invalido@',
    nonExistentEmail: 'nao.existe@exemplo.com'
  };

  // URL da página de login (ponto de entrada do fluxo)
  const loginUrl = '/login';
  
  // URL da página de redefinição de senha
  const resetPasswordUrl = '/reset-password';

  /**
   * Acessa a página de "Esqueci minha senha" a partir da página de login
   */
  const navigateToForgotPassword = () => {
    // Visitar página de login
    cy.visit(loginUrl);
    // Usar classe ou ID no lugar de data-cy para evitar o problema
    cy.get('[data-cy="forgot-password-link"]').click();
    cy.log('Navegação para formulário de recuperação de senha');
  };

  /**
   * Simula a interceptação da chamada de API para redefinição de senha
   * e retorna uma resposta de sucesso simulada
   *
   * Considera as duas rotas possíveis:
   * 1. Supabase Auth (SMTP) - resetPasswordForEmail
   * 2. Resend API direta - emails.send
   */
  const mockPasswordResetRequest = () => {
    // Interceptar chamada ao Supabase Auth
    cy.intercept('POST', '**/auth/v1/recover**', {
      statusCode: 200,
      body: { success: true }
    }).as('passwordResetRequest');
    
    // Interceptar chamada direta ao Resend API
    cy.intercept('POST', '**/email/send', {
      statusCode: 200,
      body: { 
        success: true, 
        id: 'mock-email-id',
        from: 'notificacoes@sistema-monitore.com.br',
        to: [testUser.email]  
      }
    }).as('resendEmailRequest');
    
    // Interceptar chamada SMTP ao Resend (opcional, apenas para logs)
    cy.intercept('POST', '**/smtp.resend.com', {
      statusCode: 200,
      body: { success: true }
    }).as('smtpRequest');
  };

  /**
   * Simula a interceptação da chamada de API para atualização de senha
   * e retorna uma resposta de sucesso simulada
   */
  const mockPasswordUpdateRequest = () => {
    cy.intercept('PUT', '**/auth/v1/user**', {
      statusCode: 200,
      body: { success: true }
    }).as('passwordUpdateRequest');
  };

  beforeEach(() => {
    // Limpar cookies e localStorage antes de cada teste
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.log('Estado limpo para o teste');
  });

  // ===================== TESTES DO CAMINHO FELIZ =====================

  it('deve mostrar o formulário de recuperação de senha', () => {
    navigateToForgotPassword();
    
    // Verificar a presença dos elementos do formulário
    cy.get('[data-cy="recovery-email-input"]').should('be.visible');
    cy.get('[data-cy="send-recovery-button"]').should('be.visible');
    cy.get('[data-cy="back-to-login-button"]').should('be.visible');
  });

  it('deve enviar o email de recuperação e mostrar mensagem de sucesso', () => {
    // Configurar mock para simular resposta bem-sucedida
    mockPasswordResetRequest();
    
    navigateToForgotPassword();
    
    // Preencher e enviar o formulário
    cy.get('[data-cy="recovery-email-input"]').type(testUser.email);
    cy.get('[data-cy="send-recovery-button"]').click();
    
    // Aguardar a requisição de recuperação
    cy.wait('@passwordResetRequest', { timeout: 10000 });
    
    // Verificar mensagem de sucesso
    cy.get('[data-cy="success-message"]').should('be.visible');
    cy.get('[data-cy="success-message"]').should('contain.text', 'Link de recuperação enviado');
    
    // Validar que o email é mostrado na mensagem
    cy.get('[data-cy="success-message"]').should('contain.text', testUser.email);
    
    // Capturar screenshot do estado de sucesso
    cy.screenshot('recovery-email-sent-success');
  });

  it('deve permitir o retorno à página de login após solicitar recuperação', () => {
    // Configurar mock para simular resposta bem-sucedida
    mockPasswordResetRequest();
    
    navigateToForgotPassword();
    
    // Preencher e enviar o formulário
    cy.get('[data-cy="recovery-email-input"]').type(testUser.email);
    cy.get('[data-cy="send-recovery-button"]').click();
    
    // Aguardar a requisição de recuperação
    cy.wait('@passwordResetRequest', { timeout: 10000 });
    
    // Clicar no botão de voltar ao login
    cy.get('[data-cy="back-to-login-button"]').click();
    
    // Verificar se voltou para a página de login
    cy.url().should('include', loginUrl);
    cy.get('[data-cy="login-page"]').should('be.visible');
  });

  it('deve permitir a redefinição de senha com token válido', () => {
    // Este teste simula a chegada à página de redefinição via link de email
    
    // Configurar mock para simulação de resposta bem-sucedida na atualização
    mockPasswordUpdateRequest();
    
    // Simular a navegação direta para a página de redefinição com token no URL
    // Na prática, isso simularia o clique no link recebido por email
    cy.visit(`${resetPasswordUrl}?token=valid-token-simulation&email=${encodeURIComponent(testUser.email)}`);
    
    // Verificar se a página de redefinição foi carregada
    cy.get('[data-cy="reset-password-form"]').should('be.visible');
    
    // Preencher o formulário de nova senha
    cy.get('[data-cy="new-password-input"]').type(testUser.newPassword);
    cy.get('[data-cy="confirm-password-input"]').type(testUser.newPassword);
    
    // Submeter o formulário
    cy.get('[data-cy="reset-password-button"]').click();
    
    // Aguardar a requisição de atualização
    cy.wait('@passwordUpdateRequest', { timeout: 10000 });
    
    // Verificar mensagem de sucesso
    cy.get('[data-cy="password-reset-success"]').should('be.visible');
    
    // Verificar redirecionamento automático para login após 3 segundos
    cy.wait(3500); // Esperar pelo timeout de redirecionamento (um pouco mais que 3s)
    cy.url().should('include', loginUrl);
    
    // Capturar screenshot do estado final
    cy.screenshot('password-reset-complete');
  });

  // ===================== TESTES DE VALIDAÇÃO E ERROS =====================

  it('deve validar campo de email vazio', () => {
    navigateToForgotPassword();
    
    // Tentar enviar sem preencher o email
    cy.get('[data-cy="send-recovery-button"]').click();
    
    // Verificar mensagem de erro
    cy.get('[data-cy="email-error-message"]').should('be.visible');
    cy.get('[data-cy="email-error-message"]').should('contain.text', 'Por favor, insira seu email');
  });

  it('deve validar formato de email inválido', () => {
    navigateToForgotPassword();
    
    // Preencher com email em formato inválido
    cy.get('[data-cy="recovery-email-input"]').type(testUser.invalidEmail);
    cy.get('[data-cy="send-recovery-button"]').click();
    
    // Verificar mensagem de erro
    cy.get('[data-cy="email-error-message"]').should('be.visible');
    cy.get('[data-cy="email-error-message"]').should('contain.text', 'formato inválido');
  });

  it('deve mostrar erro para email não cadastrado', () => {
    // Interceptar e simular resposta de erro específico
    cy.intercept('POST', '**/auth/v1/recover**', {
      statusCode: 400,
      body: { error: 'Email not found', message: 'Email não encontrado no sistema' }
    }).as('emailNotFoundRequest');
    
    navigateToForgotPassword();
    
    // Preencher com email válido mas não existente
    cy.get('[data-cy="recovery-email-input"]').type(testUser.nonExistentEmail);
    cy.get('[data-cy="send-recovery-button"]').click();
    
    // Aguardar a requisição
    cy.wait('@emailNotFoundRequest', { timeout: 10000 });
    
    // Verificar mensagem de erro
    cy.get('[data-cy="api-error-message"]').should('be.visible');
    cy.get('[data-cy="api-error-message"]').should('contain.text', 'Email não encontrado');
  });

  it('deve validar senhas não coincidentes na redefinição', () => {
    // Simular a navegação para a página de redefinição
    cy.visit(`${resetPasswordUrl}?token=valid-token-simulation&email=${encodeURIComponent(testUser.email)}`);
    
    // Verificar se a página de redefinição foi carregada
    cy.get('[data-cy="reset-password-form"]').should('be.visible');
    
    // Preencher com senhas diferentes
    cy.get('[data-cy="new-password-input"]').type(testUser.newPassword);
    cy.get('[data-cy="confirm-password-input"]').type(testUser.newPassword + '123');
    
    // Submeter o formulário
    cy.get('[data-cy="reset-password-button"]').click();
    
    // Verificar mensagem de erro
    cy.get('[data-cy="password-mismatch-error"]').should('be.visible');
    cy.get('[data-cy="password-mismatch-error"]').should('contain.text', 'não coincidem');
  });

  it('deve validar comprimento mínimo da senha na redefinição', () => {
    // Simular a navegação para a página de redefinição
    cy.visit(`${resetPasswordUrl}?token=valid-token-simulation&email=${encodeURIComponent(testUser.email)}`);
    
    // Verificar se a página de redefinição foi carregada
    cy.get('[data-cy="reset-password-form"]').should('be.visible');
    
    // Preencher com senha curta
    const shortPassword = '123';
    cy.get('[data-cy="new-password-input"]').type(shortPassword);
    cy.get('[data-cy="confirm-password-input"]').type(shortPassword);
    
    // Submeter o formulário
    cy.get('[data-cy="reset-password-button"]').click();
    
    // Verificar mensagem de erro
    cy.get('[data-cy="password-length-error"]').should('be.visible');
    cy.get('[data-cy="password-length-error"]').should('contain.text', 'pelo menos 8 caracteres');
  });

  it('deve mostrar erro para token inválido', () => {
    // Interceptar e simular resposta de erro para token inválido
    cy.intercept('PUT', '**/auth/v1/user**', {
      statusCode: 401,
      body: { error: 'Invalid token', message: 'Token inválido ou expirado' }
    }).as('invalidTokenRequest');
    
    // Simular a navegação para a página de redefinição com token inválido
    cy.visit(`${resetPasswordUrl}?token=invalid-token&email=${encodeURIComponent(testUser.email)}`);
    
    // Verificar se a página de redefinição foi carregada
    cy.get('[data-cy="reset-password-form"]').should('be.visible');
    
    // Preencher o formulário
    cy.get('[data-cy="new-password-input"]').type(testUser.newPassword);
    cy.get('[data-cy="confirm-password-input"]').type(testUser.newPassword);
    
    // Submeter o formulário
    cy.get('[data-cy="reset-password-button"]').click();
    
    // Aguardar a requisição
    cy.wait('@invalidTokenRequest', { timeout: 10000 });
    
    // Verificar mensagem de erro
    cy.get('[data-cy="token-error-message"]').should('be.visible');
    cy.get('[data-cy="token-error-message"]').should('contain.text', 'inválido ou expirado');
  });

  it('deve mostrar alternativas de contato quando há falha', () => {
    // Interceptar e simular resposta de erro genérico
    cy.intercept('POST', '**/auth/v1/recover**', {
      statusCode: 500,
      body: { error: 'Server error', message: 'Erro interno do servidor' }
    }).as('serverErrorRequest');
    
    navigateToForgotPassword();
    
    // Preencher com email válido
    cy.get('[data-cy="recovery-email-input"]').type(testUser.email);
    cy.get('[data-cy="send-recovery-button"]').click();
    
    // Aguardar a requisição
    cy.wait('@serverErrorRequest', { timeout: 10000 });
    
    // Verificar mensagem de erro
    cy.get('[data-cy="api-error-message"]').should('be.visible');
    
    // Verificar se exibe o link para diagnóstico
    cy.get('[data-cy="email-diagnostic-link"]').should('be.visible');
    cy.get('[data-cy="email-diagnostic-link"]').should('have.attr', 'href', '/email-diagnostic');
  });
});
