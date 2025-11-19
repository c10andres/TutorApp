// Diagnóstico específico para problemas de carga de datos en Android
import { Capacitor } from '@capacitor/core';
import { getFirebaseDatabase } from '../firebase';
import { TutoringAndroidRobust } from '../services/tutoring-android-robust';

export class AndroidDataDiagnostic {
  // Diagnóstico completo de carga de datos
  static async runFullDiagnostic(userId: string): Promise<{
    success: boolean;
    message: string;
    details: any;
  }> {
    try {
      console.log('🔍 Iniciando diagnóstico completo para Android...');
      
      const results = {
        platform: Capacitor.getPlatform(),
        isAndroid: Capacitor.getPlatform() === 'android',
        firebase: false,
        database: false,
        requests: 0,
        stats: null,
        errors: [] as string[]
      };
      
      // Verificar Firebase
      try {
        const database = getFirebaseDatabase();
        results.firebase = !!database;
        results.database = !!database;
        console.log('✅ Firebase verificado:', results.firebase);
      } catch (error) {
        results.errors.push(`Firebase error: ${error.message}`);
        console.error('❌ Error Firebase:', error);
      }
      
      // Verificar conexión
      try {
        const connectionStatus = await TutoringAndroidRobust.checkConnectionStatus();
        console.log('📊 Estado de conexión:', connectionStatus);
      } catch (error) {
        results.errors.push(`Connection error: ${error.message}`);
        console.error('❌ Error conexión:', error);
      }
      
      // Probar carga de solicitudes
      try {
        const requests = await TutoringAndroidRobust.getUserRequests(userId);
        results.requests = requests.length;
        console.log('✅ Solicitudes cargadas:', results.requests);
      } catch (error) {
        results.errors.push(`Requests error: ${error.message}`);
        console.error('❌ Error solicitudes:', error);
      }
      
      // Probar carga de estadísticas
      try {
        const stats = await TutoringAndroidRobust.getUserStats(userId);
        results.stats = stats;
        console.log('✅ Estadísticas cargadas:', stats);
      } catch (error) {
        results.errors.push(`Stats error: ${error.message}`);
        console.error('❌ Error estadísticas:', error);
      }
      
      const success = results.firebase && results.database && results.requests >= 0;
      
      return {
        success,
        message: success ? '✅ Diagnóstico exitoso' : '❌ Diagnóstico falló',
        details: results
      };
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      return {
        success: false,
        message: `❌ Error: ${error.message}`,
        details: { error: error.message }
      };
    }
  }
  
  // Probar carga paso a paso
  static async testStepByStep(userId: string): Promise<void> {
    console.log('🧪 Probando carga paso a paso...');
    
    // Paso 1: Verificar plataforma
    console.log('\n📋 Paso 1: Verificar plataforma');
    const platform = Capacitor.getPlatform();
    console.log(`Plataforma: ${platform}`);
    console.log(`Es Android: ${platform === 'android'}`);
    
    // Paso 2: Verificar Firebase
    console.log('\n📋 Paso 2: Verificar Firebase');
    try {
      const database = getFirebaseDatabase();
      console.log(`Database disponible: ${!!database}`);
    } catch (error) {
      console.error('❌ Error Firebase:', error);
    }
    
    // Paso 3: Probar carga directa
    console.log('\n📋 Paso 3: Probar carga directa');
    try {
      const requests = await TutoringAndroidRobust.getUserRequests(userId);
      console.log(`Solicitudes cargadas: ${requests.length}`);
      if (requests.length > 0) {
        console.log('Primera solicitud:', requests[0]);
      }
    } catch (error) {
      console.error('❌ Error carga directa:', error);
    }
    
    // Paso 4: Probar estadísticas
    console.log('\n📋 Paso 4: Probar estadísticas');
    try {
      const stats = await TutoringAndroidRobust.getUserStats(userId);
      console.log('Estadísticas:', stats);
    } catch (error) {
      console.error('❌ Error estadísticas:', error);
    }
    
    console.log('\n✅ Prueba paso a paso completada');
  }
  
  // Forzar recarga de datos
  static async forceReload(userId: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log('🔄 Forzando recarga de datos...');
      
      // Resetear contador de reintentos
      TutoringAndroidRobust.resetRetryCount();
      
      // Cargar datos con timeout extendido
      const requests = await TutoringAndroidRobust.getUserRequests(userId);
      const stats = await TutoringAndroidRobust.getUserStats(userId);
      
      return {
        success: true,
        message: `✅ Recarga exitosa: ${requests.length} solicitudes, ${Object.keys(stats).length} estadísticas`,
        data: { requests: requests.length, stats }
      };
      
    } catch (error) {
      console.error('❌ Error en recarga forzada:', error);
      return {
        success: false,
        message: `❌ Error: ${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  // Verificar estado del sistema
  static getSystemStatus(): {
    platform: string;
    isAndroid: boolean;
    firebase: boolean;
    database: boolean;
    timestamp: string;
  } {
    const platform = Capacitor.getPlatform();
    const isAndroid = platform === 'android';
    
    let firebase = false;
    let database = false;
    
    try {
      const db = getFirebaseDatabase();
      firebase = true;
      database = !!db;
    } catch (error) {
      console.error('Error verificando sistema:', error);
    }
    
    return {
      platform,
      isAndroid,
      firebase,
      database,
      timestamp: new Date().toISOString()
    };
  }
  
  // Limpiar cache y reiniciar
  static async clearCacheAndRestart(userId: string): Promise<void> {
    try {
      console.log('🧹 Limpiando cache y reiniciando...');
      
      // Resetear contador de reintentos
      TutoringAndroidRobust.resetRetryCount();
      
      // Limpiar localStorage si está disponible
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('tutoring') || key.includes('requests') || key.includes('user'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        console.log(`🧹 Limpiados ${keysToRemove.length} elementos del cache`);
      }
      
      // Esperar un momento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Probar carga después de limpiar
      const requests = await TutoringAndroidRobust.getUserRequests(userId);
      console.log(`✅ Después de limpiar cache: ${requests.length} solicitudes`);
      
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
    }
  }
}

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
  (window as any).AndroidDataDiagnostic = AndroidDataDiagnostic;
  
  console.log('🛠️ Diagnóstico de datos Android disponible:');
  console.log('- AndroidDataDiagnostic.runFullDiagnostic(userId)');
  console.log('- AndroidDataDiagnostic.testStepByStep(userId)');
  console.log('- AndroidDataDiagnostic.forceReload(userId)');
  console.log('- AndroidDataDiagnostic.getSystemStatus()');
  console.log('- AndroidDataDiagnostic.clearCacheAndRestart(userId)');
}
