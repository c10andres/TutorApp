# 🚀 GUÍA COMPLETA PARA REPLICAR TUTORAPP

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Instalación Paso a Paso](#instalación-paso-a-paso)
3. [Configuración de Firebase](#configuración-de-firebase)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Archivos Esenciales](#archivos-esenciales)
6. [Ejecutar la Aplicación](#ejecutar-la-aplicación)
7. [Solución de Problemas](#solución-de-problemas)

---

## 1. Requisitos Previos

### Software Necesario:
- ✅ **Node.js v18 o superior** - [Descargar](https://nodejs.org)
- ✅ **npm v8 o superior** (viene con Node.js)
- ✅ **Editor de código** - VS Code recomendado
- ✅ **Git** (opcional) - Para control de versiones

### Verificar Instalación:
```bash
node -v     # Debe mostrar v18.x.x o superior
npm -v      # Debe mostrar v8.x.x o superior
```

---

## 2. Instalación Paso a Paso

### Paso 1: Crear Proyecto Base
```bash
# Crear directorio del proyecto
mkdir tutorapp
cd tutorapp

# Inicializar proyecto npm
npm init -y
```

### Paso 2: Instalar Dependencias

#### Dependencies (Producción):
```bash
npm install react@18.2.0 react-dom@18.2.0
npm install firebase@10.7.1
npm install lucide-react@0.263.1
npm install recharts@2.8.0
npm install react-hook-form@7.55.0
npm install motion@10.16.0
npm install sonner@2.0.3
npm install react-responsive-masonry@2.1.7
npm install react-slick@0.29.0
npm install slick-carousel@1.8.1
```

#### DevDependencies (Desarrollo):
```bash
npm install -D @types/react@18.2.15 @types/react-dom@18.2.7
npm install -D @types/react-slick@0.23.10
npm install -D @types/node@20.5.0
npm install -D @typescript-eslint/eslint-plugin@6.0.0
npm install -D @typescript-eslint/parser@6.0.0
npm install -D @vitejs/plugin-react@4.0.3
npm install -D eslint@8.45.0
npm install -D eslint-plugin-react-hooks@4.6.0
npm install -D eslint-plugin-react-refresh@0.4.3
npm install -D typescript@5.0.2
npm install -D vite@4.4.5
```

### Paso 3: Crear `package.json`
```json
{
  "name": "tutorapp",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host --port 5173",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "firebase": "^10.7.1",
    "lucide-react": "^0.263.1",
    "recharts": "^2.8.0",
    "react-hook-form": "^7.55.0",
    "motion": "^10.16.0",
    "sonner": "^2.0.3",
    "react-responsive-masonry": "^2.1.7",
    "react-slick": "^0.29.0",
    "slick-carousel": "^1.8.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@types/react-slick": "^0.23.10",
    "@types/node": "^20.5.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

### Paso 4: Crear Archivos de Configuración

#### `tsconfig.json`:
```json
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
  "include": ["**/*.ts", "**/*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

#### `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})
```

#### `index.html` (raíz del proyecto):
```html
<!doctype html>
<html lang="es-CO">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TutorApp - Tutorías On-Demand</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

#### `main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## 3. Configuración de Firebase

### Paso 1: Crear Proyecto Firebase
1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Click "Agregar proyecto"
3. Nombre: "TutorApp" (o el que prefieras)
4. Deshabilitar Google Analytics (opcional)
5. Click "Crear proyecto"

### Paso 2: Configurar Authentication
1. En Firebase Console, ir a "Authentication"
2. Click "Comenzar"
3. Habilitar "Correo electrónico/contraseña"
4. Click "Guardar"

### Paso 3: Crear Realtime Database
1. En Firebase Console, ir a "Realtime Database"
2. Click "Crear base de datos"
3. Ubicación: United States (o tu región)
4. Modo: Comenzar en modo de prueba
5. Click "Habilitar"

### Paso 4: Configurar Reglas de Seguridad
En Realtime Database > Reglas, pegar:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid"
      }
    },
    "tutorRequests": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "chatMessages": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "reviews": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "notifications": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### Paso 5: Obtener Credenciales
1. En Firebase Console, ir a "Configuración del proyecto" (⚙️)
2. En "Tus apps", click en el ícono web `</>`
3. Registrar app con nombre "TutorApp Web"
4. Copiar las credenciales de configuración

### Paso 6: Crear `firebase.ts`
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com/",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const db = getFirestore(app);
export default app;
```

---

## 4. Estructura del Proyecto

### Crear Carpetas:
```bash
mkdir -p components/ui
mkdir -p components/figma
mkdir -p pages
mkdir -p services
mkdir -p contexts
mkdir -p types
mkdir -p utils
mkdir -p hooks
mkdir -p styles
mkdir -p public
```

### Archivos Principales que Debes Tener:

```
tutorapp/
├── index.html              # HTML base
├── main.tsx               # Entry point
├── App.tsx                # Componente principal (ya lo tienes)
├── vite.config.ts         # Configuración Vite
├── tsconfig.json          # Configuración TypeScript
├── package.json           # Dependencias
├── firebase.ts            # Configuración Firebase
│
├── styles/
│   └── globals.css        # CSS global (ya lo tienes)
│
├── components/            # Todos los componentes (ya los tienes)
│   ├── ui/               # 35+ componentes ShadCN
│   ├── Layout.tsx
│   ├── TutorCard.tsx
│   └── ...
│
├── pages/                # 18 páginas (ya las tienes)
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── ...
│
├── services/             # 10 servicios Firebase (ya los tienes)
│   ├── auth.ts
│   ├── tutoring.ts
│   └── ...
│
├── contexts/             # React Contexts (ya lo tienes)
│   └── AuthContext.tsx
│
├── types/                # Tipos TypeScript (ya lo tienes)
│   └── index.ts
│
├── utils/                # Utilidades (ya las tienes)
│   └── formatters.ts
│
└── public/               # Assets estáticos (ya los tienes)
    ├── favicon.ico
    └── icon-*.png
```

---

## 5. Archivos Esenciales

### Ya Tienes Estos Archivos (Conservarlos):

✅ `App.tsx` - Componente principal con routing
✅ `styles/globals.css` - CSS global con Tailwind v4
✅ `components/` - Todos los componentes
✅ `pages/` - Todas las 18 páginas
✅ `services/` - Todos los servicios Firebase
✅ `contexts/AuthContext.tsx` - Context de autenticación
✅ `types/index.ts` - Tipos TypeScript
✅ `utils/` - Utilidades y formatters
✅ `public/` - Iconos y manifest

### Solo Necesitas Crear:

📝 `package.json` - Con las dependencias exactas
📝 `tsconfig.json` - Configuración TypeScript
📝 `vite.config.ts` - Configuración Vite
📝 `index.html` - HTML base
📝 `main.tsx` - Entry point
📝 `firebase.ts` - Configuración Firebase (con TUS credenciales)

---

## 6. Ejecutar la Aplicación

### Instalación Completa:
```bash
# 1. Instalar todas las dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en navegador
http://localhost:5173
```

### Comandos Disponibles:
```bash
npm run dev      # Servidor desarrollo (Puerto 5173)
npm run build    # Build para producción
npm run preview  # Preview del build
npm run lint     # Verificar código
```

### Verificación de Funcionamiento:

✅ **Si funciona correctamente verás:**
- Página de login de TutorApp
- Estilos aplicados (colores, botones, cards)
- Sin errores en consola (F12)
- Firebase conectado (después de configurarlo)

---

## 7. Solución de Problemas

### Problema 1: "Module not found"
```bash
# Solución:
rm -rf node_modules package-lock.json
npm install
```

### Problema 2: "Cannot find module './types'"
```bash
# Verificar que exista types/index.ts
# Si no existe, créalo con los tipos base
```

### Problema 3: Error de TypeScript
```bash
# Ejecutar type check
npm run build

# Si hay errores, verificar:
# - tsconfig.json existe
# - Todos los archivos .tsx tienen imports correctos
```

### Problema 4: Firebase no conecta
```bash
# Verificar:
# 1. firebase.ts tiene las credenciales correctas
# 2. Firebase Console > Authentication está habilitado
# 3. Realtime Database está creado
# 4. Reglas de seguridad configuradas
```

### Problema 5: Estilos no se ven
```bash
# Verificar:
# 1. styles/globals.css existe
# 2. main.tsx importa './styles/globals.css'
# 3. Reiniciar servidor: Ctrl+C y npm run dev
```

### Problema 6: Puerto 5173 ocupado
```bash
# Cambiar puerto en vite.config.ts:
server: {
  port: 3000  // Usar otro puerto
}
```

---

## 8. Datos de Prueba

### Usuario Maestro (Pre-configurado):
```
Email: carlos@TutorApp.com
Password: (cualquier contraseña al registrarse)
```

### Materias Disponibles (103):
Matemáticas, Física, Química, Biología, Programación, Inglés, Economía, Contabilidad, Estadística, + 94 carreras universitarias completas

### Ubicaciones Colombia (25):
Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Cúcuta, Pereira, Santa Marta, Ibagué, Manizales, Villavicencio, Pasto, Neiva, Armenia, Popayán, Valledupar, Montería, Sincelejo, Tunja, Florencia, Riohacha, Quibdó, Yopal, Leticia

---

## 9. Funcionalidades Disponibles

Una vez instalado, tendrás acceso a:

### 🔐 Autenticación
- Login/Register
- Recuperación de contraseña
- Gestión de sesiones

### 👥 Perfiles
- Modo estudiante/tutor
- Edición de perfil
- Avatar y biografía

### 🔍 Búsqueda
- 103 materias
- 25 ubicaciones
- Filtros avanzados

### 💬 Chat
- Tiempo real
- Notificaciones

### 📚 Tutorías
- Solicitar tutorías
- Gestión de solicitudes
- Estados completos

### ⭐ Reviews
- Sistema 1-5 estrellas
- Comentarios

### 💰 Pagos
- PSE, Nequi, Daviplata
- Moneda COP

### 📊 Gestión Académica
- Semestres
- Notas y promedios
- Objetivos

### 🤖 4 Módulos IA
1. Smart Matching
2. Academic Predictor
3. Study Planner
4. Support Center

---

## 10. Próximos Pasos

1. ✅ **Instalar dependencias** (`npm install`)
2. ✅ **Configurar Firebase** (crear proyecto y credenciales)
3. ✅ **Ejecutar aplicación** (`npm run dev`)
4. ✅ **Registrar primer usuario** (será usuario maestro)
5. ✅ **Explorar funcionalidades** (todas las 18 páginas)
6. ✅ **Personalizar** (colores, logo, textos)

---

## 📞 Checklist Final

- [ ] Node.js v18+ instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] `firebase.ts` configurado con credenciales
- [ ] Firebase Authentication habilitado
- [ ] Realtime Database creado
- [ ] Reglas de seguridad configuradas
- [ ] `npm run dev` ejecutándose
- [ ] http://localhost:5173 funcionando
- [ ] Página de login visible con estilos
- [ ] Puedes registrar usuario nuevo

---

## 🎉 ¡Listo!

**Tu TutorApp está completamente replicada y funcionando.**

**Características:**
- ✅ 18 páginas funcionales
- ✅ Firebase integrado
- ✅ 50+ componentes
- ✅ Sistema completo de tutorías
- ✅ Chat en tiempo real
- ✅ Gestión académica
- ✅ 4 módulos IA
- ✅ 100% TypeScript
- ✅ Tailwind v4
- ✅ Responsive design

**🇨🇴 ¡Lista para revolucionar la educación en Colombia!** 🚀📚
