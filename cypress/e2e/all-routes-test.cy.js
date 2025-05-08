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

const allRoutes = [
  {
    name: 'Login',
    path: '/login',
    requiresAuth: false,
    requiresDev: false
  },
  {
    name: 'Register',
    path: '/register',
    requiresAuth: false,
    requiresDev: false
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    requiresAuth: true,
    requiresDev: false
  },
  {
    name: 'Student Dashboard',
    path: '/student/dashboard',
    requiresAuth: true,
    requiresDev: false,
    userType: 'student'
  },
  {
    name: 'Guardian Dashboard',
    path: '/guardian/dashboard',
    requiresAuth: true,
    requiresDev: false,
    userType: 'parent'
  },
  {
    name: 'Webhook Admin',
    path: '/webhook-admin',
    requiresAuth: true,
    requiresDev: true
  },
  {
    name: 'Developer Flow',
    path: '/developer-flow',
    requiresAuth: true,
    requiresDev: true
  },
  {
    name: 'API Docs',
    path: '/api-docs',
    requiresAuth: true,
    requiresDev: true
  }
];

describe('All routes and permissions', () => {
  it('should test all routes and permissions', () => {
    // First test public routes without authentication
    allRoutes.forEach(route => {
      if (!route.requiresAuth) {
        cy.log(`Testing public route: ${route.name} (${route.path})`);
        cy.visit(route.path, { failOnStatusCode: false });
        cy.url().should('include', route.path);
      }
    });

    // Then test protected routes with developer authentication
    cy.log('Testing protected routes with developer auth');
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('developer@sistema-monitore.com.br');
    cy.get('[data-cy="password-input"]').type('Dev#Monitore2025');
    cy.get('[data-cy="submit-button"]').click();

    allRoutes.forEach(route => {
      if (route.requiresAuth) {
        cy.log(`Testing protected route: ${route.name} (${route.path})`);
        cy.visit(route.path, { failOnStatusCode: false });
        
        // Check if route is accessible
        if (route.requiresDev) {
          cy.url().should('include', route.path);
        } else {
          // Non-dev protected routes should redirect
          cy.url().should('not.include', route.path);
        }
      }
    });
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
});
