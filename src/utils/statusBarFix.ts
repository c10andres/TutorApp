// Utilidad para forzar el ajuste de la StatusBar
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export async function forceStatusBarFix() {
  try {
    if (Capacitor.isNativePlatform()) {
      console.log('🔧 Forzando ajuste de StatusBar...');
      
      // Forzar configuración múltiples veces
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Light });
      
      // Aplicar estilos CSS directamente al body
      const body = document.body;
      if (body) {
        body.style.setProperty('padding-top', 'env(safe-area-inset-top)', 'important');
        body.style.setProperty('padding-left', 'env(safe-area-inset-left)', 'important');
        body.style.setProperty('padding-right', 'env(safe-area-inset-right)', 'important');
        body.style.setProperty('padding-bottom', 'env(safe-area-inset-bottom)', 'important');
      }
      
      // Aplicar estilos al contenedor principal
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
        (appContainer as HTMLElement).style.setProperty('padding-top', 'env(safe-area-inset-top)', 'important');
        (appContainer as HTMLElement).style.setProperty('padding-left', 'env(safe-area-inset-left)', 'important');
        (appContainer as HTMLElement).style.setProperty('padding-right', 'env(safe-area-inset-right)', 'important');
        (appContainer as HTMLElement).style.setProperty('padding-bottom', 'env(safe-area-inset-bottom)', 'important');
      }
      
      // Aplicar estilos al contenido principal
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        (mainContent as HTMLElement).style.setProperty('padding-top', `max(env(safe-area-inset-top), 20px)`, 'important');
      }
      
      // Aplicar estilos a las páginas
      const pageContainer = document.querySelector('.page-container');
      if (pageContainer) {
        (pageContainer as HTMLElement).style.setProperty('padding-top', 'env(safe-area-inset-top)', 'important');
        (pageContainer as HTMLElement).style.setProperty('padding-left', 'env(safe-area-inset-left)', 'important');
        (pageContainer as HTMLElement).style.setProperty('padding-right', 'env(safe-area-inset-right)', 'important');
        (pageContainer as HTMLElement).style.setProperty('padding-bottom', 'env(safe-area-inset-bottom)', 'important');
      }
      
      console.log('✅ StatusBar ajustada forzadamente');
    }
  } catch (error) {
    console.warn('⚠️ Error forzando ajuste de StatusBar:', error);
  }
}

// Función para ejecutar el fix múltiples veces
export function scheduleStatusBarFix() {
  // Ejecutar inmediatamente
  forceStatusBarFix();
  
  // Ejecutar después de delays para asegurar que funcione
  setTimeout(forceStatusBarFix, 100);
  setTimeout(forceStatusBarFix, 500);
  setTimeout(forceStatusBarFix, 1000);
  setTimeout(forceStatusBarFix, 2000);
}
