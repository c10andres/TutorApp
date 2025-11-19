// Cargador de datos específico para Android
import { Capacitor } from '@capacitor/core';
import { AndroidFirebaseHelper } from './android-firebase-helper';

export class AndroidDataLoader {
  private static isInitialized = false;
  private static loadingPromise: Promise<void> | null = null;

  // Inicializar el cargador de datos para Android
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🤖 Android Data Loader ya está inicializado');
      return;
    }

    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      console.log('📱 No es Android, saltando inicialización del Android Data Loader');
      return;
    }

    console.log('🤖 Inicializando Android Data Loader...');

    try {
      // Precargar datos esenciales
      await this.preloadEssentialData();
      
      this.isInitialized = true;
      console.log('✅ Android Data Loader inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Android Data Loader:', error);
      throw error;
    }
  }

  // Precargar datos esenciales
  private static async preloadEssentialData(): Promise<void> {
    console.log('🔄 Precargando datos esenciales para Android...');

    const promises = [
      this.preloadUsers(),
      this.preloadRequests()
    ];

    await Promise.all(promises);
    console.log('✅ Datos esenciales precargados para Android');
  }

  // Precargar usuarios
  private static async preloadUsers(): Promise<void> {
    try {
      console.log('👥 Precargando usuarios para Android...');
      await AndroidFirebaseHelper.getUsersForAndroid();
      console.log('✅ Usuarios precargados para Android');
    } catch (error) {
      console.error('❌ Error precargando usuarios para Android:', error);
    }
  }

  // Precargar solicitudes
  private static async preloadRequests(): Promise<void> {
    try {
      console.log('📋 Precargando solicitudes para Android...');
      await AndroidFirebaseHelper.getRequestsForAndroid();
      console.log('✅ Solicitudes precargadas para Android');
    } catch (error) {
      console.error('❌ Error precargando solicitudes para Android:', error);
    }
  }

  // Obtener datos de forma segura para Android
  static async getDataSafely<T>(dataType: 'users' | 'requests', fallbackData: T): Promise<T> {
    if (!this.isInitialized) {
      console.log('🤖 Android Data Loader no inicializado, inicializando...');
      await this.initialize();
    }

    try {
      switch (dataType) {
        case 'users':
          return await AndroidFirebaseHelper.getUsersForAndroid() as T;
        case 'requests':
          return await AndroidFirebaseHelper.getRequestsForAndroid() as T;
        default:
          return fallbackData;
      }
    } catch (error) {
      console.error(`❌ Error obteniendo datos ${dataType} para Android:`, error);
      return fallbackData;
    }
  }

  // Verificar si está listo
  static isReady(): boolean {
    return this.isInitialized;
  }

  // Obtener información de diagnóstico
  static getDiagnosticInfo(): any {
    return {
      isInitialized: this.isInitialized,
      isAndroid: Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android',
      platform: Capacitor.getPlatform(),
      loadingPromise: !!this.loadingPromise
    };
  }

  // Reinicializar (útil para debugging)
  static async reinitialize(): Promise<void> {
    console.log('🔄 Reinicializando Android Data Loader...');
    this.isInitialized = false;
    AndroidFirebaseHelper.clearCache();
    await this.initialize();
  }
}
