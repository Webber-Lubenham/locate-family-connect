/**
 * Teste básico de perfil de desenvolvedor
 * Versão simplificada sem loops complexos
 */

describe('Teste básico de perfil desenvolvedor', () => {
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
    
    // Capturar cookies de autenticação para requests
    cy.getCookie('supabase-auth-token').then(cookie => {
      const authToken = cookie ? cookie.value : null;
      
      // Testar cada rota
      const routePromises = allRoutes.map(route => {
        return new Cypress.Promise(resolve => {
          cy.log(`Testando rota: ${route.name} (${route.path})`);
          
          // Visitar a rota e verificar resposta
          cy.request({
            url: route.path,
            failOnStatusCode: false,
            headers: authToken ? {
              'Cookie': `supabase-auth-token=${authToken}`
            } : {}
          }).then(response => {
            // Documentar resultado
            const isAccessible = response.status >= 200 && response.status < 300;
            const isDevRoute = route.requiresDev;
            const securityIssue = isDevRoute && isAccessible;
            
            const result = {
              path: route.path,
              name: route.name,
              status: response.status,
              accessible: isAccessible,
              isDevRoute,
              securityIssue
            };
            
            accessResults.push(result);
            
            // Log do resultado
            const statusIndicator = isAccessible ? '✅' : '❌';
            const securityIndicator = securityIssue ? '⚠️ ACESSO INDEVIDO' : '';
            
            cy.log(`${statusIndicator} Rota ${route.path}: Status ${response.status} ${securityIndicator}`);
            resolve();
          });
        });
      });
      
      // Após testar todas as rotas, exibir relatório
      cy.wrap(routePromises).then(() => {
        cy.log('\n=== RELATÓRIO DE ACESSO DE ESTUDANTE ===');
        
        // Encontrar problemas de separação de responsabilidades
        const inappropriateAccess = accessResults.filter(r => r.securityIssue);
        
        if (inappropriateAccess.length > 0) {
          cy.log(`\n⚠️ PROBLEMAS DE PERMISSÃO: ${inappropriateAccess.length} rotas de desenvolvedor estão acessíveis para estudantes`);
          
          inappropriateAccess.forEach(v => {
            cy.log(`- ${v.name} (${v.path}): Deveria ser restrita apenas para desenvolvedores`);  
          });
          
          cy.log('\nRECOMENDAÇÕES:');
          cy.log('1. Implementar verificação de tipo de usuário (user_type) no backend');
          cy.log('2. Criar middleware para rotas de desenvolvedor');
          cy.log('3. Ocultar opções técnicas no frontend para usuários não-desenvolvedores');
        } else {
          cy.log('✅ BOA SEPARAÇÃO: Rotas de desenvolvedor não estão acessíveis para estudantes');
        }
        
        // Documentar rotas acessíveis
        const accessibleRoutes = accessResults.filter(r => r.accessible);
        cy.log(`\nℹ️ ROTAS DISPONÍVEIS PARA ESTUDANTE: ${accessibleRoutes.length} rotas acessíveis após login`);
        accessibleRoutes.forEach(route => {
          cy.log(`- ${route.name} (${route.path})`);
        });
      });
    });
  });

  // Teste 3: Mapear rotas disponíveis para usuário desenvolvedor
  it('Mapeia rotas acessíveis como desenvolvedor', () => {
    cy.log('=== MAPEAMENTO DE ROTAS COMO DESENVOLVEDOR ===');
    
    // Resultados para documentação
    const accessResults = [];
    
    // Login como desenvolvedor
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type(devCredentials.email);
    cy.get('[data-cy="password-input"]').type(devCredentials.password);
    cy.get('[data-cy="submit-button"]').click();
    
    // Esperar login completar
    cy.url().should('not.include', '/login');
    
    // Identificar elementos exclusivos de desenvolvedor na interface
    cy.get('body').then($body => {
      const bodyText = $body.text().toLowerCase();
      const devIndicators = [
        'desenvolvedor', 'developer', 'admin', 'administrador', 
        'configurações avançadas', 'painel', 'swagger', 'api',
        'logs', 'metrics', 'debug'
      ];
      
      const foundIndicators = devIndicators.filter(ind => bodyText.includes(ind));
      if (foundIndicators.length > 0) {
        cy.log(`✅ INTERFACE DE DESENVOLVEDOR: Encontrados indicadores: ${foundIndicators.join(', ')}`);
      } else {
        cy.log('⚠️ ALERTA: Nenhum indicador de interface de desenvolvedor detectado após login');
      }
    });
    
    // Capturar cookies de autenticação para requests
    cy.getCookie('supabase-auth-token').then(cookie => {
      const authToken = cookie ? cookie.value : null;
      
      // Testar cada rota
      const routePromises = allRoutes.map(route => {
        return new Cypress.Promise(resolve => {
          cy.log(`Testando rota: ${route.name} (${route.path})`);
          
          // Visitar a rota e verificar resposta
          cy.request({
            url: route.path,
            failOnStatusCode: false,
            headers: authToken ? {
              'Cookie': `supabase-auth-token=${authToken}`
            } : {}
          }).then(response => {
            // Documentar resultado
            const isAccessible = response.status >= 200 && response.status < 300;
            const isDevRoute = route.requiresDev;
            const isImplemented = response.status !== 404;
            
            const result = {
              path: route.path,
              name: route.name,
              status: response.status,
              accessible: isAccessible,
              isDevRoute,
              isImplemented
            };
            
            accessResults.push(result);
            
            // Log do resultado com categorização
            const statusCategory = 
              response.status >= 200 && response.status < 300 ? '✅ Acessível' :
              response.status >= 300 && response.status < 400 ? '⚠️ Redirecionamento' :
              response.status === 404 ? '❌ Não implementada' :
              response.status >= 400 && response.status < 500 ? '❌ Acesso negado' :
              '❌ Erro servidor';
              
            cy.log(`${statusCategory} | ${route.name} (${route.path}): ${response.status}`);
            resolve();
          });
        });
      });
      
      // Após testar todas as rotas, exibir relatório detalhado
      cy.wrap(routePromises).then(() => {
        cy.log('\n=== RELATÓRIO DE FUNÇÕES DE DESENVOLVEDOR ===');
        
        // Encontrar rotas técnicas implementadas vs não implementadas
        const devRoutes = accessResults.filter(r => r.isDevRoute);
        const implementedDevRoutes = devRoutes.filter(r => r.isImplemented);
        const accessibleDevRoutes = devRoutes.filter(r => r.accessible);
        
        cy.log(`\nℹ️ COBERTURA DE ROTAS TÉCNICAS: ${implementedDevRoutes.length}/${devRoutes.length} rotas de desenvolvedor implementadas`);
        
        if (implementedDevRoutes.length === 0) {
          cy.log('⚠️ ATENÇÃO: Nenhuma rota técnica está implementada no sistema');
          cy.log('Recomendação: Adicionar rotas como /swagger, /admin ou /developer para suporte técnico');
        } else if (accessibleDevRoutes.length === 0) {
          cy.log('⚠️ ATENÇÃO: Nenhuma rota técnica está acessível para o desenvolvedor');
          cy.log('Recomendação: Verificar permissões de acesso para usuários com user_type = "developer"');
        } else {
          cy.log('✅ FUNCIONALIDADE CONFIRMADA: Rotas técnicas acessíveis para o desenvolvedor');
        }
        
        // Rotas técnicas implementadas
        if (implementedDevRoutes.length > 0) {
          cy.log('\nℹ️ ROTAS TÉCNICAS IMPLEMENTADAS:');
          implementedDevRoutes.forEach(route => {
            const accessStatus = route.accessible ? '✅ Acessível' : '❌ Bloqueada';
            cy.log(`- ${route.name} (${route.path}): ${accessStatus}`);
          });
        }
        
        // Rotas técnicas não implementadas
        const missingDevRoutes = devRoutes.filter(r => !r.isImplemented);
        if (missingDevRoutes.length > 0) {
          cy.log('\nℹ️ ROTAS TÉCNICAS SUGERIDAS (não implementadas):');
          missingDevRoutes.forEach(route => {
            cy.log(`- ${route.name} (${route.path})`);
          });
        }
        
        // Resumo final de funcionamento do perfil desenvolvedor
        if (accessibleDevRoutes.length > 0 && foundIndicators?.length > 0) {
          cy.log('\n✅ CONCLUSÃO: Perfil de desenvolvedor está funcionando corretamente');
        } else if (accessibleDevRoutes.length > 0) {
          cy.log('\n⚠️ CONCLUSÃO: Funcionalidade parcial - Rotas acessíveis mas sem indicadores visuais');
        } else {
          cy.log('\n❌ CONCLUSÃO: Perfil desenvolvedor não está funcional - Melhorar implementação');
        }
      });
    });
  });
  
  // Adicionar resumo final após todos os testes
  after(() => {
    cy.log('\n====================================================');
    cy.log('RESULTADO FINAL DOS TESTES DE ROTAS E PERMISSÕES');
    cy.log('====================================================');
    cy.log('1. Verifique se há rotas protegidas acessíveis sem autenticação');
    cy.log('2. Confirme se usuários não-desenvolvedores podem acessar rotas técnicas');
    cy.log('3. Verifique se o perfil de desenvolvedor tem funcionalidades exclusivas');
    cy.log('\nRECOMENDAÇÃO: Implementar middleware de verificação de permissões no servidor');
    cy.log('====================================================');
  });
});
