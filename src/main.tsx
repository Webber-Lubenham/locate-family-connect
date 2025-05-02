import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { checkCacheClearRequest } from './lib/utils/cache-manager';
import { UnifiedAuthProvider } from './contexts/UnifiedAuthContext';

// Listener global para depuração de eventos recebidos na janela - versão segura para testes
window.addEventListener('message', (event) => {
  try {
    // Wrapper de segurança para funções de string
    const safeStringMethods = (value: any) => {
      // Cria um proxy que intercepta chamadas a métodos como startsWith
      if (typeof value === 'string') {
        return value; // Se já for string, retorna normalmente
      }
      
      // Para não-strings, cria um proxy com métodos seguros
      return new Proxy({}, {
        get: (target, prop) => {
          // Se tentar acessar startsWith, endsWith, etc., retorna uma função segura
          if (['startsWith', 'endsWith', 'includes', 'indexOf', 'substring'].includes(prop as string)) {
            return (...args: any[]) => {
              console.warn(`[SAFE_STRING] Tentativa de chamar ${String(prop)} em um valor não-string:`, value);
              return false; // Valor padrão seguro
            };
          }
          return undefined;
        }
      });
    };

    // Protege recursivamente um objeto ou array
    const makeEventSafe = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      
      if (typeof obj === 'object') {
        // Protege cada propriedade do objeto
        const safeObj: Record<string, any> = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            try {
              if (key === 'event' && typeof obj[key] !== 'string') {
                // Caso especial para a propriedade 'event'
                safeObj[key] = safeStringMethods(obj[key]);
              } else {
                // Processo recursivo para outras propriedades
                safeObj[key] = makeEventSafe(obj[key]);
              }
            } catch (e) {
              console.error(`[SAFE_EVENT] Erro ao processar propriedade ${key}:`, e);
              safeObj[key] = null; // Valor seguro
            }
          }
        }
        return safeObj;
      }
      
      return obj; // Retorna valores primitivos sem alteração
    };

    // Aplicar proteção ao event.data
    const safeEventData = makeEventSafe(event.data);
    
    // Logs seguros
    console.log('[DEBUG][window.message] event recebido');
    console.log('[DEBUG][window.message] event.data tipo:', typeof event.data);
    
    if (typeof event.data === 'string') {
      console.log('[DEBUG][window.message] string data:', event.data);
    } else if (typeof event.data === 'object' && event.data !== null) {
      const keys = Object.keys(event.data);
      console.log('[DEBUG][window.message] object keys:', keys);
      // Log seguro para a propriedade event
      if (keys.includes('event')) {
        console.log('[DEBUG][window.message] event property tipo:', typeof event.data.event);
      }
    }
  } catch (error) {
    console.error('[DEBUG][window.message] Erro processando mensagem (tratado):', error);
  }
});

// Check if this page load is a result of a cache clear request
checkCacheClearRequest();

// Custom error boundary component
const ErrorBoundary = React.memo(({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by ErrorBoundary:', event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="error-boundary">
        <h1>Algo deu errado</h1>
        <button onClick={() => window.location.reload()}>Recarregar página</button>
      </div>
    );
  }

  return children;
});

ErrorBoundary.displayName = 'ErrorBoundary';

// Error handling
const errorHandler = (error: Error, info: { componentStack: string }) => {
  console.error('React Error:', error, info);
};

// Render the app
const root = document.getElementById("root");

if (!root) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Erro ao carregar a aplicação: Elemento root não encontrado.</div>';
} else {
  const reactRoot = createRoot(root);
  reactRoot.render(
    <StrictMode>
      <ErrorBoundary>
        <UnifiedAuthProvider>
          <App />
        </UnifiedAuthProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}
