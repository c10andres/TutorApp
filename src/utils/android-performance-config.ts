// Configuración de rendimiento específica para Android
import { Capacitor } from '@capacitor/core';

export class AndroidPerformanceConfig {
  private static isConfigured = false;
  
  // Configurar optimizaciones de rendimiento para Android
  static configure(): void {
    if (this.isConfigured) return;
    
    console.log('⚡ Configurando optimizaciones de rendimiento para Android...');
    
    // Solo aplicar en Android
    if (Capacitor.getPlatform() !== 'android') {
      console.log('📱 No es Android, saltando optimizaciones');
      return;
    }
    
    // Configurar CSS para Android
    this.configureCSS();
    
    // Configurar JavaScript para Android
    this.configureJavaScript();
    
    // Configurar eventos para Android
    this.configureEvents();
    
    // Configurar memoria para Android
    this.configureMemory();
    
    this.isConfigured = true;
    console.log('✅ Optimizaciones de rendimiento configuradas');
  }
  
  // Configurar CSS optimizado para Android
  private static configureCSS(): void {
    if (typeof window === 'undefined') return;
    
    const style = document.createElement('style');
    style.textContent = `
      /* Optimizaciones específicas para Android */
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* Optimizar scroll en Android */
      body, html {
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
      }
      
      /* Optimizar imágenes para Android */
      img {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: optimize-contrast;
      }
      
      /* Optimizar botones para Android */
      button, .btn {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }
      
      /* Optimizar animaciones para Android */
      .animate, [class*="animate-"] {
        will-change: transform;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
      
      /* Optimizar scroll containers */
      .scroll-container {
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }
      
      /* Reducir efectos de sombra en Android */
      .shadow-sm, .shadow, .shadow-lg {
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      /* Optimizar fuentes para Android */
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
    `;
    
    document.head.appendChild(style);
    console.log('🎨 CSS optimizado para Android');
  }
  
  // Configurar JavaScript optimizado para Android
  private static configureJavaScript(): void {
    if (typeof window === 'undefined') return;
    
    // Configurar throttling para eventos
    let resizeTimeout: NodeJS.Timeout;
    let scrollTimeout: NodeJS.Timeout;
    
    // Throttle resize events
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Handle resize
        console.log('📱 Resize optimizado para Android');
      }, 100);
    });
    
    // Throttle scroll events
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Handle scroll
        console.log('📜 Scroll optimizado para Android');
      }, 16); // 60fps
    });
    
    // Configurar touch events
    let touchStartY = 0;
    let touchStartX = 0;
    
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    window.addEventListener('touchmove', (e) => {
      // Prevenir scroll horizontal en Android
      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      
      if (Math.abs(touchX - touchStartX) > Math.abs(touchY - touchStartY)) {
        e.preventDefault();
      }
    }, { passive: false });
    
    console.log('⚙️ JavaScript optimizado para Android');
  }
  
  // Configurar eventos optimizados para Android
  private static configureEvents(): void {
    if (typeof window === 'undefined') return;
    
    // Configurar eventos de visibilidad
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📱 App en segundo plano - optimizando recursos');
        this.pauseAnimations();
      } else {
        console.log('📱 App en primer plano - reanudando recursos');
        this.resumeAnimations();
      }
    });
    
    // Configurar eventos de memoria
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
          console.warn('⚠️ Uso de memoria alto en Android');
          this.cleanupMemory();
        }
      }, 10000); // Cada 10 segundos
    }
    
    console.log('📡 Eventos optimizados para Android');
  }
  
  // Configurar gestión de memoria para Android
  private static configureMemory(): void {
    if (typeof window === 'undefined') return;
    
    // Limpiar memoria periódicamente
    setInterval(() => {
      this.cleanupMemory();
    }, 30000); // Cada 30 segundos
    
    // Limpiar memoria cuando la app se oculta
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.cleanupMemory();
      }
    });
    
    console.log('🧠 Gestión de memoria configurada para Android');
  }
  
  // Pausar animaciones
  private static pauseAnimations(): void {
    const animatedElements = document.querySelectorAll('.animate, [class*="animate-"]');
    animatedElements.forEach(element => {
      (element as HTMLElement).style.animationPlayState = 'paused';
    });
  }
  
  // Reanudar animaciones
  private static resumeAnimations(): void {
    const animatedElements = document.querySelectorAll('.animate, [class*="animate-"]');
    animatedElements.forEach(element => {
      (element as HTMLElement).style.animationPlayState = 'running';
    });
  }
  
  // Limpiar memoria
  private static cleanupMemory(): void {
    // Limpiar elementos no utilizados
    const elements = document.querySelectorAll('[data-temp]');
    elements.forEach(element => element.remove());
    
    // Limpiar event listeners no utilizados
    // (Esto es más complejo y requiere tracking manual)
    
    // Forzar garbage collection si está disponible
    if (window.gc) {
      window.gc();
    }
    
    console.log('🧹 Memoria limpiada en Android');
  }
  
  // Obtener información de rendimiento
  static getPerformanceInfo(): {
    platform: string;
    memory: any;
    timing: any;
    navigation: any;
  } {
    const info = {
      platform: Capacitor.getPlatform(),
      memory: null as any,
      timing: null as any,
      navigation: null as any
    };
    
    if (typeof window !== 'undefined') {
      // Información de memoria
      if ('memory' in performance) {
        info.memory = (performance as any).memory;
      }
      
      // Información de timing
      if (performance.timing) {
        info.timing = performance.timing;
      }
      
      // Información de navegación
      if (performance.navigation) {
        info.navigation = performance.navigation;
      }
    }
    
    return info;
  }
  
  // Verificar si las optimizaciones están activas
  static isOptimized(): boolean {
    return this.isConfigured;
  }
}

// Inicializar automáticamente
if (typeof window !== 'undefined') {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      AndroidPerformanceConfig.configure();
    });
  } else {
    AndroidPerformanceConfig.configure();
  }
}

// Hacer funciones disponibles globalmente
if (typeof window !== 'undefined') {
  (window as any).AndroidPerformanceConfig = AndroidPerformanceConfig;
  
  console.log('🛠️ Configuración de rendimiento Android disponible:');
  console.log('- AndroidPerformanceConfig.configure()');
  console.log('- AndroidPerformanceConfig.getPerformanceInfo()');
  console.log('- AndroidPerformanceConfig.isOptimized()');
}
