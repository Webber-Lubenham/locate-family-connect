/**
 * Teste de diagnóstico para o Dashboard do Responsável
 * Foco em identificar por que as localizações dos estudantes não estão sendo exibidas
 */

describe('Diagnóstico Dashboard do Responsável', () => {
  // Usuário responsável para teste
  const parentUser = {
    email: 'frankwebber33@hotmail.com',
    password: 'Escola2025!'  // Credencial atualizada
  };
  
  // Outras credenciais para referência
  const studentUser = {
    email: 'cetisergiopessoa@gmail.com',
    password: '4EG8GsjBT5KjD3k'
  };
  
  const developerUser = {
    email: 'developer@sistema-monitore.com.br',
    password: 'Dev#Monitore2025',
    type: 'developer'
  };

  beforeEach(() => {
    // Interceptar chamadas de API relacionadas a localizações para diagnóstico
    cy.intercept('GET', '**/rest/v1/locations*').as('locationsRequest');
    cy.intercept('POST', '**/rest/v1/rpc/get_student_locations_for_guardian*').as('guardianLocationsRPC');
    
    // Limpar estado e fazer login como responsável
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('/login', { timeout: 10000 });
    cy.get('[data-cy="email-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(parentUser.email, { delay: 50 });
    
    cy.get('[data-cy="password-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(parentUser.password, { delay: 50 });
    
    cy.get('[data-cy="submit-button"]', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Aguardar redirecionamento para o dashboard do responsável
    cy.url({ timeout: 30000 }).should('include', '/parent-dashboard');
    cy.log('✅ Login como responsável realizado com sucesso');
  });

  it('investiga a carga de estudantes vinculados no dashboard', () => {
    // Verificar se a lista de estudantes está sendo carregada
    cy.get('[data-cy="students-list"]', { timeout: 15000 })
      .should('exist')
      .then(($list) => {
        // Verificar quantos estudantes estão vinculados
        const studentCount = $list.find('[data-cy="student-item"]').length;
        cy.log(`Encontrados ${studentCount} estudantes vinculados`);
        
        if (studentCount === 0) {
          cy.log('⚠️ ERRO: Nenhum estudante vinculado encontrado');
        } else {
          cy.log('✅ Lista de estudantes carregada com sucesso');
        }
      });
  });

  it('analisa a seleção de estudante e carregamento de localização', () => {
    // Aguardar carregamento da lista de estudantes
    cy.get('[data-cy="students-list"]', { timeout: 15000 }).should('exist');
    
    // Pegar primeiro estudante da lista para teste
    cy.get('[data-cy="student-item"]').first().as('firstStudent');
    
    // Coletar informações do estudante antes de clicar
    cy.get('@firstStudent').find('[data-cy="student-name"]').invoke('text').as('studentName');
    cy.get('@firstStudent').find('[data-cy="student-email"]').invoke('text').as('studentEmail');
    
    // Clicar no primeiro estudante
    cy.get('@firstStudent').click();
    cy.log('Estudante selecionado para verificação');
    
    // Verificar se houve chamada para buscar localizações via RPC
    cy.wait('@guardianLocationsRPC', { timeout: 15000 })
      .then((interception) => {
        // Transformar em array para manter compatibilidade com o resto do código
        const interceptions = [interception];
        // Verificar qual interceptação ocorreu
        const requests = interceptions.filter(intercept => intercept !== undefined);
        if (requests.length === 0) {
          cy.log('⚠️ ERRO: Nenhuma requisição de localização interceptada');
        } else {
          requests.forEach(req => {
            cy.log(`Requisição interceptada: ${req.request.url}`);
            cy.log(`Status: ${req.response?.statusCode || 'N/A'}`);
            
            if (req.response?.body) {
              const data = req.response.body;
              const locationsCount = Array.isArray(data) ? data.length : (data.data ? data.data.length : 0);
              cy.log(`Localizações retornadas: ${locationsCount}`);
              
              if (locationsCount === 0) {
                cy.log('⚠️ ERRO: Nenhuma localização encontrada para o estudante');
              } else {
                cy.log('✅ Localizações carregadas da API');
              }
            } else {
              cy.log('⚠️ Sem dados no corpo da resposta');
            }
            
            if (req.response?.statusCode >= 400) {
              cy.log(`⚠️ ERRO: ${req.response.statusMessage || 'Erro na requisição'}`);
            }
          });
        }
      });
    
    // Verificar componente de mapa
    cy.get('[data-cy="map-container"]', { timeout: 10000 })
      .should('exist')
      .then(() => {
        cy.log('✅ Componente de mapa carregado');
      });
    
    // Verificar mensagem de "Nenhuma localização encontrada" se presente
    cy.get('body').then(($body) => {
      const hasNoLocationsMessage = $body.text().includes('Nenhuma localização encontrada');
      if (hasNoLocationsMessage) {
        cy.log('⚠️ PROBLEMA DETECTADO: Mensagem "Nenhuma localização encontrada" está presente');
        
        // Verificar no console se há erros
        cy.window().then((win) => {
          const consoleLogSpy = cy.spy(win.console, 'log');
          const consoleErrorSpy = cy.spy(win.console, 'error');
          
          // Forçar uma atualização (tentativa de reload)
          cy.get('@firstStudent').click();
          
          // Verificar logs após algum tempo
          cy.wait(1000).then(() => {
            const logs = consoleLogSpy.getCalls().map(call => call.args.join(' '));
            const errors = consoleErrorSpy.getCalls().map(call => call.args.join(' '));
            
            if (logs.length > 0) {
              cy.log('📋 Logs do console:');
              logs.forEach(log => cy.log(`  ${log}`));
            }
            
            if (errors.length > 0) {
              cy.log('🚨 Erros do console:');
              errors.forEach(error => cy.log(`  ${error}`));
            }
          });
        });
      } else {
        cy.log('✅ Localizações exibidas corretamente');
      }
    });
  });

  it('testa função RPC diretamente para verificar acesso', () => {
    // Primeiro, obter o ID de um estudante
    cy.get('[data-cy="students-list"]', { timeout: 15000 }).should('exist');
    cy.get('[data-cy="student-item"]').first().click();
    
    // Extrair o ID do estudante do estado da aplicação
    cy.window().then((win) => {
      // Esperamos 1 segundo para garantir que o componente foi montado
      cy.wait(1000);
      
      // Tentar obter o ID do estudante selecionado
      if (win.selectedStudentId) {
        const studentId = win.selectedStudentId;
        cy.log(`ID do estudante obtido: ${studentId}`);
        
        // Executar a função RPC manualmente
        cy.request({
          method: 'POST',
          url: `${Cypress.env('SUPABASE_URL')}/rest/v1/rpc/get_student_locations_for_guardian`,
          headers: {
            'apikey': Cypress.env('SUPABASE_ANON_KEY'),
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: {
            p_student_id: studentId
          },
          failOnStatusCode: false
        }).then((response) => {
          cy.log(`Status da chamada RPC: ${response.status}`);
          
          if (response.status >= 400) {
            cy.log(`⚠️ ERRO na chamada RPC: ${response.statusText}`);
            cy.log(JSON.stringify(response.body));
          } else {
            const locations = response.body;
            cy.log(`Localizações retornadas pela RPC: ${locations.length}`);
            
            if (locations.length === 0) {
              cy.log('⚠️ PROBLEMA CONFIRMADO: A função RPC não retorna localizações');
            } else {
              cy.log('✅ A função RPC retorna localizações corretamente');
              cy.log('⚠️ O problema está na renderização ou em outra parte do fluxo');
            }
          }
        });
      } else {
        cy.log('⚠️ Não foi possível obter o ID do estudante do estado da aplicação');
      }
    });
  });
});
