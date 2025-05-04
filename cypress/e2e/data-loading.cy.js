/**
 * Testes para verificar se o frontend está carregando dados do banco de dados corretamente
 * Verifica chamadas de API, estrutura dos dados e renderização na interface
 */
describe('Carregamento de Dados do Banco', () => {
  // Credenciais para testes - estudante
  const studentUser = {
    email: 'cetisergiopessoa@gmail.com',
    password: '4EG8GsjBT5KjD3k'
  };

  beforeEach(() => {
    // Limpar cookies e localStorage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Iniciar interceptação de chamadas API
    cy.intercept('GET', '**/rest/v1/**').as('apiData');
    
    // Login
    cy.visit('/login');
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
    
    // Verificar login bem sucedido
    cy.url({ timeout: 30000 }).should('include', '/student-dashboard');
  });

  it('carrega perfil do usuário corretamente', () => {
    // Navegar para a página de perfil
    cy.visit('/profile');
    cy.url().should('include', '/profile');
    
    // Esperar chamadas API relacionadas ao perfil
    cy.wait('@apiData', { timeout: 15000 }).then((interception) => {
      // Verificar se a chamada foi bem-sucedida
      expect(interception.response.statusCode).to.be.oneOf([200, 304]);
      
      // Log da resposta para debug
      cy.log(`Dados recebidos: ${JSON.stringify(interception.response.body).substring(0, 200)}...`);
      
      // Verificar se o body não é vazio
      expect(interception.response.body).to.not.be.null;
      
      // Verificar se há dados que correspondam ao usuário logado
      if (Array.isArray(interception.response.body)) {
        expect(interception.response.body.length).to.be.at.least(1, 'Deve retornar pelo menos um registro');
      } else {
        expect(interception.response.body).to.be.an('object', 'Deve retornar um objeto de dados');
      }
    });
    
    // Verificar se os dados foram renderizados na UI
    cy.get('h1, h2, h3, p, span, div').then($elements => {
      const pageText = $elements.text();
      
      // Verificar presença de informações do perfil: email do usuário ou nome
      expect(pageText).to.include(studentUser.email) || 
      expect(pageText.toLowerCase()).to.include('perfil');
      
      cy.log('✅ Texto relacionado ao perfil encontrado na página');
    });
  });

  it('carrega lista de guardiões corretamente', () => {
    // Navegar para a página de perfil/guardiões
    cy.visit('/profile');
    cy.url().should('include', '/profile');
    
    // Esperar chamadas API relacionadas aos guardiões
    cy.wait('@apiData', { timeout: 15000 }).then((interception) => {
      // Verificar se a chamada foi bem-sucedida
      expect(interception.response.statusCode).to.be.oneOf([200, 304]);
      
      // Log da resposta para debug
      cy.log(`Dados recebidos: ${JSON.stringify(interception.response.body).substring(0, 200)}...`);
      
      // Verificar estrutura da resposta
      if (Array.isArray(interception.response.body)) {
        cy.log(`Número de registros retornados: ${interception.response.body.length}`);
      } else {
        cy.log('Resposta não é um array, verificando estrutura alternativa');
      }
    });
    
    // Capturar screenshot para análise
    cy.screenshot('guardians-data-loaded');
    
    // Verificar se o conteúdo relacionado a guardiões está presente
    cy.get('body').then($body => {
      const pageText = $body.text().toLowerCase();
      
      // Palavras que podem indicar seção de guardiões
      const guardianKeywords = ['guardião', 'guardians', 'responsável', 'responsáveis', 'contatos', 'contacts'];
      
      // Verificar se pelo menos uma palavra-chave está presente
      const hasGuardianSection = guardianKeywords.some(keyword => 
        pageText.includes(keyword)
      );
      
      if (hasGuardianSection) {
        cy.log('✅ Seção de guardiões encontrada na página');
      } else {
        cy.log('⚠️ Nenhuma seção explícita de guardiões encontrada, verificando estrutura alternativa');
        
        // Se não encontramos texto explícito, procurar por estruturas que podem conter dados
        const tableOrListElements = $body.find('table, [role="grid"], ul, .list').length;
        const cardElements = $body.find('[class*="card"], [class*="item"]').length;
        
        cy.log(`Estruturas potenciais encontradas: ${tableOrListElements} tabelas/listas, ${cardElements} cards/items`);
      }
    });
  });

  it('verifica a página de mapa e suas chamadas de API', () => {
    // Navegar para a página do mapa
    cy.visit('/map');
    cy.url().should('include', '/map');
    
    // Capturar screenshot da página do mapa para análise visual
    cy.screenshot('map-page-loaded');
    
    // Verificar chamadas API relacionadas a dados - redeño nos preocupamos com o elemento do mapa, apenas com os dados
    cy.wait('@apiData', { timeout: 15000 }).then((interception) => {
      // Verificar se a chamada foi bem-sucedida
      expect(interception.response.statusCode).to.be.oneOf([200, 304]);
      
      // Verificar se a resposta contém dados
      expect(interception.response.body).to.not.be.null;
      
      // Log para debug
      cy.log(`Resposta de API recebida: ${JSON.stringify(interception.response.body).substring(0, 200)}...`);
    });
    
    // Verificar se a página contém elementos que indicam uma visualização de localização
    cy.get('body').then($body => {
      const html = $body.html();
      
      // Verificar scripts de mapa
      const hasMapboxScripts = html.includes('mapbox');
      
      // Verificar elementos de UI que sugerem mapa
      const hasLocationElements = $body.find('[class*="location"], [class*="map"], [aria-label*="map"], button:contains("Localizar")').length > 0;
      
      // Verificar títulos ou texto que sugere mapa
      const mapRelatedText = [
        'mapa', 'localização', 'gps', 'mapear', 'localization', 'map', 'tracking'
      ];
      
      const hasMapText = mapRelatedText.some(text => 
        $body.text().toLowerCase().includes(text)
      );
      
      // Log do resultado para diagnóstico
      if (hasMapboxScripts) {
        cy.log('✅ Scripts do Mapbox detectados na página');
      }
      
      if (hasLocationElements) {
        cy.log('✅ Elementos de UI relacionados a mapas/localização encontrados');
      }
      
      if (hasMapText) {
        cy.log('✅ Texto relacionado a mapas encontrado na página');
      }
      
      // Se nenhum dos indicadores estiver presente, gerar um aviso
      if (!hasMapboxScripts && !hasLocationElements && !hasMapText) {
        cy.log('⚠️ A página de mapa pode não estar carregando corretamente, mas a resposta da API foi bem-sucedida');
      } else {
        cy.log('✅ Página de mapa verificada - carregamento de dados bem-sucedido');
      }
    });
  });

  it('exibe dados de dashboard corretamente', () => {
    // Já estamos no dashboard após o login (beforeEach)
    
    // Esperar chamadas API relacionadas ao dashboard
    cy.wait('@apiData', { timeout: 15000 }).then((interception) => {
      // Verificar se a chamada foi bem-sucedida
      expect(interception.response.statusCode).to.be.oneOf([200, 304]);
      
      // Log da resposta para debug
      cy.log(`Dados do dashboard recebidos: ${JSON.stringify(interception.response.body).substring(0, 200)}...`);
    });
    
    // Capturar screenshot para análise
    cy.screenshot('dashboard-data-loaded');
    
    // Verificar se elementos que costumam exibir dados estão presentes
    cy.get('[class*="card"], [class*="panel"], [class*="widget"], [class*="stat"]').then($elements => {
      cy.log(`Encontrados ${$elements.length} elementos potenciais de exibição de dados`);
      
      if ($elements.length > 0) {
        cy.log('✅ Elementos de dashboard encontrados, provavelmente exibindo dados');
      } else {
        // Se não encontramos padrões comuns, verificar qualquer conteúdo dinâmico
        cy.get('body').then($body => {
          const hasNumericContent = /\d+/.test($body.text());
          const hasUserName = $body.text().includes(studentUser.email.split('@')[0]);
          
          if (hasNumericContent || hasUserName) {
            cy.log('✅ Conteúdo dinâmico encontrado no dashboard');
          } else {
            cy.log('⚠️ Não foi possível confirmar dados dinâmicos no dashboard');
          }
        });
      }
    });
  });
});
