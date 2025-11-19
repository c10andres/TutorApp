import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { AndroidPerformance } from '../utils/android-performance';

export function useAndroidCleanup() {
  useEffect(() => {
    // Solo ejecutar en Android
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    console.log('🧹 Configurando limpieza básica para Android...');

    // Solo monitoreo básico de memoria
    const interval = setInterval(() => {
      AndroidPerformance.monitorMemory();
    }, 60000); // Cada 60 segundos (menos frecuente)

    return () => clearInterval(interval);
  }, []);
}
