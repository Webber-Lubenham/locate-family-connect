
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
          </div>
        } 
        onError={errorHandler}
      >
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
