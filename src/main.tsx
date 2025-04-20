
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
      <ErrorBoundary fallback={<div>Ocorreu um erro. Por favor, recarregue a página.</div>} onError={errorHandler}>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
