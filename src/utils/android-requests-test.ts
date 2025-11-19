// Pruebas para la carga directa de solicitudes en Android
import { TutoringDirectService } from '../services/tutoring-direct-load';
import { Capacitor } from '@capacitor/core';

export class AndroidRequestsTest {
  // Probar carga directa de solicitudes
  static async testDirectRequestsLoad(userId: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log('🧪 Probando carga directa de solicitudes para:', userId);
      
      const requests = await TutoringDirectService.getUserRequests(userId);
      
      return {
        success: true,
        message: `✅ Solicitudes cargadas directamente: ${requests.length}`,
        data: {
          requests: requests.length,
          requestsData: requests
        }
      };
    } catch (error) {
      console.error('❌ Error en prueba de carga directa:', error);
      return {
        success: false,
        message: `❌ Error: ${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  // Probar carga directa de estadísticas
  static async testDirectStatsLoad(userId: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log('🧪 Probando carga directa de estadísticas para:', userId);
      
      const stats = await TutoringDirectService.getUserStats(userId);
      
      return {
        success: true,
        message: `✅ Estadísticas cargadas directamente`,
        data: {
          stats: stats
        }
      };
    } catch (error) {
      console.error('❌ Error en prueba de estadísticas:', error);
      return {
        success: false,
        message: `❌ Error: ${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  // Probar detección de plataforma
  static testPlatformDetection(): {
    success: boolean;
    message: string;
    data?: any;
  } {
    try {
      const platform = Capacitor.getPlatform();
      const isAndroid = platform === 'android';
      const isWeb = platform === 'web';
      
      return {
        success: true,
        message: `✅ Plataforma detectada: ${platform}`,
        data: {
          platform,
          isAndroid,
          isWeb,
          shouldUseDirectLoad: isAndroid
        }
      };
    } catch (error) {
      console.error('❌ Error detectando plataforma:', error);
      return {
        success: false,
        message: `❌ Error: ${error.message}`,
        data: { error: error.message }
      };
    }
  }
  
  // Ejecutar todas las pruebas
  static async runAllTests(userId: string): Promise<void> {
    console.log('🚀 Ejecutando pruebas de carga directa para Android...');
    
    // Prueba 1: Detección de plataforma
    console.log('\n📋 Prueba 1: Detección de plataforma');
    const platformTest = this.testPlatformDetection();
    console.log(platformTest.message);
    
    // Prueba 2: Carga directa de solicitudes
    console.log('\n📋 Prueba 2: Carga directa de solicitudes');
    const requestsTest = await this.testDirectRequestsLoad(userId);
    console.log(requestsTest.message);
    
    // Prueba 3: Carga directa de estadísticas
    console.log('\n📋 Prueba 3: Carga directa de estadísticas');
    const statsTest = await this.testDirectStatsLoad(userId);
    console.log(statsTest.message);
    
    // Resumen
    console.log('\n📊 Resumen de pruebas:');
    console.log(`✅ Prueba 1 (Plataforma): ${platformTest.success ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`✅ Prueba 2 (Solicitudes): ${requestsTest.success ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`✅ Prueba 3 (Estadísticas): ${statsTest.success ? 'PASÓ' : 'FALLÓ'}`);
    
    const allPassed = platformTest.success && requestsTest.success && statsTest.success;
    console.log(`\n🎯 Resultado general: ${allPassed ? 'TODAS LAS PRUEBAS PASARON' : 'ALGUNAS PRUEBAS FALLARON'}`);
    
    if (allPassed) {
      console.log('🎉 La carga directa está funcionando correctamente en Android!');
    } else {
      console.log('⚠️ Algunas pruebas fallaron. Revisar la configuración.');
    }
  }
  
  // Comparar rendimiento entre métodos
  static async comparePerformance(userId: string): Promise<{
    directLoad: number;
    message: string;
  }> {
    try {
      console.log('⚡ Comparando rendimiento de carga directa...');
      
      // Medir tiempo de carga directa
      const startTime = performance.now();
      await TutoringDirectService.getUserRequests(userId);
      const endTime = performance.now();
      
      const directLoadTime = endTime - startTime;
      
      console.log(`📊 Tiempo de carga directa: ${directLoadTime.toFixed(2)}ms`);
      
      return {
        directLoad: directLoadTime,
        message: `⚡ Carga directa: ${directLoadTime.toFixed(2)}ms`
      };
    } catch (error) {
      console.error('❌ Error comparando rendimiento:', error);
      return {
        directLoad: 0,
        message: `❌ Error: ${error.message}`
      };
    }
  }
}

// Hacer funciones disponibles globalmente para depuración
if (typeof window !== 'undefined') {
  (window as any).AndroidRequestsTest = AndroidRequestsTest;
  
  console.log('🛠️ Pruebas de carga directa disponibles:');
  console.log('- AndroidRequestsTest.testDirectRequestsLoad(userId)');
  console.log('- AndroidRequestsTest.testDirectStatsLoad(userId)');
  console.log('- AndroidRequestsTest.testPlatformDetection()');
  console.log('- AndroidRequestsTest.runAllTests(userId)');
  console.log('- AndroidRequestsTest.comparePerformance(userId)');
}
