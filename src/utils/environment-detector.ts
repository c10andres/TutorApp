// Utilidad para detectar el entorno de ejecución y manejar fallbacks
import { Capacitor } from '@capacitor/core';

export class EnvironmentDetector {
  // Detectar si estamos en entorno móvil
  static isMobileEnvironment(): boolean {
    return Capacitor.isNativePlatform();
  }

  // Detectar si estamos en entorno web
  static isWebEnvironment(): boolean {
    return !Capacitor.isNativePlatform();
  }

  // Detectar si estamos en Android
  static isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }

  // Detectar si estamos en iOS
  static isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }

  // Obtener información del entorno
  static getEnvironmentInfo(): {
    platform: string;
    isMobile: boolean;
    isWeb: boolean;
    isAndroid: boolean;
    isIOS: boolean;
  } {
    return {
      platform: Capacitor.getPlatform(),
      isMobile: this.isMobileEnvironment(),
      isWeb: this.isWebEnvironment(),
      isAndroid: this.isAndroid(),
      isIOS: this.isIOS(),
    };
  }

  // Log del entorno actual
  static logEnvironmentInfo(): void {
    const info = this.getEnvironmentInfo();
    console.log('🌍 Información del entorno:', info);
  }

  // Verificar si localStorage está disponible
  static isLocalStorageAvailable(): boolean {
    try {
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Obtener datos de localStorage de forma segura
  static getLocalStorageItem(key: string, defaultValue: any = null): any {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.warn('⚠️ localStorage no disponible');
        return defaultValue;
      }
      
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      
      return JSON.parse(item);
    } catch (error) {
      console.warn('⚠️ Error accediendo localStorage:', error);
      return defaultValue;
    }
  }

  // Guardar datos en localStorage de forma segura
  static setLocalStorageItem(key: string, value: any): boolean {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.warn('⚠️ localStorage no disponible');
        return false;
      }
      
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('⚠️ Error guardando en localStorage:', error);
      return false;
    }
  }

  // Inicializar localStorage con datos por defecto
  static initializeLocalStorage(key: string, defaultValue: any): void {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.warn('⚠️ localStorage no disponible para inicialización');
        return;
      }
      
      const existingData = this.getLocalStorageItem(key);
      if (existingData === null) {
        this.setLocalStorageItem(key, defaultValue);
        console.log(`✅ Inicializado localStorage con clave: ${key}`);
      }
    } catch (error) {
      console.warn('⚠️ Error inicializando localStorage:', error);
    }
  }
}
