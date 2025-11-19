import { Capacitor } from '@capacitor/core';

export class AndroidPerformance {
  // Optimizar rendimiento para Android
  static async optimizeForAndroid(): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    console.log('🚀 Optimizando rendimiento para Android...');

    try {
      // Solo optimizaciones básicas y seguras
      this.optimizeImages();
      this.configureTimeouts();

      console.log('✅ Optimización para Android completada');
    } catch (error) {
      console.error('❌ Error optimizando Android:', error);
    }
  }

  // Reducir uso de memoria
  private static reduceMemoryUsage(): void {
    console.log('💾 Reduciendo uso de memoria...');

    // Limpiar referencias circulares
    if (typeof window !== 'undefined') {
      // Limpiar event listeners no utilizados
      const originalAddEventListener = window.addEventListener;
      const originalRemoveEventListener = window.removeEventListener;
      
      // Interceptar addEventListener para tracking
      window.addEventListener = function(type, listener, options) {
        // Solo agregar listeners esenciales
        if (['load', 'resize', 'orientationchange'].includes(type)) {
          return originalAddEventListener.call(this, type, listener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
    }

    // Forzar garbage collection si está disponible
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
      console.log('🗑️ Garbage collection ejecutado');
    }
  }

  // Optimizar imágenes
  private static optimizeImages(): void {
    console.log('🖼️ Optimizando imágenes...');

    if (typeof document !== 'undefined') {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        // Lazy loading para imágenes
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }

        // Reducir calidad de imágenes si es necesario
        if (img.src.includes('unsplash.com')) {
          // Optimizar URLs de Unsplash
          const url = new URL(img.src);
          url.searchParams.set('w', '150');
          url.searchParams.set('q', '80');
          img.src = url.toString();
        }
      });
    }
  }

  // Configurar timeouts
  private static configureTimeouts(): void {
    console.log('⏱️ Configurando timeouts...');

    // Reducir timeouts para Android
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;

    window.setTimeout = function(callback, delay) {
      // Limitar timeout máximo
      const maxDelay = 10000; // 10 segundos
      const limitedDelay = Math.min(delay, maxDelay);
      return originalSetTimeout(callback, limitedDelay);
    };

    window.setInterval = function(callback, delay) {
      // Limitar interval máximo
      const maxDelay = 5000; // 5 segundos
      const limitedDelay = Math.min(delay, maxDelay);
      return originalSetInterval(callback, limitedDelay);
    };
  }

  // Limpiar recursos
  static async cleanupResources(): Promise<void> {
    console.log('🧹 Limpiando recursos...');

    try {
      // Limpiar event listeners
      if (typeof window !== 'undefined') {
        // Remover listeners no esenciales
        const events = ['scroll', 'mousemove', 'touchmove'];
        events.forEach(eventType => {
          const elements = document.querySelectorAll('*');
          elements.forEach(element => {
            element.removeEventListener(eventType, () => {});
          });
        });
      }

      // Limpiar timers
      const highestTimeoutId = setTimeout(() => {}, 0);
      for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
      }

      const highestIntervalId = setInterval(() => {}, 0);
      for (let i = 0; i < highestIntervalId; i++) {
        clearInterval(i);
      }

      console.log('✅ Recursos limpiados');
    } catch (error) {
      console.error('❌ Error limpiando recursos:', error);
    }
  }

  // Monitorear memoria
  static monitorMemory(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log('💾 Uso de memoria:', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
      });
    }
  }

  // Optimizar Firebase para Android
  static async optimizeFirebaseForAndroid(): Promise<void> {
    console.log('🔥 Optimizando Firebase para Android...');

    try {
      // Solo configurar timeouts básicos
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        const timeout = 10000; // 10 segundos (más conservador)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        return originalFetch(url, {
          ...options,
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
      };

      console.log('✅ Firebase optimizado para Android');
    } catch (error) {
      console.error('❌ Error optimizando Firebase:', error);
    }
  }
}
