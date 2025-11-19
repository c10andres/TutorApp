// Utilidades para diagnosticar problemas entre plataformas
import { Capacitor } from '@capacitor/core';

export interface PlatformDiagnostics {
  platform: string;
  isNative: boolean;
  isWeb: boolean;
  features: {
    localStorage: boolean;
    capacitor: boolean;
    firebase: boolean;
    notifications: boolean;
    camera: boolean;
  };
  storage: {
    available: boolean;
    type: 'localStorage' | 'Preferences' | 'none';
    test: boolean;
  };
  screen: {
    width: number;
    height: number;
    ratio: number;
    orientation: 'portrait' | 'landscape';
  };
  userAgent: string;
  errors: string[];
}

export class PlatformDiagnosticsService {
  private errors: string[] = [];

  async runDiagnostics(): Promise<PlatformDiagnostics> {
    this.errors = [];
    
    // Información básica de plataforma sin usar platformService
    const platformInfo = {
      platform: Capacitor.getPlatform(),
      isNative: Capacitor.isNativePlatform(),
      isWeb: Capacitor.getPlatform() === 'web',
      isDevelopment: process.env.NODE_ENV === 'development' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1',
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    };
    
    // Verificar características básicas
    const features = {
      localStorage: typeof Storage !== 'undefined' && localStorage !== null,
      capacitor: Capacitor.isNativePlatform(),
      firebase: true, // Firebase funciona en ambas plataformas
      notifications: Capacitor.isNativePlatform(), // Push notifications solo en móvil
      camera: Capacitor.isNativePlatform(), // Cámara solo en móvil
    };

    // Verificar storage
    const storage = await this.testStorage();
    
    // Información de pantalla
    const screen = {
      width: window.screen.width,
      height: window.screen.height,
      ratio: window.screen.width / window.screen.height,
      orientation: window.screen.width > window.screen.height ? 'landscape' : 'portrait' as 'portrait' | 'landscape'
    };

    return {
      platform: platformInfo.platform,
      isNative: platformInfo.isNative,
      isWeb: platformInfo.isWeb,
      features,
      storage,
      screen,
      userAgent: navigator.userAgent,
      errors: this.errors
    };
  }

  private async testStorage(): Promise<{ available: boolean; type: 'localStorage' | 'Preferences' | 'none'; test: boolean }> {
    const testKey = 'platform-test';
    const testValue = 'test-value';

    try {
      // Usar localStorage directamente
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        return {
          available: true,
          type: 'localStorage',
          test: true
        };
      } else {
        this.errors.push('Storage test failed: value mismatch');
        return {
          available: false,
          type: 'none',
          test: false
        };
      }
    } catch (error) {
      this.errors.push(`Storage test failed: ${error.message}`);
      return {
        available: false,
        type: 'none',
        test: false
      };
    }
  }

  // Generar reporte de diagnóstico
  generateReport(diagnostics: PlatformDiagnostics): string {
    const report = [
      '🔍 DIAGNÓSTICO DE PLATAFORMA',
      '='.repeat(50),
      '',
      `📱 Plataforma: ${diagnostics.platform}`,
      `🌐 Web: ${diagnostics.isWeb ? 'Sí' : 'No'}`,
      `📱 Nativa: ${diagnostics.isNative ? 'Sí' : 'No'}`,
      '',
      '🔧 CARACTERÍSTICAS:',
      `  • localStorage: ${diagnostics.features.localStorage ? '✅' : '❌'}`,
      `  • Capacitor: ${diagnostics.features.capacitor ? '✅' : '❌'}`,
      `  • Firebase: ${diagnostics.features.firebase ? '✅' : '❌'}`,
      `  • Notificaciones: ${diagnostics.features.notifications ? '✅' : '❌'}`,
      `  • Cámara: ${diagnostics.features.camera ? '✅' : '❌'}`,
      '',
      '💾 STORAGE:',
      `  • Disponible: ${diagnostics.storage.available ? '✅' : '❌'}`,
      `  • Tipo: ${diagnostics.storage.type}`,
      `  • Test: ${diagnostics.storage.test ? '✅' : '❌'}`,
      '',
      '📺 PANTALLA:',
      `  • Resolución: ${diagnostics.screen.width}x${diagnostics.screen.height}`,
      `  • Ratio: ${diagnostics.screen.ratio.toFixed(2)}`,
      `  • Orientación: ${diagnostics.screen.orientation}`,
      ''
    ];

    if (diagnostics.errors.length > 0) {
      report.push('❌ ERRORES:');
      diagnostics.errors.forEach(error => {
        report.push(`  • ${error}`);
      });
    }

    return report.join('\n');
  }

  // Comparar diagnósticos entre plataformas
  compareDiagnostics(web: PlatformDiagnostics, android: PlatformDiagnostics): string[] {
    const differences: string[] = [];

    // Comparar características
    Object.keys(web.features).forEach(feature => {
      const webFeature = web.features[feature as keyof typeof web.features];
      const androidFeature = android.features[feature as keyof typeof android.features];
      
      if (webFeature !== androidFeature) {
        differences.push(`Característica '${feature}': Web=${webFeature}, Android=${androidFeature}`);
      }
    });

    // Comparar storage
    if (web.storage.type !== android.storage.type) {
      differences.push(`Storage: Web=${web.storage.type}, Android=${android.storage.type}`);
    }

    if (web.storage.available !== android.storage.available) {
      differences.push(`Storage disponible: Web=${web.storage.available}, Android=${android.storage.available}`);
    }

    return differences;
  }
}

export const platformDiagnostics = new PlatformDiagnosticsService();
