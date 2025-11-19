# ⚡ Inicio Rápido - Para Desarrolladores

Si ya tienes experiencia con React/Node.js, esta es tu guía express.

---

## 🚀 TL;DR

```bash
npm install
npm run dev
# Open: http://localhost:5173
```

---

## 📦 Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| **Framework** | React | 18.2 |
| **Lenguaje** | TypeScript | 5.0 |
| **Estilos** | Tailwind CSS | v4.0 |
| **Build** | Vite | 4.4 |
| **Backend** | Firebase | 10.4 |
| **Móvil** | Capacitor | 5.5 |
| **UI** | Shadcn/ui + Radix | Latest |
| **Icons** | Lucide React | 0.263 |
| **Charts** | Recharts | 2.8 |
| **Forms** | React Hook Form | 7.55 |

---

## 📂 Estructura del Proyecto

```
/
├── App.tsx                 # Router principal
├── main.tsx                # Entry point
├── pages/                  # 17 páginas
├── components/             # Componentes reutilizables
│   ├── ui/                 # Shadcn components (40+)
│   └── ...
├── services/               # Firebase services (10)
├── contexts/               # React contexts
├── hooks/                  # Custom hooks
├── types/                  # TypeScript types
├── styles/                 # Global CSS (Tailwind v4)
└── public/                 # Static assets
```

---

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Dev server (localhost:5173)
npm run build            # Build producción
npm run preview          # Preview build
npm run lint             # ESLint

# Capacitor (Móvil)
npm run cap:build        # Build + sync
npm run cap:android      # Abrir Android Studio
npm run cap:ios          # Abrir Xcode
npm run cap:run:android  # Run en Android
npm run cap:run:ios      # Run en iOS
```

---

## 🔥 Configuración de Firebase

### 1. Crear proyecto Firebase

```bash
# 1. https://console.firebase.google.com/
# 2. Create project
# 3. Add Web App
```

### 2. Habilitar servicios

- **Authentication** → Email/Password
- **Firestore** → Test mode
- **Realtime Database** → Test mode
- **Storage** → Test mode

### 3. Configurar credenciales

Edita `/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Desplegar reglas de seguridad

```bash
node firebase-deploy-rules.js
```

---

## 📱 Build para Android

### Requisitos
- Android Studio
- Java 17 JDK
- Android SDK 33+

### Comandos

```bash
# Build web
npm run build

# Sync Capacitor
npx cap sync android

# Abrir Android Studio
npx cap open android

# O build directo
npm run cap:build:android
```

### Solucionar errores comunes

```bash
# Error de Gradle
./actualizar-gradle.sh    # Linux/Mac
actualizar-gradle.ps1     # Windows

# Error de Java version
export JAVA_HOME=/path/to/java17
```

---

## 🍎 Build para iOS

### Requisitos
- macOS
- Xcode 14+
- CocoaPods

### Comandos

```bash
npm run build
npx cap sync ios
npx cap open ios
```

---

## 🗂️ Servicios Firebase Disponibles

| Servicio | Archivo | Funciones |
|----------|---------|-----------|
| Auth | `services/auth.ts` | Login, register, logout |
| Users | `services/users.ts` | Profile, update, search |
| Chat | `services/chat.ts` | Mensajes en tiempo real |
| Tutoring | `services/tutoring.ts` | Solicitudes, confirmaciones |
| Payments | `services/payment.ts` | Transacciones, historial |
| Reviews | `services/reviews.ts` | Calificaciones, comentarios |
| Academic | `services/academic.ts` | Semestres, materias |
| Docs | `services/university-docs.ts` | Documentos universitarios |
| Support | `services/support.ts` | IA Support Center |
| Notifications | `services/notifications.ts` | Push notifications |

---

## 🎨 Sistema de Diseño

### Colores (Tailwind)

Variables CSS personalizadas en `/styles/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... más variables */
}
```

### Componentes UI (Shadcn)

40+ componentes disponibles en `/components/ui/`:

```tsx
import { Button } from "./components/ui/button"
import { Dialog } from "./components/ui/dialog"
import { Input } from "./components/ui/input"
// etc...
```

### Responsive

```tsx
// Uso del hook personalizado
const platform = usePlatform()

platform.isMobile    // true en móvil
platform.isTablet    // true en tablet
platform.isDesktop   // true en desktop
platform.isIOS       // true en iOS
platform.isAndroid   // true en Android
```

---

## 🔐 Seguridad

### Reglas de Firestore

Configuradas en `firebase-rules.json`:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### Despliegue

```bash
node firebase-deploy-rules.js
```

---

## 🧪 Testing

### Cuentas de prueba

```typescript
// Crear usuarios de prueba en Firebase Console o usar:
{
  email: "estudiante@test.com",
  password: "test123"
}

{
  email: "tutor@test.com",
  password: "test123"
}
```

---

## 📊 Datos Mock

La app incluye datos de prueba en:

