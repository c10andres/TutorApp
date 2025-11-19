// Versión simplificada de HomePage para debug
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { androidDebug } from '../utils/android-debug';

export function HomePage({ onNavigate }) {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState('Inicializando...');

  useEffect(() => {
    androidDebug.log('🏠 HomePage Simplificada - Montada');
    setDebugInfo('HomePage cargada correctamente');
  }, []);

  useEffect(() => {
    androidDebug.log('👤 Usuario cambiado:', { user: !!user, loading });
    setDebugInfo(`Usuario: ${user ? user.name : 'No autenticado'}, Loading: ${loading}`);
  }, [user, loading]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Cargando...</h2>
        <p>Debug: {debugInfo}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>No autenticado</h2>
        <p>Debug: {debugInfo}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>HomePage Simplificada</h1>
      <p>Usuario: {user.name}</p>
      <p>Modo: {user.currentMode}</p>
      <p>Debug: {debugInfo}</p>
      <button onClick={() => onNavigate('search')}>
        Ir a Búsqueda
      </button>
    </div>
  );
}