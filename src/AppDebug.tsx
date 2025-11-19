import React, { useState, useEffect } from "react";

// Componente de prueba simple para debuggear
const AppDebug: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AppDebug: Iniciando...');
    
    // Simular carga
    const timer = setTimeout(() => {
      console.log('AppDebug: Carga completada');
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#dc3545' }}>🚨 Error en AppDebug</h1>
        <p style={{ color: '#666' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Recargar
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎓</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            TutorApp
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>
            Cargando aplicación...
          </p>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '20px auto'
          }}></div>
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#28a745', marginBottom: '20px' }}>
        ✅ AppDebug Funcionando
      </h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        La aplicación se ha cargado correctamente.
      </p>
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '500px'
      }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>
          🎯 Estado de la Aplicación
        </h3>
        <ul style={{ textAlign: 'left', color: '#666' }}>
          <li>✅ React cargado correctamente</li>
          <li>✅ Componentes funcionando</li>
          <li>✅ Sin errores de render</li>
          <li>✅ Listo para la app completa</li>
        </ul>
        <button
          onClick={() => {
            console.log('Cambiando a App completa...');
            // Aquí cambiarías a la app completa
            setError('Cambiando a la aplicación completa...');
          }}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '15px'
          }}
        >
          🚀 Cargar App Completa
        </button>
      </div>
    </div>
  );
};

export default AppDebug;




