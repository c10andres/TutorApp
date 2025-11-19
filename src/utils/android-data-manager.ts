// Utilidad para manejar datos específicamente en Android
import { EnvironmentDetector } from './environment-detector';

export class AndroidDataManager {
  // Inicializar datos para Android
  static async initializeAndroidData(): Promise<void> {
    try {
      console.log('🤖 Inicializando datos para Android...');
      
      // Log del entorno
      EnvironmentDetector.logEnvironmentInfo();
      
      // Inicializar localStorage con datos por defecto
      EnvironmentDetector.initializeLocalStorage('tutoring-requests', []);
      EnvironmentDetector.initializeLocalStorage('user-sessions', []);
      EnvironmentDetector.initializeLocalStorage('tutor-reviews', []);
      
      console.log('✅ Datos de Android inicializados correctamente');
    } catch (error) {
      console.error('❌ Error inicializando datos de Android:', error);
    }
  }

  // Verificar si los datos están disponibles
  static async checkDataAvailability(): Promise<{
    localStorage: boolean;
    firebase: boolean;
    mockData: boolean;
  }> {
    const result = {
      localStorage: false,
      firebase: false,
      mockData: true, // Los datos mock siempre están disponibles
    };

    try {
      // Verificar localStorage
      result.localStorage = EnvironmentDetector.isLocalStorageAvailable();
      
      // Verificar Firebase (esto se puede mejorar con una prueba real)
      result.firebase = true; // Asumimos que Firebase está disponible por ahora
      
      console.log('📊 Disponibilidad de datos:', result);
      return result;
    } catch (error) {
      console.error('❌ Error verificando disponibilidad de datos:', error);
      return result;
    }
  }

  // Obtener datos de forma inteligente (localStorage + Firebase + mock)
  static async getSmartData<T>(
    key: string,
    firebaseCallback: () => Promise<T[]>,
    mockData: T[]
  ): Promise<T[]> {
    try {
      console.log(`🔍 Obteniendo datos inteligentes para: ${key}`);
      
      let allData: T[] = [];
      
      // 1. Intentar obtener de localStorage
      try {
        const localData = EnvironmentDetector.getLocalStorageItem(key, []);
        if (Array.isArray(localData) && localData.length > 0) {
          allData = [...localData];
          console.log(`✅ ${localData.length} elementos obtenidos de localStorage`);
        }
      } catch (localError) {
        console.warn('⚠️ Error accediendo localStorage:', localError);
      }
      
      // 2. Intentar obtener de Firebase
      try {
        const firebaseData = await firebaseCallback();
        if (Array.isArray(firebaseData) && firebaseData.length > 0) {
          // Combinar con datos locales (evitar duplicados)
          firebaseData.forEach(item => {
            if (!allData.find(existingItem => (existingItem as any).id === (item as any).id)) {
              allData.push(item);
            }
          });
          console.log(`✅ ${firebaseData.length} elementos obtenidos de Firebase`);
        }
      } catch (firebaseError) {
        console.warn('⚠️ Error accediendo Firebase:', firebaseError);
      }
      
      // 3. Si no hay datos, usar mock data
      if (allData.length === 0) {
        console.log('🔄 No hay datos reales, usando datos mock');
        allData = [...mockData];
      }
      
      console.log(`📊 Total de datos obtenidos: ${allData.length}`);
      return allData;
    } catch (error) {
      console.error('❌ Error obteniendo datos inteligentes:', error);
      return mockData;
    }
  }

  // Guardar datos de forma inteligente
  static async saveSmartData<T>(
    key: string,
    data: T[],
    firebaseCallback?: (data: T[]) => Promise<void>
  ): Promise<boolean> {
    try {
      console.log(`💾 Guardando datos inteligentes para: ${key}`);
      
      // 1. Guardar en localStorage
      const localSaved = EnvironmentDetector.setLocalStorageItem(key, data);
      if (localSaved) {
        console.log('✅ Datos guardados en localStorage');
      }
      
      // 2. Intentar guardar en Firebase si hay callback
      if (firebaseCallback) {
        try {
          await firebaseCallback(data);
          console.log('✅ Datos guardados en Firebase');
        } catch (firebaseError) {
          console.warn('⚠️ Error guardando en Firebase:', firebaseError);
        }
      }
      
      return localSaved;
    } catch (error) {
      console.error('❌ Error guardando datos inteligentes:', error);
      return false;
    }
  }

  // Sincronizar datos entre localStorage y Firebase
  static async syncData<T>(
    key: string,
    firebaseCallback: () => Promise<T[]>,
    saveFirebaseCallback: (data: T[]) => Promise<void>
  ): Promise<T[]> {
    try {
      console.log(`🔄 Sincronizando datos para: ${key}`);
      
      // Obtener datos de ambas fuentes
      const localData = EnvironmentDetector.getLocalStorageItem(key, []);
      const firebaseData = await firebaseCallback();
      
      // Combinar datos (localStorage tiene prioridad)
      const combinedData = [...localData];
      firebaseData.forEach(item => {
        if (!combinedData.find(existingItem => (existingItem as any).id === (item as any).id)) {
          combinedData.push(item);
        }
      });
      
      // Guardar datos combinados
      await this.saveSmartData(key, combinedData, saveFirebaseCallback);
      
      console.log(`✅ Datos sincronizados: ${combinedData.length} elementos`);
      return combinedData;
    } catch (error) {
      console.error('❌ Error sincronizando datos:', error);
      return [];
    }
  }
}
