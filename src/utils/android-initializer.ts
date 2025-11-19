// Inicializador específico para Android
import { AndroidDataManager } from './android-data-manager';
import { EnvironmentDetector } from './environment-detector';

export class AndroidInitializer {
  // Inicializar la aplicación para Android
  static async initializeApp(): Promise<void> {
    try {
      console.log('🤖 Inicializando aplicación para Android...');
      
      // Log del entorno
      EnvironmentDetector.logEnvironmentInfo();
      
      // Verificar disponibilidad de datos
      const dataAvailability = await AndroidDataManager.checkDataAvailability();
      console.log('📊 Disponibilidad de datos:', dataAvailability);
      
      // Inicializar datos de Android
      await AndroidDataManager.initializeAndroidData();
      
      console.log('✅ Aplicación inicializada correctamente para Android');
    } catch (error) {
      console.error('❌ Error inicializando aplicación para Android:', error);
    }
  }

  // Verificar si la aplicación está lista para Android
  static async isAppReady(): Promise<boolean> {
    try {
      // Verificar disponibilidad de datos
      const dataAvailability = await AndroidDataManager.checkDataAvailability();
      
      // La aplicación está lista si al menos localStorage está disponible
      return dataAvailability.localStorage || dataAvailability.mockData;
    } catch (error) {
      console.error('❌ Error verificando si la aplicación está lista:', error);
      return false;
    }
  }

  // Obtener información de diagnóstico para Android
  static async getDiagnosticInfo(): Promise<{
    environment: any;
    dataAvailability: any;
    localStorage: any;
    timestamp: string;
  }> {
    try {
      const environment = EnvironmentDetector.getEnvironmentInfo();
      const dataAvailability = await AndroidDataManager.checkDataAvailability();
      
      const localStorage = {
        available: EnvironmentDetector.isLocalStorageAvailable(),
        tutoringRequests: EnvironmentDetector.getLocalStorageItem('tutoring-requests', []),
        userSessions: EnvironmentDetector.getLocalStorageItem('user-sessions', []),
        tutorReviews: EnvironmentDetector.getLocalStorageItem('tutor-reviews', []),
      };
      
      return {
        environment,
        dataAvailability,
        localStorage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error obteniendo información de diagnóstico:', error);
      return {
        environment: null,
        dataAvailability: null,
        localStorage: null,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
