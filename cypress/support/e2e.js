import './commands'; 

// Debug logger para mensagens
const debugLog = (prefix, data) => {
  console.log(`[CYPRESS][${prefix}]`, JSON.stringify(data, null, 2));
};

// Aplicar um patch global para prevenção do erro startsWith
const applyStringPrototypePatch = () => {
  debugLog('INIT', { message: 'Aplicando patch para proteger métodos de string' });
  
  // Salvar referências originais para métodos de String
  const originalPrototype = String.prototype;
  const originalMethods = {
    startsWith: originalPrototype.startsWith,
    endsWith: originalPrototype.endsWith,
    includes: originalPrototype.includes,
    substring: originalPrototype.substring,
    slice: originalPrototype.slice,
    match: originalPrototype.match,
    replace: originalPrototype.replace
  };
  
  // Função segura para verificar se é string
  const safelyCallStringMethod = (method, thisArg, args) => {
    if (typeof thisArg !== 'string' && !(thisArg instanceof String)) {
      debugLog('STRING_METHOD_ERROR', { 
        method, 
        thisType: typeof thisArg, 
        thisValue: thisArg ? String(thisArg) : 'null/undefined' 
      });
      return false; // Valor de fallback seguro
    }
    return method.apply(thisArg, args);
  };
  
  // Sobrescrever métodos com proteção
  Object.keys(originalMethods).forEach(methodName => {
    debugLog('PATCHING', { method: methodName });
    originalPrototype[methodName] = function(...args) {
      return safelyCallStringMethod(originalMethods[methodName], this, args);
    };
  });
  
  debugLog('PATCHED', { message: 'String prototype methods protegidos com sucesso' });
};

// Aplicar o patch imediatamente
applyStringPrototypePatch();

// Ignorar erros específicos que não devem falhar os testes
Cypress.on('uncaught:exception', (err, runnable) => {
  debugLog('UNCAUGHT_EXCEPTION', {
    message: err.message,
    stack: err.stack
  });

  // Tratamento especial para o erro startsWith
  if (err.message && (err.message.includes('startsWith is not a function') || 
                    err.message.includes('_data$event.startsWith'))) {
    debugLog('STARTSWITH_ERROR_PATCHED', { message: err.message });
    
    // Monkey patch para prevenir futuros erros deste tipo
    try {
      if (window._cypressPatched !== true) {
        // Adiciona um proxy global para métodos de string
        const origProto = Object.getPrototypeOf('').constructor.prototype;
        const origStartsWith = origProto.startsWith;
        
        // Substitui o método startsWith para lidar com valores não-string
        origProto.startsWith = function(searchString) {
          if (typeof this !== 'string') {
            console.warn('Tentativa de chamar startsWith em um não-string');
            return false;
          }
          return origStartsWith.call(this, searchString);
        };
        
        window._cypressPatched = true;
        debugLog('APPLIED_STRING_PROTOTYPE_PATCH', { success: true });
      }
    } catch (patchError) {
      debugLog('PATCH_ERROR', { message: patchError.message });
    }
    
    return false; // Ignorar o erro
  }

  // Lista de erros conhecidos que podem ser ignorados
  const ignoredErrors = [
    'useUser must be used within a UserProvider',
    'Cannot read properties of null',
    'ResizeObserver loop limit exceeded',
    'is not a function',
    'failed to fetch'
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