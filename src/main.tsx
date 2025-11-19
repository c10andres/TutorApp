import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'
import './index.css'

// Función para manejar errores globales
window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rechazada:', event.reason);
});

// Verificar que el elemento root existe antes de renderizar
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Elemento root no encontrado');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error: Elemento root no encontrado</h1></div>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error al crear root de React:', error);
    document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>Error al inicializar React</h1><p>' + error + '</p></div>';
  }
}
