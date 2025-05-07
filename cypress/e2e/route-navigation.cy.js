describe('Route Navigation Tests', () => {
  const routes = {
    public: [
      '/',
      '/login',
      '/forgot-password',
      '/reset-password/:token'
    ],
    student: [
      '/student/dashboard',
      '/student/profile',
      '/student/location',
      '/student/settings'
    ],
    guardian: [
      '/guardian/dashboard',
      '/guardian/students',
      '/guardian/profile',
      '/guardian/settings'
    ],
    admin: [
      '/admin/dashboard',
      '/admin/users',
      '/admin/webhook',
      '/admin/settings'
    ],
    developer: [
      '/developer/dashboard',
      '/developer/flow',
      '/developer/config',
      '/developer/logs'
    ]
  };

  const credentials = {
    student: {
      email: 'student@sistema-monitore.com.br',
      password: 'Student#2025'
    },
    guardian: {
      email: 'guardian@sistema-monitore.com.br',
      password: 'Guardian#2025'
    },
    admin: {
      email: 'admin@sistema-monitore.com.br',
      password: 'Admin#2025'
    },
    developer: {
      email: 'developer@sistema-monitore.com.br',
      password: 'Dev#Monitore2025'
    }
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // Test public routes
  describe('Public Routes', () => {
    routes.public.forEach(route => {
      it(`should load ${route} without authentication`, () => {
        cy.visit(route);
        cy.url().should('include', route);
        cy.get('body').should('be.visible');
      });
    });
  });

  // Test authenticated routes for each user type
  Object.entries(routes).forEach(([userType, userRoutes]) => {
    if (userType === 'public') return;

    describe(`${userType} Routes`, () => {
      beforeEach(() => {
        const { email, password } = credentials[userType];
        cy.visit('/login');
        cy.get('[data-cy="email-input"]').type(email);
        cy.get('[data-cy="password-input"]').type(password);
        cy.get('[data-cy="submit-button"]').click();
        cy.url().should('not.include', '/login');
      });

      userRoutes.forEach(route => {
        it(`should allow ${userType} to access ${route}`, () => {
          cy.visit(route);
          cy.url().should('include', route);
          cy.get('body').should('be.visible');
          
          // Verify specific elements for each route type
          if (route.includes('dashboard')) {
            cy.get('[data-cy="dashboard-header"]').should('be.visible');
          }
          if (route.includes('profile')) {
            cy.get('[data-cy="profile-header"]').should('be.visible');
          }
        });
      });

      // Test navigation between routes
      it(`should allow ${userType} to navigate between routes`, () => {
        cy.visit(userRoutes[0]);
        userRoutes.forEach((route, index) => {
          if (index > 0) {
            cy.visit(route);
            cy.url().should('include', route);
            cy.get('body').should('be.visible');
          }
        });
      });

      // Test back button navigation
      it(`should allow ${userType} to navigate back`, () => {
        cy.visit(userRoutes[0]);
        cy.visit(userRoutes[1]);
        cy.go('back');
        cy.url().should('include', userRoutes[0]);
      });
    });
  });

  // Test unauthorized access
  describe('Unauthorized Access', () => {
    Object.entries(routes).forEach(([userType, userRoutes]) => {
      if (userType === 'public') return;

      userRoutes.forEach(route => {
        it(`should not allow unauthorized access to ${route}`, () => {
          cy.visit(route);
          cy.url().should('include', '/login');
        });
      });
    });
  });

  // Test route redirects
  describe('Route Redirects', () => {
    it('should redirect to login when not authenticated', () => {
      cy.visit('/student/dashboard');
      cy.url().should('include', '/login');
    });

    it('should redirect to appropriate dashboard after login', () => {
      const { email, password } = credentials.student;
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type(email);
      cy.get('[data-cy="password-input"]').type(password);
      cy.get('[data-cy="submit-button"]').click();
      cy.url().should('include', '/student/dashboard');
    });
  });
});
