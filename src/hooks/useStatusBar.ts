import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { usePlatform } from './usePlatform';
import { Capacitor } from '@capacitor/core';

export function useStatusBar() {
  const platform = usePlatform();

  useEffect(() => {
    const configureStatusBar = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          console.log('🔧 Configurando StatusBar para:', platform.platform);
          
          // FORZAR que la StatusBar no oculte el contenido
          await StatusBar.setOverlaysWebView({ overlay: false });
          
          // Configurar estilo y color
          if (platform.isIOS) {
            await StatusBar.setStyle({ style: Style.Light });
            await StatusBar.setBackgroundColor({ color: '#ffffff' });
          } else if (platform.isAndroid) {
            await StatusBar.setStyle({ style: Style.Light });
            await StatusBar.setBackgroundColor({ color: '#3b82f6' });
          }
          
          // Aplicar padding adicional al body para compensar la StatusBar
          const body = document.body;
          if (body) {
            body.style.setProperty('padding-top', 'env(safe-area-inset-top)', 'important');
            body.style.setProperty('padding-left', 'env(safe-area-inset-left)', 'important');
            body.style.setProperty('padding-right', 'env(safe-area-inset-right)', 'important');
            body.style.setProperty('padding-bottom', 'env(safe-area-inset-bottom)', 'important');
          }
          
          // Aplicar también al contenedor principal
          const appContainer = document.querySelector('.app-container');
          if (appContainer) {
            (appContainer as HTMLElement).style.setProperty('padding-top', 'env(safe-area-inset-top)', 'important');
            (appContainer as HTMLElement).style.setProperty('padding-left', 'env(safe-area-inset-left)', 'important');
            (appContainer as HTMLElement).style.setProperty('padding-right', 'env(safe-area-inset-right)', 'important');
            (appContainer as HTMLElement).style.setProperty('padding-bottom', 'env(safe-area-inset-bottom)', 'important');
          }
          
          console.log('✅ StatusBar configurada correctamente');
        }
      } catch (error) {
        console.warn('⚠️ Error configurando StatusBar:', error);
      }
    };

    // Ejecutar inmediatamente y también después de un pequeño delay
    configureStatusBar();
    setTimeout(configureStatusBar, 100);
    setTimeout(configureStatusBar, 500);
    setTimeout(configureStatusBar, 1000);
    setTimeout(configureStatusBar, 2000);
  }, [platform.platform]);
}
