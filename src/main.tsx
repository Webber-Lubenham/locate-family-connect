import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { checkCacheClearRequest } from './lib/utils/cache-manager';
import { UnifiedAuthProvider } from './contexts/UnifiedAuthContext';

// Listener global para depuração de eventos recebidos na janela
window.addEventListener('message', (event) => {
  try {
    console.log('[DEBUG][window.message] event:', event);
    console.log('[DEBUG][window.message] event.data:', event.data, 'typeof:', typeof event.data);
    if (typeof event.data === 'string') {
      console.log('[DEBUG][window.message] string data:', event.data);
    } else if (typeof event.data === 'object' && event.data !== null) {
      console.log('[DEBUG][window.message] object keys:', Object.keys(event.data));
    } else {
      console.log('[DEBUG][window.message] other type data:', event.data);
    }
  } catch (error) {
    console.error('[DEBUG][window.message] Error processing message:', error, event.data);
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
