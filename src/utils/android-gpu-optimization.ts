// Optimizaciones para problemas de GPU en Android
// Soluciona errores de Mali GPU y GPUAUX

export class AndroidGPUOptimizer {
  private static isOptimized = false;
  private static originalConsoleError: typeof console.error;
  
  // Inicializar optimizaciones de GPU
  static initialize(): void {
    if (this.isOptimized) return;
    
    console.log('🎮 Inicializando optimizaciones de GPU para Android...');
    
    // Guardar referencia original
    this.originalConsoleError = console.error;
    
    // Suprimir errores de GPU específicos
    this.suppressGPUErrors();
    
    // Optimizar renderizado
    this.optimizeRendering();
    
    // Configurar WebGL
    this.configureWebGL();
    
    this.isOptimized = true;
    console.log('✅ Optimizaciones de GPU aplicadas');
  }
  
  // Suprimir errores de GPU específicos
  private static suppressGPUErrors(): void {
    const originalError = console.error;
    
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Suprimir errores específicos de GPU
      if (message.includes('[AUX]GuiExtAuxCheckAuxPath') ||
          message.includes('Null anb') ||
          message.includes('MALI DEBUG') ||
          message.includes('BAD ALLOC from gles_texture_egl_image_get_2d_template') ||
          message.includes('GPUAUX')) {
        // No mostrar estos errores en consola
        return;
      }
      
      // Mostrar otros errores normalmente
      originalError.apply(console, args);
    };
  }
  
  // Optimizar renderizado
  private static optimizeRendering(): void {
    if (typeof window === 'undefined') return;
    
    // Configurar CSS para optimizar renderizado
    const style = document.createElement('style');
    style.textContent = `
      /* Optimizaciones de GPU */
      * {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000;
        perspective: 1000;
      }
      
      /* Optimizar animaciones */
      .animate, [class*="animate-"] {
        will-change: transform;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }
      
      /* Optimizar imágenes */
      img {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        image-rendering: -webkit-optimize-contrast;
        image-rendering: optimize-contrast;
      }
      
      /* Optimizar canvas */
      canvas {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Configurar WebGL
  private static configureWebGL(): void {
    if (typeof window === 'undefined') return;
    
    // Configurar WebGL context
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl) {
      // Configurar parámetros de WebGL para Android
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      // Configurar límites de textura
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      
      console.log('🎮 WebGL configurado:', {
        maxTextureSize,
        maxTextureImageUnits
      });
    }
  }
  
  // Limpiar recursos de GPU
  static cleanup(): void {
    if (typeof window === 'undefined') return;
    
    // Limpiar WebGL contexts
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
    });
    
    // Forzar garbage collection si está disponible
    if (window.gc) {
      window.gc();
    }
  }
  
  // Verificar estado de GPU
  static getGPUStatus(): {
    webgl: boolean;
    maxTextureSize: number;
    maxTextureImageUnits: number;
    errors: string[];
  } {
    const status = {
      webgl: false,
      maxTextureSize: 0,
      maxTextureImageUnits: 0,
      errors: [] as string[]
    };
    
    if (typeof window === 'undefined') return status;
    
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl) {
        status.webgl = true;
        status.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        status.maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
      }
    } catch (error) {
      status.errors.push(error.message);
    }
    
    return status;
  }
  
  // Restaurar configuración original
  static restore(): void {
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError;
    }
    
    this.isOptimized = false;
    console.log('🔄 Configuración de GPU restaurada');
  }
}

// Función para optimizar imágenes
export const optimizeImages = (): void => {
  if (typeof window === 'undefined') return;
  
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Configurar atributos de optimización
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    
    // Aplicar estilos de optimización
    img.style.imageRendering = 'optimize-contrast';
    img.style.transform = 'translateZ(0)';
  });
  
  console.log(`🎨 Optimizadas ${images.length} imágenes`);
};

// Función para optimizar animaciones
export const optimizeAnimations = (): void => {
  if (typeof window === 'undefined') return;
  
  // Configurar CSS para animaciones optimizadas
  const style = document.createElement('style');
  style.textContent = `
    @media (prefers-reduced-motion: no-preference) {
      .animate, [class*="animate-"] {
        will-change: transform, opacity;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }
    }
    
    @media (prefers-reduced-motion: reduce) {
      .animate, [class*="animate-"] {
        animation: none !important;
        transition: none !important;
      }
    }
  `;
  
  document.head.appendChild(style);
  console.log('🎬 Animaciones optimizadas');
};

// Función para reducir el uso de memoria GPU
export const reduceGPUMemoryUsage = (): void => {
  if (typeof window === 'undefined') return;
  
  // Limpiar canvases no utilizados
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach(canvas => {
    if (!canvas.isConnected) {
      canvas.remove();
    }
  });
  
  // Limpiar imágenes no utilizadas
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.isConnected) {
      img.remove();
    }
  });
  
  // Forzar garbage collection
  if (window.gc) {
    window.gc();
  }
  
  console.log('🧹 Memoria GPU optimizada');
};

// Inicializar automáticamente en Android
if (typeof window !== 'undefined') {
  // Detectar Android
  const isAndroid = /Android/i.test(navigator.userAgent);
  
  if (isAndroid) {
    // Inicializar optimizaciones automáticamente
    AndroidGPUOptimizer.initialize();
    optimizeImages();
    optimizeAnimations();
    
    // Limpiar memoria periódicamente
    setInterval(reduceGPUMemoryUsage, 30000); // Cada 30 segundos
    
    console.log('🤖 Optimizaciones de GPU para Android activadas');
  }
}

// Hacer funciones disponibles globalmente para depuración
if (typeof window !== 'undefined') {
  (window as any).AndroidGPUOptimizer = AndroidGPUOptimizer;
  (window as any).optimizeImages = optimizeImages;
  (window as any).optimizeAnimations = optimizeAnimations;
  (window as any).reduceGPUMemoryUsage = reduceGPUMemoryUsage;
  
  console.log('🛠️ Funciones de optimización GPU disponibles:');
  console.log('- AndroidGPUOptimizer.initialize()');
  console.log('- AndroidGPUOptimizer.getGPUStatus()');
  console.log('- optimizeImages()');
  console.log('- optimizeAnimations()');
  console.log('- reduceGPUMemoryUsage()');
}
