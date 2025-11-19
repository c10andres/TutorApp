// Configuración específica para Android - Firebase
// Este archivo se ejecuta solo en Android para mejorar la conectividad

import { Capacitor } from '@capacitor/core';

export const androidFirebaseConfig = {
  // Configuración específica para Android
  android: {
    // Configuración de red
    networkTimeout: 30000, // 30 segundos
    retryAttempts: 3,
    
    // Configuración de Firebase para Android
    firebase: {
      // Usar configuración específica de Android
      appId: "1:50299431698:android:092a716de008e36c1b61cb",
      
      // Configuración de persistencia
      persistence: true,
      
      // Configuración de caché
      cacheSizeBytes: 40 * 1024 * 1024, // 40MB
    }
  }
};

// Función para verificar conectividad específica de Android
export const checkAndroidConnectivity = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return true; // No es Android, asumir conectividad
  }

  try {
    console.log('🤖 Verificando conectividad específica de Android...');
    
    // Verificar si hay conexión a internet
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    
    console.log('✅ Conectividad Android verificada');
    return true;
  } catch (error) {
    console.warn('⚠️ Problema de conectividad en Android:', error);
    
    // Intentar con Firebase directamente
    try {
      const firebaseResponse = await fetch('https://udconecta-4bfff-default-rtdb.firebaseio.com/.json', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      console.log('✅ Firebase accesible desde Android');
      return true;
    } catch (firebaseError) {
      console.error('❌ Firebase no accesible desde Android:', firebaseError);
      return false;
    }
  }
};

// Función para inicializar Firebase con configuración específica de Android
export const initializeAndroidFirebase = async () => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return; // No es Android
  }

  console.log('🤖 Inicializando Firebase específico para Android...');
  
  // Verificar conectividad primero
  const isConnected = await checkAndroidConnectivity();
  if (!isConnected) {
    console.warn('⚠️ Sin conectividad en Android, Firebase puede no funcionar correctamente');
  }
  
  // Configurar timeouts más largos para Android
  if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const androidInit = {
        ...init,
        timeout: 30000, // 30 segundos
        signal: init?.signal || AbortSignal.timeout(30000)
      };
      
      try {
        return await originalFetch(input, androidInit);
      } catch (error) {
        console.warn('⚠️ Error de fetch en Android:', error);
        throw error;
      }
    };
  }
  
  console.log('✅ Firebase Android configurado correctamente');
};
