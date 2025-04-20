
import React from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error handling
const errorHandler = (error: Error, info: { componentStack: string }) => {
  console.error('React Error:', error, info);
};

// Render the app
const root = document.getElementById("root");

if (!root) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Erro ao carregar a aplicação: Elemento root não encontrado.</div>';
} else {
  const reactRoot = React.createRoot(root);
  reactRoot.render(
    <React.StrictMode>
      <React.ErrorBoundary fallback={<div>Ocorreu um erro. Por favor, recarregue a página.</div>} onError={errorHandler}>
        <App />
      </React.ErrorBoundary>
    </React.StrictMode>
  );
}