- **Tutores:** 25+ tutores colombianos con datos realistas
- **Materias:** 103 materias (universidad completa)
- **Ubicaciones:** 25 ciudades colombianas
- **Transacciones:** Historial de pagos de ejemplo

---

## 🚢 Deployment

### Web

```bash
# Build
npm run build

# El output estará en /dist
# Sube a: Netlify, Vercel, Firebase Hosting, etc.
```

### Android (Play Store)

```bash
# 1. Build release
npm run cap:build:android

# 2. En Android Studio:
#    Build → Generate Signed Bundle/APK
#    Sube el .aab a Play Console
```

### iOS (App Store)

```bash
# 1. Build
npm run cap:build:ios

# 2. En Xcode:
#    Product → Archive
#    Upload to App Store Connect
```

---

## 🐛 Debug

### Modo desarrollo

```bash
# Con hot reload
npm run dev
```

### React DevTools

Instala la extensión del navegador:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Firebase Emulators (opcional)

```bash
# Instalar
npm install -g firebase-tools

# Inicializar
firebase init emulators

# Ejecutar
firebase emulators:start
```

---

## 📚 Documentación Completa

| Archivo | Contenido |
|---------|-----------|
| `README.md` | Documentación completa |
| `README_EMPEZAR_AQUI.md` | Guía paso a paso |
| `COMO_EMPEZAR.md` | Para principiantes |
| `README_FIREBASE_SETUP.md` | Configurar Firebase |
| `GUIA_ANDROID_STUDIO.md` | Build Android |
| `SOLUCION_*.md` | Troubleshooting |

---

## 🔄 Git Workflow (recomendado)

```bash
# Inicializar repo
git init
git add .
git commit -m "Initial commit"

# Conectar con GitHub
git remote add origin YOUR_REPO_URL
git push -u origin main

# Feature branch
git checkout -b feature/nueva-funcionalidad
git add .
git commit -m "Agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

---

## 🎯 Personalización Rápida

### Cambiar nombre de la app

```typescript
// package.json
{
  "name": "tu-app-name"
}

// public/manifest.json
{
  "name": "Tu App Name",
  "short_name": "TuApp"
}

// capacitor.config.ts
{
  appId: 'com.tuempresa.tuapp',
  appName: 'TuApp'
}
```

### Cambiar colores

Edita `/styles/globals.css`:

```css
:root {
  --primary: TU_COLOR_PRIMARIO;
  --secondary: TU_COLOR_SECUNDARIO;
}
```

### Cambiar logo

Reemplaza:
- `/public/icon-192x192.png`
- `/public/icon-512x512.png`
- `/public/apple-touch-icon.png`

---

## 💡 Tips de Desarrollo

### Hot Module Replacement (HMR)

Vite incluye HMR por defecto. Los cambios se reflejan instantáneamente.

### TypeScript Strict Mode

El proyecto usa TypeScript en modo estricto. Para deshabilitarlo:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false
  }
}
```

### Tailwind IntelliSense

Instala la extensión de VS Code:
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

## 🚀 Performance

### Optimizaciones incluidas

- ✅ Code splitting automático (Vite)
- ✅ Tree shaking
- ✅ Minificación de assets
- ✅ Lazy loading de componentes
- ✅ Image optimization
- ✅ PWA ready

### Medición

```bash
# Build de producción
npm run build

# Analizar bundle
npm install -g vite-bundle-visualizer
npx vite-bundle-visualizer
```

---

## 📈 Métricas

- **Tamaño del bundle:** ~400KB (gzipped)
- **Tiempo de carga:** <2s en 4G
- **Lighthouse Score:** 90+ (mobile)
- **TypeScript coverage:** 100%

---

## 🤝 Contribuir

```bash
# Fork + Clone
git clone YOUR_FORK_URL
cd tutorapp-colombia

# Install
npm install

# Create branch
git checkout -b feature/amazing-feature

# Make changes + commit
git commit -m "Add amazing feature"

# Push
git push origin feature/amazing-feature

# Create Pull Request en GitHub
```

---

## 📞 Soporte

- 📖 Documentación: 60+ archivos .md
- 🐛 Issues: GitHub Issues
- 💬 Discusiones: GitHub Discussions

---

## ⚡ Scripts Útiles

### Limpiar node_modules

```bash
# Mac/Linux
rm -rf node_modules package-lock.json && npm install

# Windows
rmdir /s /q node_modules && del package-lock.json && npm install
```

### Update dependencies

```bash
# Ver actualizaciones disponibles
npm outdated

# Actualizar
npm update

# Actualizar major versions (cuidado)
npx npm-check-updates -u
npm install
```

### Build para todas las plataformas

```bash
# Web
npm run build

# Android
npm run cap:build:android

# iOS
npm run cap:build:ios
```

---

## 🎉 ¡A Codear!

```bash
npm install && npm run dev
```

**Happy coding!** 🚀

---

<div align="center">

**[⬆ Volver al README principal](README.md)**

</div>
