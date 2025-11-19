// Utilidad para manejar fallbacks de Firebase cuando los índices no están disponibles

export class FirebaseFallbackManager {
  private static indexErrors = new Set<string>();
  private static fallbackMode = false;
  
  // Detectar si estamos en modo fallback debido a errores de índices
  static isInFallbackMode(): boolean {
    return this.fallbackMode || this.indexErrors.size > 0;
  }
  
  // Registrar un error de índice
  static registerIndexError(path: string, field: string): void {
    const errorKey = `${path}:${field}`;
    this.indexErrors.add(errorKey);
    
    // Si tenemos muchos errores de índices, activar modo fallback completo
    if (this.indexErrors.size >= 3) {
      this.fallbackMode = true;
      console.warn('🔄 Firebase fallback mode activated due to multiple index errors');
    }
  }
  
  // Obtener errores de índices registrados
  static getIndexErrors(): string[] {
    return Array.from(this.indexErrors);
  }
  
  // Ejecutar una consulta de Firebase con fallback automático
  static async executeWithFallback<T>(
    firebaseQuery: () => Promise<T>,
    fallbackQuery: () => Promise<T> | T,
    context: { path: string; field?: string }
  ): Promise<T> {
    // Si ya estamos en modo fallback, usar fallback directamente
    if (this.isInFallbackMode()) {
      console.log(`⚡ Using fallback for ${context.path} (fallback mode active)`);
      return await fallbackQuery();
    }
    
    try {
      return await firebaseQuery();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Detectar errores de índices
      if (errorMessage.includes('Index not defined') && context.field) {
        console.warn(`📊 Index missing for ${context.path}:${context.field}, using fallback`);
        this.registerIndexError(context.path, context.field);
      } else if (errorMessage.includes('Using an unspecified index')) {
        console.warn(`📊 Unspecified index for ${context.path}, using fallback`);
        if (context.field) {
          this.registerIndexError(context.path, context.field);
        }
      } else {
        console.warn(`🔄 Firebase query failed for ${context.path}:`, errorMessage);
      }
      
      // Usar fallback
      return await fallbackQuery();
    }
  }
  
  // Limpiar errores (útil después de desplegar reglas)
  static clearErrors(): void {
    this.indexErrors.clear();
    this.fallbackMode = false;
    console.log('✅ Firebase fallback manager reset');
  }
  
  // Mostrar estado actual
  static getStatus(): {
    fallbackMode: boolean;
    indexErrors: string[];
    totalErrors: number;
  } {
    return {
      fallbackMode: this.fallbackMode,
      indexErrors: Array.from(this.indexErrors),
      totalErrors: this.indexErrors.size
    };
  }
}

// Hook para suprimir warnings repetitivos de Firebase
export function suppressFirebaseWarnings(): void {
  if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    
    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Suprimir warnings repetitivos de índices
      if (message.includes('Using an unspecified index') || 
          message.includes('Consider adding ".indexOn"')) {
        // Solo mostrar cada warning una vez por sesión
        const warningKey = message.split('for better performance')[0];
        const suppressedWarnings = sessionStorage.getItem('suppressed-warnings') || '[]';
        const suppressed = JSON.parse(suppressedWarnings);
        
        if (!suppressed.includes(warningKey)) {
          suppressed.push(warningKey);
          sessionStorage.setItem('suppressed-warnings', JSON.stringify(suppressed));
          originalWarn.apply(console, ['⚠️ [ONCE]', ...args]);
        }
        return;
      }
      
      originalWarn.apply(console, args);
    };
  }
}

// Inicializar supresión de warnings automáticamente
if (typeof window !== 'undefined') {
  suppressFirebaseWarnings();
}