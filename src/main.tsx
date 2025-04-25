
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { checkCacheClearRequest } from './lib/utils/cache-manager';

// Check if this page load is a result of a cache clear request
checkCacheClearRequest();

// Custom error boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode, onError?: (error: Error, info: { componentStack: string }) => void }> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('React Error:', error, info);
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

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
      <ErrorBoundary 
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold mb-4">Ocorreu um erro</h2>
            <p className="mb-4">Desculpe, ocorreu um erro inesperado.</p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => window.location.reload()}
            >
              Recarregar a página
            </button>
            <button 
              className="px-4 py-2 mt-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={() => {
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = window.location.origin + '?clear=1';
                } catch (e) {
                  console.error('Failed to clear storage:', e);
                  window.location.reload();
                }
              }}
            >
              Limpar Cache e Recarregar
            </button>
          </div>
        } 
        onError={errorHandler}
      >
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
