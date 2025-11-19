# 🚀 Guía Completa de Exportación desde Figma Make

## 📋 Resumen Ejecutivo

Esta guía te permite replicar **100% exactamente** tu aplicación TutorApp desde Figma Make en VS Code y Android Studio, conservando toda la funcionalidad, diseño visual y lógica.

## 🎯 Objetivo

Mantener la aplicación **idéntica** en funcionalidad y diseño cuando se ejecute en:
- ✅ VS Code (desarrollo web)
- ✅ Android Studio (aplicación nativa)
- ✅ Dispositivos móviles reales

---

## 📦 PASO 1: Configuración del Proyecto

### 1.1 Clonar/Descargar el Proyecto

```bash
# Si tienes el proyecto en un ZIP, extráelo
# Si está en Git, clónalo
git clone [tu-repositorio]
cd TutorApp
```

### 1.2 Instalar Node.js (Versión Específica)

```bash
# Verificar versión de Node.js (debe ser 18.x o 20.x)
node --version

# Si no tienes la versión correcta:
# Descargar desde: https://nodejs.org/
```

---

## 📋 PASO 2: Instalación de Dependencias Exactas

### 2.1 Limpiar Instalaciones Previas

```bash
# Eliminar archivos de cache
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock

# En Windows PowerShell:
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
Remove-Item -Force yarn.lock
```

### 2.2 Instalar Dependencias

```bash
# Instalar todas las dependencias
npm install

# Si hay errores, forzar instalación limpia:
npm ci --force
```

---

## ⚙️ PASO 3: Configuración de Archivos Críticos

### 3.1 Verificar package.json

Asegúrate de que tu `package.json` contenga exactamente estas dependencias:

```json
{
  "name": "tutor-app-colombia",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "android": "cap sync android && cap open android",
    "ios": "cap sync ios && cap open ios"
  },
  "dependencies": {
    "@capacitor/android": "^6.0.0",
    "@capacitor/app": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/haptics": "^6.0.0",
    "@capacitor/keyboard": "^6.0.0",
    "@capacitor/splash-screen": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-sheet": "^1.0.5",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tailwindcss/forms": "^0.5.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "cmdk": "^0.2.1",
    "date-fns": "^3.3.1",
    "embla-carousel-react": "^8.0.0",
    "firebase": "^10.8.0",
    "lucide-react": "^0.344.0",
    "motion": "^10.16.2",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.55.0",
    "react-resizable-panels": "^2.0.12",
    "recharts": "^2.12.0",
    "sonner": "^1.4.3",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0",
    "@types/node": "^20.11.19",
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.35",
    "tailwindcss": "^4.0.0-alpha.25",
    "typescript": "^5.2.2",
    "vite": "^5.1.4",
    "vite-plugin-pwa": "^0.19.2"
  }
}
```

### 3.2 Verificar vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'TutorApp Colombia',
        short_name: 'TutorApp',
        description: 'Aplicación de tutorías on-demand para Colombia',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['lucide-react', '@radix-ui/react-dialog']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/components',
      '@pages': '/pages',
      '@utils': '/utils',
      '@types': '/types',
      '@services': '/services',
      '@contexts': '/contexts',
      '@hooks': '/hooks'
    }
  }
})
```

### 3.3 Verificar tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "sans-serif"
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
  ],
}
```

---

## 🔥 PASO 4: Configuración Firebase

### 4.1 Crear archivo firebase.ts

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // TUS CREDENCIALES DE FIREBASE AQUÍ
  apiKey: "tu-api-key",
  authDomain: "tu-project.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

### 4.2 Reglas de Firebase (firebase-rules.json)

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        ".read": "auth != null && (auth.uid == $uid || root.child('users').child(auth.uid).child('role').val() == 'admin')",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "tutoring_requests": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "reviews": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "chats": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## 📱 PASO 5: Configuración para Android Studio

### 5.1 Instalar Capacitor

```bash
# Instalar Capacitor globalmente
npm install -g @capacitor/cli

# Inicializar Capacitor (solo la primera vez)
npx cap init "TutorApp Colombia" "com.tutorapp.colombia"

# Agregar plataforma Android
npx cap add android
```

### 5.2 Configurar capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.tutorapp.colombia',
  appName: 'TutorApp Colombia',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3b82f6",
      showSpinner: false
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#3b82f6"
    },
    Keyboard: {
      resize: "ionic"
    }
  }
};

export default config;
```

### 5.3 Build para Android

```bash
# Construir la aplicación
npm run build

# Sincronizar con Capacitor
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

---

## 🚀 PASO 6: Scripts de Ejecución

### 6.1 Crear script completo de inicio

Crea un archivo `start-complete.sh`:

