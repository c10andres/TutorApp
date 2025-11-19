# 📱 Configuración de Capacitor para iOS/Android

## Instalación inicial

```bash
# 1. Instalar Capacitor
npm install @capacitor/core @capacitor/cli

# 2. Inicializar Capacitor
npx cap init "TutorApp Colombia" "com.TutorApp.colombia"

# 3. Instalar plataformas
npm install @capacitor/android @capacitor/ios

# 4. Agregar plataformas
npx cap add android
npx cap add ios
```

## Configuración del proyecto

### capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.TutorApp.colombia',
  appName: 'TutorApp Colombia',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3b82f6",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT_CONTENT",
      backgroundColor: "#3b82f6"
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true
    }
  }
};

export default config;
```

## Scripts de build

### package.json (agregar scripts)
```json
{
  "scripts": {
    "build": "vite build",
    "cap:build": "npm run build && npx cap sync",
    "cap:android": "npm run cap:build && npx cap open android",
    "cap:ios": "npm run cap:build && npx cap open ios",
    "cap:run:android": "npm run cap:build && npx cap run android",
    "cap:run:ios": "npm run cap:build && npx cap run ios"
  }
}
```

## Comandos para compilar

### Android
```bash
# Construir y abrir Android Studio
npm run cap:android

# O compilar directamente (requiere Android Studio configurado)
npm run cap:build
npx cap run android --target=YOUR_DEVICE_ID

# Para generar APK de producción
npx cap build android --release
```

### iOS
```bash
# Construir y abrir Xcode (solo en Mac)
npm run cap:ios

# O compilar directamente (requiere Xcode)
npm run cap:build
npx cap run ios --target=YOUR_DEVICE_ID
```

## Requisitos del sistema

### Para Android:
- Android Studio instalado
- Android SDK configurado
- Java 11+ instalado

### Para iOS (solo Mac):
- Xcode instalado
- Cuenta de desarrollador de Apple
- macOS

## Plugins útiles

```bash
# Instalar plugins adicionales
npm install @capacitor/camera @capacitor/geolocation @capacitor/push-notifications @capacitor/local-notifications

# Para pagos móviles
npm install @capacitor/browser @capacitor/app

# Para notificaciones
npm install @capacitor/push-notifications
```