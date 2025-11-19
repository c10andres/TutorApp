// Hook para detectar la plataforma actual
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'ios' | 'android';

export interface PlatformInfo {
  platform: Platform;
  isNative: boolean;
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function usePlatform(): PlatformInfo {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>(() => {
    const platform = Capacitor.getPlatform() as Platform;
    const isNative = Capacitor.isNativePlatform();
    
    return {
      platform,
      isNative,
      isWeb: platform === 'web',
      isIOS: platform === 'ios',
      isAndroid: platform === 'android',
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      setPlatformInfo(prev => ({
        ...prev,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return platformInfo;
}

// Hook para clases CSS según plataforma
export function usePlatformClass() {
  const platform = usePlatform();
  
  return {
    container: `
      ${platform.isNative ? 'safe-area-inset' : ''}
      ${platform.isMobile ? 'px-4 py-2' : platform.isTablet ? 'px-6 py-3' : 'px-8 py-4'}
    `,
    card: `
      ${platform.isMobile ? 'rounded-lg' : 'rounded-xl'}
      ${platform.isMobile ? 'p-4' : 'p-6'}
    `,
    text: {
      title: platform.isMobile ? 'text-2xl' : platform.isTablet ? 'text-3xl' : 'text-4xl',
      subtitle: platform.isMobile ? 'text-lg' : platform.isTablet ? 'text-xl' : 'text-2xl',
      body: platform.isMobile ? 'text-sm' : 'text-base',
      small: platform.isMobile ? 'text-xs' : 'text-sm',
    },
  };
}
