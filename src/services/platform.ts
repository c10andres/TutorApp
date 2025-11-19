// Servicio para manejar diferencias entre plataformas
import { Capacitor } from '@capacitor/core';

export interface PlatformStorage {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

class PlatformService {
  private isNative: boolean;
  private isWeb: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.isWeb = Capacitor.getPlatform() === 'web';
  }

  // Storage adaptado para cada plataforma
  getStorage(): PlatformStorage {
    if (this.isNative) {
      // En móvil, usar localStorage como fallback por ahora
      return {
        get: async (key: string) => {
          try {
            return localStorage.getItem(key);
          } catch (error) {
            console.warn('Error getting from localStorage:', error);
            return null;
          }
        },
        set: async (key: string, value: string) => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.warn('Error setting to localStorage:', error);
          }
        },
        remove: async (key: string) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.warn('Error removing from localStorage:', error);
          }
        },
        clear: async () => {
          try {
            localStorage.clear();
          } catch (error) {
            console.warn('Error clearing localStorage:', error);
          }
        }
      };
    } else {
      // Usar localStorage en web
      return {
        get: async (key: string) => {
          try {
            return localStorage.getItem(key);
          } catch (error) {
            console.warn('Error getting from localStorage:', error);
            return null;
          }
        },
        set: async (key: string, value: string) => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.warn('Error setting to localStorage:', error);
          }
        },
        remove: async (key: string) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.warn('Error removing from localStorage:', error);
          }
        },
        clear: async () => {
          try {
            localStorage.clear();
          } catch (error) {
            console.warn('Error clearing localStorage:', error);
          }
        }
      };
    }
  }

  // Detectar si estamos en modo de desarrollo
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  // Obtener información de la plataforma
  getPlatformInfo() {
    return {
      platform: Capacitor.getPlatform(),
      isNative: this.isNative,
      isWeb: this.isWeb,
      isDevelopment: this.isDevelopment(),
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    };
  }

  // Logging específico por plataforma
  log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const platformInfo = this.getPlatformInfo();
    const logMessage = `[${platformInfo.platform.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'info':
        console.log(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'error':
        console.error(logMessage, data);
        break;
    }
  }

  // Verificar si una funcionalidad está disponible
  isFeatureAvailable(feature: string): boolean {
    switch (feature) {
      case 'localStorage':
        return this.isWeb || (this.isNative && 'localStorage' in window);
      case 'capacitor':
        return this.isNative;
      case 'firebase':
        return true; // Firebase funciona en ambas plataformas
      case 'notifications':
        return this.isNative; // Push notifications solo en móvil
      case 'camera':
        return this.isNative; // Cámara solo en móvil
      default:
        return false;
    }
  }
}

export const platformService = new PlatformService();
