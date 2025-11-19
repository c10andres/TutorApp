# 🚀 TutorApp - Comandos de Instalación Completa

## 📦 Instalación Paso a Paso

### 1. 🏗️ Crear proyecto base
```bash
# Crear directorio del proyecto
mkdir TutorApp
cd TutorApp

# Inicializar proyecto Node.js
npm init -y

# Configurar como proyecto de módulos ES
npm pkg set type="module"
```

### 2. 📦 Instalar dependencias principales
```bash
# React y React DOM
npm install react@^18.2.0 react-dom@^18.2.0

# Firebase para backend
npm install firebase@^10.7.1

# Íconos Lucide
npm install lucide-react@^0.263.1

# Gráficos y charts
npm install recharts@^2.8.0

# Formularios
npm install react-hook-form@7.55.0

# Animaciones
npm install motion@^10.16.0

# Notificaciones toast
npm install sonner@2.0.3

# Layouts responsivos
npm install react-responsive-masonry@^2.1.7

# Carruseles
npm install react-slick@^0.29.0 slick-carousel@^1.8.1
```

### 3. 🛠️ Instalar dependencias de desarrollo
```bash
# TypeScript y tipos
npm install -D typescript@^5.0.2
npm install -D @types/react@^18.2.15
npm install -D @types/react-dom@^18.2.7

# Vite para build
npm install -D vite@^4.4.5
npm install -D @vitejs/plugin-react@^4.0.3

# ESLint para calidad de código
npm install -D eslint@^8.45.0
npm install -D @typescript-eslint/eslint-plugin@^6.0.0
npm install -D @typescript-eslint/parser@^6.0.0
npm install -D eslint-plugin-react-hooks@^4.6.0
npm install -D eslint-plugin-react-refresh@^0.4.3

# Capacitor para móvil
npm install -D @capacitor/core@^5.0.0
npm install -D @capacitor/cli@^5.0.0
npm install -D @capacitor/android@^5.0.0
npm install -D @capacitor/ios@^5.0.0

# PWA
npm install -D vite-plugin-pwa@^0.16.4
npm install -D workbox-window@^7.0.0
```

### 4. 📁 Crear estructura de directorios
```bash
# Crear estructura completa
mkdir -p {components/{ui,figma},pages,contexts,services,hooks,utils,types,styles,public,dist,guidelines,build-setup}

# Verificar estructura
tree -d
```

### 5. 📝 Crear archivos de configuración

#### package.json (actualizar scripts)
```bash
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="tsc && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.build:pwa="vite build --mode production"
npm pkg set scripts.build:android="npm run build && npx cap add android && npx cap copy && npx cap open android"
npm pkg set scripts.build:ios="npm run build && npx cap add ios && npx cap copy && npx cap open ios"
```

#### tsconfig.json
```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "*.ts", "*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
```

#### vite.config.ts
```bash
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-*.png'],
      manifest: {
        name: 'TutorApp',
        short_name: 'TutorApp',
        description: 'Plataforma de tutorías on-demand para estudiantes colombianos',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
EOF
```

#### capacitor.config.ts
```bash
cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tutorapp.colombia',
  appName: 'TutorApp',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#3b82f6",
      showSpinner: false
    }
  }
};

export default config;
EOF
```

### 6. 🎨 Crear archivos principales

#### index.html
```bash
cat > index.html << 'EOF'
<!doctype html>
<html lang="es-CO">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TutorApp - Tutorías On-Demand</title>
    <meta name="description" content="Plataforma de tutorías on-demand para estudiantes colombianos con IA">
    
    <!-- PWA Meta Tags -->
    <meta name="application-name" content="TutorApp">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="TutorApp">
    <meta name="format-detection" content="telephone=no">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#3b82f6">
    
    <!-- Apple Touch Icon -->
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    
    <!-- Manifest -->
    <link rel="manifest" href="/manifest.json">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/App.tsx"></script>
  </body>
</html>
EOF
```

#### main.tsx (punto de entrada)
```bash
cat > main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF
```

### 7. 🔥 Configurar Firebase

