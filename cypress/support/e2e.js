import './commands'; 

// Debug logger para mensagens
const debugLog = (prefix, data) => {
  console.log(`[CYPRESS][${prefix}]`, JSON.stringify(data, null, 2));
};

// Ignorar erros específicos que não devem falhar os testes
Cypress.on('uncaught:exception', (err, runnable) => {
  debugLog('UNCAUGHT_EXCEPTION', {
    message: err.message,
    stack: err.stack
  });

  // Lista de erros conhecidos que podem ser ignorados
  const ignoredErrors = [
    'startsWith is not a function',
    'useUser must be used within a UserProvider',
    'Cannot read properties of null',
    'ResizeObserver loop limit exceeded'
  ];

  // Verificar se o erro está na lista de ignorados
  const shouldIgnore = ignoredErrors.some(errorMsg => 
    err.message && err.message.includes(errorMsg)
  );

  if (shouldIgnore) {
    debugLog('IGNORED_ERROR', { message: err.message });
    return false;
  }

  return true;
});

// Adicionar comando customizado para login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  
  // Aguardar a página carregar completamente
  cy.contains('EduConnect', { timeout: 10000 });
  
  cy.get('input[type="email"]', { timeout: 10000 }).type(email);
  cy.get('input[type="password"]', { timeout: 10000 }).type(password);
  cy.get('button[type="submit"]', { timeout: 10000 }).click();
});

// Log de eventos para debug
Cypress.on('window:before:load', (win) => {
  // Interceptar mensagens da janela
  win.addEventListener('message', (event) => {
    try {
      debugLog('WINDOW_MESSAGE', {
        data: event.data,
        type: typeof event.data,
        keys: event.data && typeof event.data === 'object' ? Object.keys(event.data) : [],
        source: event.source?.toString(),
        origin: event.origin
      });
    } catch (error) {
      debugLog('WINDOW_MESSAGE_ERROR', { error: error.message });
    }
  });

  // Interceptar console.error
  const originalError = win.console.error;
  win.console.error = (...args) => {
    debugLog('CONSOLE_ERROR', args);
    originalError.apply(win.console, args);
  };
});

// Log de requisições de rede
Cypress.on('log:added', (attrs, log) => {
  if (attrs.displayName === 'xhr' || attrs.displayName === 'fetch') {
    debugLog('NETWORK_REQUEST', {
      url: attrs.url,
      method: attrs.method,
      status: attrs.status,
      duration: attrs.duration
    });
  }
}); 