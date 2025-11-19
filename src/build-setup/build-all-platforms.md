# 🚀 Guía Completa de Compilación Multi-Plataforma

## 📋 Resumen de Opciones

| Plataforma | Tecnología | Dificultad | Tiempo | Tamaño App |
|------------|------------|------------|---------|------------|
| **PWA** | Vite PWA | ⭐ Fácil | 30 min | ~5MB |
| **Android** | Capacitor | ⭐⭐ Medio | 2 horas | ~15MB |
| **iOS** | Capacitor | ⭐⭐⭐ Difícil | 4 horas | ~20MB |
| **Windows** | Electron | ⭐⭐ Medio | 1 hora | ~120MB |

## 🎯 Recomendación por Prioridad

### 1. **EMPEZAR CON PWA** (Más rápido)
```bash
# 1. Instalar dependencias PWA
npm install vite-plugin-pwa workbox-window

# 2. Configurar vite.config.ts (ver pwa-setup.md)

# 3. Crear iconos en public/
# - pwa-192x192.png
# - pwa-512x512.png

# 4. Build
npm run build

# 5. Deploy (Netlify/Vercel)
```

### 2. **ANDROID con Capacitor**
```bash
# Pre-requisitos: Android Studio instalado

# 1. Setup Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "TutorApp Colombia" "com.TutorApp.colombia"
npx cap add android

# 2. Build web first
npm run build

# 3. Sync con Capacitor
npx cap sync android

# 4. Abrir Android Studio
npx cap open android

# 5. En Android Studio:
# - Build → Generate Signed Bundle/APK
# - Crear keystore si no tienes
# - Build APK de release
```

### 3. **iOS con Capacitor** (Solo Mac)
```bash
# Pre-requisitos: Xcode instalado + Cuenta Apple Developer

# 1. Setup Capacitor iOS
npm install @capacitor/ios
npx cap add ios

# 2. Build y sync
npm run build
npx cap sync ios

# 3. Abrir Xcode
npx cap open ios

# 4. En Xcode:
# - Configurar Bundle ID
# - Configurar certificados
# - Archive → Distribute App
```

### 4. **Windows con Electron**
```bash
# 1. Setup Electron
npm install --save-dev electron electron-builder

# 2. Crear electron/main.js (ver electron-setup.md)

# 3. Build
npm run build
npm run dist:win

# 4. El .exe estará en dist-electron/
```

## 📦 Scripts Unificados

### package.json completo
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    
    // PWA
    "build:pwa": "vite build",
    
    // Capacitor
    "cap:sync": "cap sync",
    "cap:android": "npm run build && npx cap sync android && npx cap open android",
    "cap:ios": "npm run build && npx cap sync ios && npx cap open ios",
    "build:android": "npm run build && npx cap sync android && npx cap build android",
    "build:ios": "npm run build && npx cap sync ios && npx cap build ios",
    
    // Electron
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "build:win": "npm run build && electron-builder --win",
    "build:mac": "npm run build && electron-builder --mac",
    "build:linux": "npm run build && electron-builder --linux",
    
    // Build todo
    "build:all": "npm run build:pwa && npm run build:android && npm run build:win"
  }
}
```

## 🔧 Configuración de Desarrollo

### .env para diferentes entornos
```bash
# .env.development
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_APP_ENV=production
VITE_API_URL=https://api.TutorApp.co

# .env.capacitor
VITE_APP_ENV=mobile
VITE_API_URL=https://api.TutorApp.co
```

## 📱 Assets Necesarios

### Iconos requeridos:
```
assets/
├── icon-512x512.png     # Base para generar otros
├── icon-192x192.png     # PWA
├── icon.ico             # Windows
├── icon.icns            # Mac
└── splash/              # Capacitor splash screens
    ├── splash-2732x2732.png
    └── ...
```

### Generar iconos automáticamente:
```bash
# Instalar herramienta
npm install -g icon-gen

# Generar desde un PNG de 1024x1024
icon-gen -i icon-1024.png -o assets/ --icns --ico
```

## 🚀 Deploy y Distribución

### PWA:
- **Netlify/Vercel**: Deploy directo desde Git
- **Firebase Hosting**: `firebase deploy`

### Android:
- **Google Play Store**: Subir APK/AAB
- **Distribución directa**: Compartir APK

### iOS:
- **App Store**: Través de Xcode/App Store Connect
- **TestFlight**: Para beta testing

### Windows:
- **Microsoft Store**: Subir MSIX
- **Distribución directa**: Compartir .exe

## ⚡ Tips de Optimización

### Para reducir tamaño:
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react']
        }
      }
    }
  }
});
```

### Para mejorar rendimiento móvil:
```typescript
// Lazy loading de páginas
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
```