```bash
#!/bin/bash

echo "🚀 Iniciando TutorApp Colombia - Configuración Completa"

# Limpiar instalaciones previas
echo "🧹 Limpiando instalaciones previas..."
rm -rf node_modules
rm -rf package-lock.json

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar Firebase
echo "🔥 Verificando configuración Firebase..."
if [ ! -f "firebase.ts" ]; then
    echo "⚠️ ADVERTENCIA: Necesitas configurar firebase.ts con tus credenciales"
fi

# Build del proyecto
echo "🔨 Construyendo proyecto..."
npm run build

# Sincronizar con Capacitor
echo "📱 Sincronizando con Capacitor..."
npx cap sync

echo "✅ ¡Configuración completa!"
echo ""
echo "Para ejecutar:"
echo "🌐 Web: npm run dev"
echo "📱 Android: npx cap open android"
```

### 6.2 Para Windows (start-complete.ps1):

```powershell
Write-Host "🚀 Iniciando TutorApp Colombia - Configuración Completa" -ForegroundColor Green

# Limpiar instalaciones previas
Write-Host "🧹 Limpiando instalaciones previas..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install

# Verificar Firebase
Write-Host "🔥 Verificando configuración Firebase..." -ForegroundColor Yellow
if (!(Test-Path "firebase.ts")) {
    Write-Host "⚠️ ADVERTENCIA: Necesitas configurar firebase.ts con tus credenciales" -ForegroundColor Red
}

# Build del proyecto
Write-Host "🔨 Construyendo proyecto..." -ForegroundColor Yellow
npm run build

# Sincronizar con Capacitor
Write-Host "📱 Sincronizando con Capacitor..." -ForegroundColor Yellow
npx cap sync

Write-Host "✅ ¡Configuración completa!" -ForegroundColor Green
Write-Host ""
Write-Host "Para ejecutar:" -ForegroundColor Cyan
Write-Host "🌐 Web: npm run dev" -ForegroundColor White
Write-Host "📱 Android: npx cap open android" -ForegroundColor White
```

---

## ✅ PASO 7: Verificación Final

### 7.1 Ejecutar en VS Code

```bash
# Dar permisos al script (Linux/Mac)
chmod +x start-complete.sh
./start-complete.sh

# Ejecutar desarrollo web
npm run dev
```

### 7.2 Verificar que funciona correctamente

1. **Navegación:** ✅ El botón flotante de navegación funciona
2. **Responsive:** ✅ Se ve bien en móvil y desktop
3. **Componentes:** ✅ Todos los componentes cargan correctamente
4. **Estilos:** ✅ Los estilos Tailwind se aplican
5. **Firebase:** ✅ La autenticación funciona (con credenciales reales)

### 7.3 Ejecutar en Android Studio

```bash
# Construir y abrir en Android Studio
npm run build
npx cap sync android
npx cap open android
```

**En Android Studio:**
1. Esperar que Gradle termine de sincronizar
2. Conectar dispositivo Android o usar emulador
3. Hacer clic en "Run" ▶️
4. Verificar que la app se ejecuta idénticamente

---

## 🔧 PASO 8: Solución de Problemas Comunes

### 8.1 Error: "Module not found"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install --force
```

### 8.2 Error: "Styles not loading"

```bash
# Verificar Tailwind CSS
npm run build
# Verificar que /styles/globals.css existe
```

### 8.3 Error: "Firebase not configured"

```typescript
// Verificar firebase.ts tiene las credenciales correctas
// Verificar que Firebase está habilitado en la consola
```

### 8.4 Error: "Android build failed"

```bash
# Limpiar y reconstruir
npx cap clean android
npm run build
npx cap sync android
npx cap open android
```

---

## 📋 CHECKLIST FINAL

- [ ] ✅ Node.js 18.x o 20.x instalado
- [ ] ✅ Dependencias instaladas sin errores
- [ ] ✅ firebase.ts configurado con credenciales reales
- [ ] ✅ npm run dev funciona correctamente
- [ ] ✅ Navegación móvil funciona
- [ ] ✅ Estilos se ven correctamente
- [ ] ✅ Capacitor configurado
- [ ] ✅ Android Studio abre el proyecto
- [ ] ✅ App se ejecuta en dispositivo/emulador

---

## 🎯 Resultado Final

Siguiendo esta guía exactamente, tendrás tu aplicación TutorApp funcionando **100% idénticamente** tanto en VS Code como en Android Studio, manteniendo:

- ✅ **Funcionalidad completa:** Toda la lógica de la app
- ✅ **Diseño visual:** Estilos y componentes exactos
- ✅ **Navegación:** Sistema de navegación vertical móvil
- ✅ **Responsive:** Adaptación a todos los tamaños de pantalla
- ✅ **Performance:** Optimización para dispositivos móviles

**¡Tu app estará lista para producción!** 🚀