#### firebase.ts
```bash
cat > firebase.ts << 'EOF'
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Reemplazar con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-auth-domain",
  projectId: "tu-project-id",
  storageBucket: "tu-storage-bucket",
  messagingSenderId: "tu-messaging-sender-id",
  appId: "tu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
EOF
```

### 8. 📱 Configurar PWA

#### public/manifest.json
```bash
cat > public/manifest.json << 'EOF'
{
  "name": "TutorApp",
  "short_name": "TutorApp",
  "description": "Plataforma de tutorías on-demand para estudiantes colombianos con IA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "es-CO",
  "categories": ["education", "productivity", "lifestyle"],
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Buscar Tutor",
      "short_name": "Buscar",
      "description": "Encontrar un tutor disponible",
      "url": "/search",
      "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Mis Clases",
      "short_name": "Clases",
      "description": "Ver mis tutorías programadas",
      "url": "/requests",
      "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Chat",
      "short_name": "Chat",
      "description": "Mensajes con tutores",
      "url": "/chat",
      "icons": [{ "src": "/icon-192x192.png", "sizes": "192x192" }]
    }
  ]
}
EOF
```

### 9. 🎨 Configurar Tailwind CSS v4

#### styles/globals.css
```bash
cat > styles/globals.css << 'EOF'
@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 16px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --radius: 0.625rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  h1 { font-size: 2rem; font-weight: 600; }
  h2 { font-size: 1.5rem; font-weight: 600; }
  h3 { font-size: 1.25rem; font-weight: 600; }
  p { font-size: 1rem; line-height: 1.5; }
}
EOF
```

### 10. 🚀 Comandos de desarrollo

```bash
# Verificar instalación
npm list

# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Análisis del bundle
npm run build -- --analyze
```

### 11. 📱 Preparar para móvil

#### Capacitor setup
```bash
# Inicializar Capacitor
npx cap init TutorApp com.tutorapp.colombia

# Agregar plataformas
npx cap add android
npx cap add ios

# Sincronizar código
npx cap sync

# Abrir en IDE nativo
npx cap open android
npx cap open ios
```

### 12. 🌐 Deploy PWA

#### Netlify (más fácil)
```bash
# Build
npm run build

# Subir carpeta dist/ a netlify.com/drop
echo "Ir a https://netlify.com/drop y arrastrar carpeta dist/"
```

#### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar dominio
vercel --prod
```

#### Firebase Hosting
```bash
# Instalar Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Deploy
firebase deploy
```

### 13. 📱 Generar APK con PWABuilder

```bash
echo "1. Deploy tu PWA a hosting (Netlify, Vercel, etc.)"
echo "2. Ir a https://pwabuilder.com"
echo "3. Pegar URL de tu PWA"
echo "4. Configurar:"
echo "   - Package ID: com.tutorapp.colombia"
echo "   - App Name: TutorApp"
echo "   - Theme Color: #3b82f6"
echo "5. Descargar APK generado"
```

## 🎯 Lista de verificación final

```bash
# Verificar estructura
ls -la

# Verificar dependencias
npm list --depth=0

# Verificar scripts
npm run

# Test build
npm run build

# Verificar PWA
echo "Abrir Developer Tools > Application > Manifest"
echo "Verificar Service Worker registrado"
echo "Probar 'Add to Home Screen'"
```

## 🎉 ¡Tu TutorApp está lista!

### ✅ Lo que tienes ahora:
- ✅ Proyecto React + TypeScript configurado
- ✅ Firebase listo (necesitas credenciales)
- ✅ PWA completa con Service Worker
- ✅ Capacitor para build móvil
- ✅ Configuración de deploy
- ✅ Lista para generar APK

### 🚀 Siguientes pasos:
1. Copiar todos los archivos de código (componentes, páginas, servicios)
2. Configurar credenciales de Firebase
3. Hacer `npm run dev` para desarrollo
4. Build y deploy para PWA
5. Generar APK con PWABuilder

**🇨🇴 ¡Tu aplicación móvil de tutorías está lista para Colombia!** 📱✨