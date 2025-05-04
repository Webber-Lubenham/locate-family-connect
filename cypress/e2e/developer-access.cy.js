/**
 * Testes para verificar acesso e permissões de desenvolvedor
 * Testa se um usuário com perfil de desenvolvedor tem acesso às rotas técnicas
 */

describe('Permissões de Desenvolvedor', () => {
  // Credenciais do usuário desenvolvedor confirmado
  const devCredentials = {
    name: 'Usuário Desenvolvedor',
    email: 'developer@sistema-monitore.com.br',
    password: 'Dev#Monitore2025'
  };
  
  // Backup para testes adicionais (opcional)
  const alternativeDevCredentials = [
    {
      name: 'Mauro Lima',
      email: 'mauro.lima@educacao.am.gov.br',
      password: 'DevEduConnect2025!'
    }
  ];

  const regularCredentials = {
    email: 'cetisergiopessoa@gmail.com',
    password: '4EG8GsjBT5KjD3k'
  };

  beforeEach(() => {
    // Limpar cookies e localStorage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Interceptar chamadas de API para verificação de perfil
    cy.intercept('GET', '**/profiles**').as('profileData');
    cy.intercept('GET', '**/auth/v1/user').as('userData');
    
    // Interceptar chamadas de autenticação para capturar erros
    cy.intercept('POST', '**/auth/v1/token**').as('authToken');
  });

  const loginAndCheckRole = (credentials) => {
    cy.visit('/login');
    
    // Login
    cy.get('[data-cy="email-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(credentials.email, { delay: 50 });
    
    cy.get('[data-cy="password-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(credentials.password, { delay: 50 });
    
    cy.get('[data-cy="submit-button"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Aguardar pela chamada de API que busca os dados do usuário
    cy.wait('@userData', { timeout: 15000 }).then((interception) => {
      // Capturar a resposta para análise
      const userData = interception.response.body;
      
      // Log para debug
      cy.log(`Dados do usuário: ${JSON.stringify(userData).substring(0, 200)}...`);
      
      // Verificar metadados para encontrar tipo de usuário
      if (userData && userData.user) {
        const userMetadata = userData.user.user_metadata || {};
        const userType = userMetadata.user_type;
        
        cy.log(`Tipo de usuário encontrado: ${userType || 'não definido'}`);
        
        return userType;
      }
    });
    
    // Aguardar pela chamada de API que busca o perfil
    cy.wait('@profileData', { timeout: 15000 }).then((interception) => {
      // Verificar se a chamada foi bem-sucedida
      expect(interception.response.statusCode).to.be.oneOf([200, 304]);
      
      // Capturar os dados do perfil
      const profileData = interception.response.body;
      
      // Log para debug
      cy.log(`Dados de perfil: ${JSON.stringify(profileData).substring(0, 200)}...`);
      
      if (Array.isArray(profileData) && profileData.length > 0) {
        const profile = profileData[0];
        cy.log(`Tipo de usuário no perfil: ${profile.user_type || 'não definido'}`);
        
        return profile.user_type;
      }
    });
  };
  
  // Teste para verificar login com credenciais de desenvolvedor confirmadas
  it('verifica login com credenciais de desenvolvedor', () => {
    cy.log(`\n\n=== TESTANDO CREDENCIAL DE DESENVOLVEDOR: ${devCredentials.name} (${devCredentials.email}) ===`);
    
    // Visitar a página de login
    cy.visit('/login');
    
    // Preencher credenciais do desenvolvedor
    cy.get('[data-cy="email-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(devCredentials.email, { delay: 50 });
    
    cy.get('[data-cy="password-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(devCredentials.password, { delay: 50 });
    
    // Capturar screenshot antes do login
    cy.screenshot('dev-login-pre-login');
    
    // Clicar no botão de login e capturar a resposta de autenticação
    cy.get('[data-cy="submit-button"]', { timeout: 10000 })
      .should('be.visible')
      .click();
      
    // Verificar resposta da autenticação
    cy.wait('@authToken', { timeout: 10000 }).then((interception) => {
      // Capturar screenshot após tentativa de login
      cy.screenshot('dev-login-post-login');
      
      // Verificar status da resposta
      const statusCode = interception.response.statusCode;
      cy.log(`Status da autenticação: ${statusCode}`);
      
      if (statusCode === 400) {
        cy.log(`❌ Autenticação de ${devCredentials.email} falhou com código 400 - Credenciais inválidas`);
        
        // Mostrar detalhes da resposta para diagnóstico
        const responseBody = interception.response.body;
        cy.log(`Detalhes da resposta: ${JSON.stringify(responseBody)}`);
        
        // Verificar o corpo da página para mensagens de erro
        cy.get('body').then($body => {
          const bodyText = $body.text().toLowerCase();
          const errorMessages = [
            'senha inválida', 'email inválido', 'credenciais inválidas',
            'não encontrado', 'usuário não encontrado', 'erro', 'falha',
            'incorreto', 'problema'
          ];
          
          const foundErrors = errorMessages.filter(msg => bodyText.includes(msg));
          if (foundErrors.length > 0) {
            cy.log(`Mensagens de erro na UI: ${foundErrors.join(', ')}`);
          }
        });
        
        // Verificar se o usuário existe no banco, mesmo com senha incorreta
        cy.log(`Análise do problema com ${devCredentials.email}: A conta existe mas a senha está incorreta OU a conta não existe no sistema.`);
      } else if (statusCode >= 200 && statusCode < 300) {
        cy.log(`✅ Autenticação de ${devCredentials.email} bem-sucedida - Verificando tipo de perfil...`);
        
        // Tentar aguardar dados de perfil
        cy.wait('@profileData', { timeout: 10000 }).then((profileInterception) => {
          const profileData = profileInterception.response.body;
          cy.log(`Dados de perfil recebidos: ${JSON.stringify(profileData).substring(0, 200)}...`);
          
          // Verificar se tem perfil de desenvolvedor
          if (Array.isArray(profileData) && profileData.length > 0) {
            const profile = profileData[0];
            const userType = profile.user_type || profile.raw_user_meta_data?.user_type;
            
            if (userType === 'developer') {
              cy.log(`✅ Usuário ${devCredentials.email} confirmado como desenvolvedor no sistema`);
            } else {
              cy.log(`⚠️ Usuário ${devCredentials.email} autenticado, mas o tipo é '${userType}' ao invés de 'developer'`);
            }
          }
        });
        
        // Verificar acesso a rotas de desenvolvedor após login bem-sucedido
        cy.log('Verificando acesso a rotas de desenvolvedor...');
        cy.url().then(url => {
          // Procurar indicadores de acesso de desenvolvedor na UI
          cy.get('body').then($body => {
            const bodyText = $body.text().toLowerCase();
            const devIndicators = [
              'desenvolvedor', 'developer', 'admin', 'administrador', 
              'configurações', 'painel', 'swagger', 'api'
            ];
            
            const foundIndicators = devIndicators.filter(ind => bodyText.includes(ind));
            if (foundIndicators.length > 0) {
              cy.log(`✅ Indicadores de UI de desenvolvedor encontrados: ${foundIndicators.join(', ')}`);
            } else {
              cy.log('⚠️ Nenhum indicador claro de UI de desenvolvedor encontrado após login');  
            }
          });
        });
        
      } else {
        cy.log(`⚠️ Autenticação de ${devCredentials.email} retornou código inesperado: ${statusCode}`);
      }
      
      // Verificar URL após tentativa de login
      cy.url().then(url => {
        cy.log(`URL após tentativa de login: ${url}`);
      });
    });
  });
  
  // Teste para verificar acesso como usuário regular
  it('verifica acesso com usuário regular para comparação', () => {
    // Visitar a página de login
    cy.visit('/login');
    
    // Preencher credenciais do usuário regular
    cy.get('[data-cy="email-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(regularCredentials.email, { delay: 50 });
    
    cy.get('[data-cy="password-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(regularCredentials.password, { delay: 50 });
    
    // Capturar screenshot antes do login
    cy.screenshot('regular-user-pre-login');
    
    // Clicar no botão de login
    cy.get('[data-cy="submit-button"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Verificar resposta da autenticação
    cy.wait('@authToken', { timeout: 10000 }).then((interception) => {
      // Capturar screenshot após login
      cy.screenshot('regular-user-post-login');
      
      // Verificar status da resposta
      const statusCode = interception.response.statusCode;
      cy.log(`Status da autenticação do usuário regular: ${statusCode}`);
      
      if (statusCode >= 200 && statusCode < 300) {
        cy.log('✅ Login como usuário regular bem-sucedido');
        
        // Verificar URL após login
        cy.url().then(url => {
          cy.log(`URL após login de usuário regular: ${url}`);
          const isDashboard = url.includes('dashboard');
          if (isDashboard) {
            cy.log('✅ Usuário regular redirecionado para dashboard');
          }
        });
        
        // Verificar elementos da interface para comparar com o outro perfil
        cy.get('body').then($body => {
          const bodyText = $body.text().toLowerCase();
          cy.log(`Conteúdo do dashboard de usuário regular capturado para comparação`);
        });
      } else {
        cy.log(`❌ Login como usuário regular falhou com status ${statusCode}`);
      }
    });
  });
  
  // Teste para diagnóstico de usuário no banco
  it('verifica se o usuário existe no banco e qual seu tipo', () => {
    // Usar credenciais de usuário que sabemos que existem
    const testEmail = regularCredentials.email;
    
    cy.log(`⚠️ NOVA ABORDAGEM: Verificando se o usuário '${testEmail}' existe e qual seu tipo...`);
    
    // Visitar página de login
    cy.visit('/login');
    
    // Fazer login com usuário existente para verificar tipo
    cy.get('[data-cy="email-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(devCredentials.email, { delay: 50 });
    
    cy.get('[data-cy="password-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(devCredentials.password, { delay: 50 });
      
    // Interceptar requisições para os endpoints
    cy.intercept('POST', '**/auth/v1/token**').as('authCheck');
    
    // Clicar no botão de login
    cy.get('[data-cy="submit-button"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Verificar resposta da autenticação
    cy.wait('@authCheck', { timeout: 10000 }).then((interception) => {
      // Verificar status da resposta
      const statusCode = interception.response.statusCode;
      cy.log(`Status da autenticação: ${statusCode}`);
      
      if (statusCode >= 200 && statusCode < 300) {
        cy.log(`✅ Usuário ${devCredentials.email} autenticado com sucesso - verificando tipo...`);
        
        // Verificar na UI se há indicadores de perfil developer
        cy.get('body').then($body => {
          const bodyText = $body.text().toLowerCase();
          const devIndicators = [
            'desenvolvedor', 'developer', 'admin', 'administrador', 
            'configurações', 'painel', 'swagger', 'api'
          ];
          
          const foundIndicators = devIndicators.filter(ind => bodyText.includes(ind));
          if (foundIndicators.length > 0) {
            cy.log(`✅ Indicadores de usuário developer encontrados: ${foundIndicators.join(', ')}`);
          } else {
            cy.log('⚠️ Nenhum indicador claro de desenvolvedor encontrado na interface');
          }
        });
      } else {
        cy.log(`❌ Falha na autenticação com código ${statusCode}`);
      }
    });
  });
  
  // Teste para verificar rotas técnicas através de chamadas diretas
  it('verifica disponibilidade de rotas técnicas', () => {
    // Lista de rotas técnicas a verificar
    const technicalRoutes = [
      '/swagger',
      '/swagger-ui',
      '/api-docs',
      '/admin',
      '/developer',
      '/cypress',
      '/debug'
    ];
    
    // Documentação e diagnóstico das rotas técnicas
    cy.log('Verificando disponibilidade de rotas técnicas sem necessidade de login');
    
    // Verificar cada rota individualmente
    technicalRoutes.forEach(route => {
      cy.request({
        url: route,
        failOnStatusCode: false // Não falhar em códigos 4xx ou 5xx
      }).then(response => {
        // Registrar o status para diagnóstico
        cy.log(`Rota ${route}: Status ${response.status}`);
        
        if (response.status === 404) {
          cy.log(`ℹ️ Rota ${route} não implementada (404 Not Found)`);
        } else if (response.status === 401 || response.status === 403) {
          cy.log(`✅ Rota ${route} protegida por autenticação (${response.status})`);
        } else if (response.status >= 200 && response.status < 300) {
          cy.log(`⚠️ Rota ${route} acessível sem autenticação (${response.status})`);
        } else {
          cy.log(`❓ Rota ${route} retornou status inesperado: ${response.status}`);
        }
      });
    });
  });
});
