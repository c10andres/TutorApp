// Utilidades específicas para debug en Android
import { Capacitor } from '@capacitor/core';

export class AndroidDebugService {
  private static instance: AndroidDebugService;
  private isAndroid: boolean;
  private debugLogs: string[] = [];

  constructor() {
    this.isAndroid = Capacitor.getPlatform() === 'android';
  }

  static getInstance(): AndroidDebugService {
    if (!AndroidDebugService.instance) {
      AndroidDebugService.instance = new AndroidDebugService();
    }
    return AndroidDebugService.instance;
  }

  // Log específico para Android
  log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [ANDROID] ${message}`;
    
    console.log(logEntry, data || '');
    this.debugLogs.push(logEntry);
    
    // En Android, también mostrar en alert para debug
    if (this.isAndroid && message.includes('ERROR')) {
      console.error('🚨 ANDROID ERROR:', message, data);
    }
  }

  // Verificar estado de la aplicación
  checkAppState() {
    this.log('🔍 Verificando estado de la aplicación...');
    
    const state = {
      platform: Capacitor.getPlatform(),
      isNative: Capacitor.isNativePlatform(),
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      localStorage: typeof Storage !== 'undefined',
      location: window.location.href
    };
    
    this.log('📊 Estado de la aplicación:', state);
    return state;
  }

  // Verificar autenticación
  checkAuthState(user: any) {
    this.log('🔐 Verificando estado de autenticación...');
    
    if (user) {
      this.log('✅ Usuario autenticado:', {
        id: user.id,
        name: user.name,
        email: user.email,
        currentMode: user.currentMode
      });
    } else {
      this.log('❌ Usuario NO autenticado');
    }
    
    return user;
  }

  // Verificar navegación
  checkNavigation(currentPage: string, navigationData?: any) {
    this.log('🧭 Verificando navegación...');
    
    this.log('📄 Página actual:', currentPage);
    if (navigationData) {
      this.log('📊 Datos de navegación:', navigationData);
    }
    
    // Verificar si la página es válida
    const validPages = [
      'home', 'search', 'profile', 'chat', 'requests', 
      'request-tutoring', 'request-details', 'review', 
      'tutor-profile', 'payments', 'academic', 'docs',
      'smart-matching', 'academic-predictor', 'study-planner', 'support'
    ];
    
    if (validPages.includes(currentPage)) {
      this.log('✅ Página válida:', currentPage);
    } else {
      this.log('❌ Página inválida:', currentPage);
    }
  }

  // Verificar componentes cargados
  checkComponentsLoaded() {
    this.log('🧩 Verificando componentes cargados...');
    
    const components = {
      React: typeof React !== 'undefined',
      document: typeof document !== 'undefined',
      window: typeof window !== 'undefined',
      localStorage: typeof localStorage !== 'undefined'
    };
    
    this.log('📦 Componentes disponibles:', components);
    
    // Verificar si hay errores en la consola
    const originalError = console.error;
    console.error = (...args) => {
      this.log('🚨 ERROR EN CONSOLA:', args);
      originalError.apply(console, args);
    };
  }

  // Verificar problemas específicos de Android
  checkAndroidIssues() {
    this.log('🤖 Verificando problemas específicos de Android...');
    
    const issues = [];
    
    // Verificar viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      issues.push('Viewport meta tag faltante');
    }
    
    // Verificar CSS cargado
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    if (stylesheets.length === 0) {
      issues.push('CSS no cargado');
    }
    
    // Verificar JavaScript cargado
    const scripts = document.querySelectorAll('script[src]');
    if (scripts.length === 0) {
      issues.push('JavaScript no cargado');
    }
    
    // Verificar body
    const body = document.body;
    if (!body || body.children.length === 0) {
      issues.push('Body vacío o no renderizado');
    }
    
    if (issues.length > 0) {
      this.log('❌ Problemas encontrados:', issues);
    } else {
      this.log('✅ No se encontraron problemas obvios');
    }
    
    return issues;
  }

  // Generar reporte completo
  generateReport(user: any, currentPage: string, navigationData?: any) {
    this.log('📋 Generando reporte completo de debug...');
    
    const report = {
      timestamp: new Date().toISOString(),
      platform: this.checkAppState(),
      auth: this.checkAuthState(user),
      navigation: this.checkNavigation(currentPage, navigationData),
      components: this.checkComponentsLoaded(),
      issues: this.checkAndroidIssues(),
      logs: this.debugLogs.slice(-10) // Últimos 10 logs
    };
    
    this.log('📊 Reporte completo:', report);
    return report;
  }

  // Limpiar logs
  clearLogs() {
    this.debugLogs = [];
    this.log('🧹 Logs limpiados');
  }

  // Obtener logs
  getLogs() {
    return this.debugLogs;
  }
}

export const androidDebug = AndroidDebugService.getInstance();
