# 🎓 TutorApp Colombia - Aplicación de Tutorías On-Demand

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.4-ffca28.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Aplicación móvil multiplataforma de tutorías on-demand estilo Uber**  
Conecta estudiantes con tutores en tiempo real

### 👉 **¿Primera vez? Lee primero:** [`START_HERE.txt`](START_HERE.txt) ⚡ 10 segundos para ejecutar

### 📖 **Instrucciones completas:** [`LEER_PRIMERO.txt`](LEER_PRIMERO.txt) | Paso a paso detallado

### 🎨 **Ver cómo se verá:** [`VISTA_PREVIA_VISUAL.txt`](VISTA_PREVIA_VISUAL.txt) | Vista previa visual

### 📋 **Índice completo:** [`INDICE_COMPLETO.md`](INDICE_COMPLETO.md) | Todos los archivos de documentación

### 🔍 **Verificar:** `node verificar-todo.js` | Diagnóstico completo antes de ejecutar

[Inicio Rápido](#-inicio-rápido) • [Características](#-características) • [Instalación](#-instalación-completa) • [Documentación](#-documentación)

</div>

---

## 📋 Tabla de Contenidos

- [Inicio Rápido](#-inicio-rápido)
- [¿Qué es TutorApp?](#-qué-es-tutorapp)
- [Características](#-características)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Completa](#-instalación-completa)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Documentación](#-documentación)
- [Solución de Problemas](#-solución-de-problemas)

---

## 🚀 Inicio Rápido

### ¿Ya tienes Node.js instalado? Ejecuta esto:

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev

# 3. Abrir en navegador: http://localhost:5173
```

**¡Eso es todo!** La aplicación funcionará en modo demo sin necesidad de configurar Firebase.

### ⚠️ ¿Los estilos NO se ven en VS Code?

**IMPORTANTE:** Si descargas el proyecto y los estilos no se ven, usa estos scripts automáticos:

```bash
# Mac/Linux:
chmod +x fix-estilos-vscode.sh
./fix-estilos-vscode.sh

# Windows PowerShell (como Administrador):
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\fix-estilos-vscode.ps1

# Windows CMD:
fix-estilos-vscode.bat
```

**📖 Guía completa:** [`SOLUCION_ESTILOS_VS_CODE.md`](SOLUCION_ESTILOS_VS_CODE.md)  
**📖 Inicio rápido:** [`INICIO_RAPIDO_VS_CODE.txt`](INICIO_RAPIDO_VS_CODE.txt)

---

## 📱 ¿Qué es TutorApp?

TutorApp es una **aplicación móvil multiplataforma** completa tipo Uber para tutorías académicas, desarrollada con:

- ⚛️ **React 18** + **TypeScript**
- 🎨 **Tailwind CSS v4** (diseño responsive)
- 🔥 **Firebase** (autenticación, Firestore, storage)
- 📱 **Capacitor** (Android + iOS)
- 🇨🇴 **100% localizada para Colombia**

### Funcionalidades Principales:

✅ **Autenticación completa** (login, registro, recuperación de contraseña)  
✅ **Perfiles diferenciados** por rol (estudiante/tutor)  
✅ **Búsqueda y filtrado** de tutores por materia, ubicación, precio  
✅ **Chat en tiempo real** con Firebase  
✅ **Sistema de solicitudes** de tutoría  
✅ **Pagos integrados** (PSE, tarjeta, Nequi, Daviplata)  
✅ **Sistema de calificaciones** y reseñas  
✅ **Gestión académica** con semestres y materias  
✅ **4 funcionalidades de IA** (Smart Matching, Predictor, Planner, Support)  
✅ **Responsive** (móvil, tablet, desktop)

---

## ✅ Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

| Herramienta | Versión Mínima | Descarga |
|-------------|----------------|----------|
| **Node.js** | 18.x o superior | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x o superior | (incluido con Node.js) |
| **Git** | Cualquiera | [git-scm.com](https://git-scm.com/) |

### Verificar instalación:

```bash
node --version    # Debe mostrar v18.x o superior
npm --version     # Debe mostrar v9.x o superior
```

---

## 🔧 Instalación Completa

### Opción 1: Instalación Rápida (Recomendada)

```bash
# Clonar o descomprimir el proyecto
cd tutorapp-colombia

# Instalar todas las dependencias (toma 2-5 minutos)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

✅ **Listo!** Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

### Opción 2: Configurar Firebase (Opcional pero Recomendado)

La app funciona sin Firebase en modo demo, pero para funcionalidad completa:

#### Paso 1: Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Agregar proyecto"
3. Sigue el asistente

#### Paso 2: Habilitar servicios

En tu proyecto de Firebase, habilita:

- **Authentication** → Email/Password
- **Firestore Database** → Modo de prueba
- **Storage** → Modo de prueba
- **Realtime Database** → Modo de prueba

#### Paso 3: Obtener credenciales

1. Ve a "Configuración del proyecto" (⚙️)
2. En "Tus aplicaciones", selecciona "Web" (<//>)
3. Copia la configuración

#### Paso 4: Configurar en el código

Edita `/firebase.ts` y reemplaza con tus credenciales:

```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://TU_PROJECT_ID-default-rtdb.firebaseio.com/",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

**📖 Guía detallada:** Lee `README_FIREBASE_SETUP.md`

---

### Opción 3: Compilar para Android/iOS

#### Android (requiere Android Studio)

```bash
# 1. Compilar proyecto
npm run build

# 2. Sincronizar con Capacitor
npx cap sync android

# 3. Abrir en Android Studio
npx cap open android

# 4. Ejecutar desde Android Studio en emulador o dispositivo
```

**📖 Guía completa:** Lee `GUIA_ANDROID_STUDIO.md`

#### iOS (requiere macOS + Xcode)

```bash
npm run build
npx cap sync ios
npx cap open ios
```

---

## 📂 Estructura del Proyecto

```
/
├── App.tsx                    # Componente principal (navegación)
├── main.tsx                   # Punto de entrada
├── package.json              # Dependencias y scripts
├── firebase.ts               # Configuración de Firebase
├── vite.config.ts            # Configuración de Vite
│
├── pages/                    # 17 páginas de la aplicación
│   ├── HomePage.tsx          # Página principal (dashboard)
│   ├── SearchPage.tsx        # Búsqueda de tutores
│   ├── ProfilePage.tsx       # Perfil de usuario
│   ├── ChatPage.tsx          # Chat en tiempo real
│   ├── RequestsPage.tsx      # Gestión de solicitudes
│   ├── PaymentsPage.tsx      # Historial de pagos
│   ├── AcademicManagementPage.tsx  # Gestión académica
│   ├── SmartMatchingPage.tsx       # IA: Smart Matching
│   ├── AcademicPredictorPage.tsx   # IA: Predictor
│   ├── StudyPlannerPage.tsx        # IA: Study Planner
│   ├── SupportPage.tsx             # IA: Support Center
│   └── ...
│
├── components/               # Componentes reutilizables
│   ├── MobileNavigation.tsx  # Navegación móvil
│   ├── TutorCard.tsx         # Tarjeta de tutor
│   ├── ResponsiveContainer.tsx
│   ├── ui/                   # Componentes UI (Shadcn)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ... (40+ componentes)
│   └── ...
│
├── services/                 # Servicios de Firebase
│   ├── auth.ts               # Autenticación
│   ├── users.ts              # Gestión de usuarios
│   ├── chat.ts               # Chat en tiempo real
│   ├── tutoring.ts           # Solicitudes de tutoría
│   ├── payment.ts            # Pagos
│   ├── reviews.ts            # Calificaciones
│   └── ...
│
├── contexts/                 # React Context
│   └── AuthContext.tsx       # Contexto de autenticación
│
├── hooks/                    # Custom hooks
│   ├── usePlatform.ts        # Detectar plataforma
│   └── useStatsRefresh.ts    # Refrescar estadísticas
│
├── types/                    # TypeScript types
│   └── index.ts              # Tipos principales
│
├── styles/                   # Estilos globales
│   └── globals.css           # Tailwind + Custom CSS
│
├── public/                   # Assets estáticos
│   ├── manifest.json         # PWA manifest
│   ├── favicon.ico
│   └── icons/
│
└── docs/                     # Documentación (60+ archivos .md)
    ├── README_EMPEZAR_AQUI.md
    ├── GUIA_ANDROID_STUDIO.md
    ├── README_FIREBASE_SETUP.md
    └── ...
```

---

## 📜 Scripts Disponibles

### Desarrollo

```bash
npm run dev         # Servidor desarrollo (http://localhost:5173)
npm run build       # Compilar para producción
npm run preview     # Vista previa de build de producción
npm run lint        # Ejecutar linter (ESLint)
```

### Capacitor (Móvil)

```bash
npm run cap:build           # Compilar + sincronizar
npm run cap:android         # Abrir en Android Studio
npm run cap:ios             # Abrir en Xcode
npm run cap:run:android     # Ejecutar en Android
npm run cap:run:ios         # Ejecutar en iOS
```

---

## 🌟 Características

### 👤 Autenticación
- Login con email/password
- Registro de nuevos usuarios
- Recuperación de contraseña
- Cierre de sesión
- Persistencia de sesión

### 🔍 Búsqueda de Tutores
- Filtros por materia (103 materias)
- Filtros por ubicación (25 ciudades colombianas)
- Filtros por precio (COP)
- Filtros por calificación
- Ordenamiento múltiple

### 💬 Chat en Tiempo Real
- Mensajes instantáneos con Firebase
- Indicadores de escritura
- Historial de conversaciones
- Notificaciones de nuevos mensajes

### 📚 Gestión Académica
- Sistema de semestres
- Gestión de materias
- Tracking de progreso
- Documentación universitaria

### 💳 Sistema de Pagos
- PSE (Bancos colombianos)
- Tarjetas de crédito/débito
- Nequi
- Daviplata
- Historial de transacciones

### 🤖 Funcionalidades de IA
1. **Smart Matching**: Algoritmo de emparejamiento inteligente
2. **Academic Predictor**: Predicción de rendimiento académico
3. **Study Planner**: Planificador de estudio personalizado
4. **Support Center**: Centro de ayuda con IA

### 📱 Multiplataforma
- **Web** (responsive)
- **Android** (vía Capacitor)
- **iOS** (vía Capacitor)
- **PWA** (Progressive Web App)

---

## 📚 Documentación

El proyecto incluye **60+ archivos** de documentación detallada:

### Para Empezar
- 📖 `README_EMPEZAR_AQUI.md` - **LEER PRIMERO**
- 🚀 `QUICK_START.md` - Guía rápida
- 👨‍🎓 `GUIA_PASO_A_PASO_PRINCIPIANTES.md` - Para principiantes
- 📸 `TUTORIAL_VISUAL_SIMPLE.md` - Tutorial visual

### Configuración
- 🔥 `README_FIREBASE_SETUP.md` - Configurar Firebase
- 📱 `GUIA_ANDROID_STUDIO.md` - Compilar para Android
- 🔧 `COMANDOS_INSTALACION_COMPLETA.md` - Todos los comandos
- ✅ `PROJECT_CHECKLIST.md` - Checklist de deployment

### Solución de Problemas
- 🐛 `SOLUCION_PANTALLA_BLANCA.md` - Pantalla blanca
- 🎨 `SOLUCION_ESTILOS.md` - Estilos no se ven
- ☕ `SOLUCION_GRADLE_JAVA.md` - Errores de Gradle/Java
- 🔥 `FIREBASE_ERRORS_SOLVED.md` - Errores de Firebase
- 📱 `ANDROID_ERRORES_COMUNES.md` - Errores de Android

### Desarrollo
- 🏗️ `GUIA_REPLICACION_COMPLETA.md` - Replicar proyecto
- 📦 `GUIA_EXPORTACION_COMPLETA.md` - Exportar a producción
- 📱 `GUIA_RESPONSIVE_MULTIPLATAFORMA.md` - Sistema responsive

---

## 🐛 Solución de Problemas

### ❌ Error: "command not found: npm"

**Causa:** Node.js no está instalado  
**Solución:** Descarga e instala Node.js desde [nodejs.org](https://nodejs.org/)

```bash
# Verifica instalación
node --version
npm --version
```

---

### ❌ Pantalla blanca o estilos no se ven

**Causa:** Dependencias no instaladas o build corrupto  
**Solución:**

```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**📖 Guía detallada:** Lee `SOLUCION_PANTALLA_BLANCA.md`

---

### ❌ Error: "Firebase is not configured"

**Causa:** Normal en primera instalación (modo demo)  
**Solución:** La app funciona sin Firebase. Para habilitar:

1. Lee `README_FIREBASE_SETUP.md`
2. Configura Firebase Console
3. Copia credenciales a `/firebase.ts`

**📖 Guía detallada:** Lee `FIREBASE_ERRORS_SOLVED.md`

---

### ❌ Error de Gradle al compilar Android

**Causa:** Java no configurado o versión incorrecta  
**Solución:**

```bash
# Instalar Java 17 (JDK)
# Luego ejecutar:
./actualizar-gradle.sh    # Linux/Mac
actualizar-gradle.ps1     # Windows
```

**📖 Guía detallada:** Lee `SOLUCION_GRADLE_JAVA.md`

---

### ❌ Puerto 5173 ya en uso

**Causa:** Otra instancia de Vite corriendo  
**Solución:**

```bash
# Opción 1: Usar otro puerto
npm run dev -- --port 3000

# Opción 2: Matar proceso
# Mac/Linux
killall node

# Windows
taskkill /F /IM node.exe
```

---

### 🆘 Más ayuda

Si encuentras otros problemas:

1. **Busca en la documentación**: 60+ archivos `.md` en el proyecto
2. **Revisa errores comunes**: `ANDROID_ERRORES_COMUNES.md`
3. **Firebase issues**: `FIREBASE_ERRORS_SOLVED.md`
4. **Guía completa**: `README_EMPEZAR_AQUI.md`

---

## 🧪 Cuentas de Prueba

Cuando configures Firebase, puedes crear usuarios de prueba o usar estos:

```
📧 Estudiante de prueba:
Email: estudiante@test.com
Password: test123

📧 Tutor de prueba:
Email: tutor@test.com
Password: test123
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React** 18.2 - Framework UI
- **TypeScript** 5.0 - Tipado estático
- **Tailwind CSS** v4 - Estilos utility-first
- **Vite** 4.4 - Build tool ultrarrápido

### Backend & Servicios
- **Firebase Auth** - Autenticación
- **Firestore** - Base de datos NoSQL
- **Firebase Storage** - Almacenamiento
- **Realtime Database** - Chat en tiempo real

### Móvil
- **Capacitor** 5.5 - Wrapper nativo
- **Android SDK** - Compilación Android
- **Xcode** - Compilación iOS

### UI Components
- **Shadcn/ui** - 40+ componentes
- **Radix UI** - Primitives accesibles
- **Lucide React** - Iconos
- **Recharts** - Gráficos

### Herramientas
- **ESLint** - Linter
- **PostCSS** - Procesador CSS
- **React Hook Form** - Formularios

---

## 📊 Estadísticas del Proyecto

- 📄 **175 archivos** de código
- 📑 **17 páginas** funcionales
- 🧩 **72 componentes** reutilizables
- 🔧 **10 servicios** de Firebase
- 📚 **60+ archivos** de documentación
- 📱 **3 plataformas** (Web, Android, iOS)
- 🇨🇴 **103 materias** colombianas
- 🏙️ **25 ubicaciones** reales

---

## 🔐 Configuración de Seguridad

### Firebase Security Rules

El proyecto incluye reglas de seguridad predefinidas en `firebase-rules.json`:

```bash
# Desplegar reglas de seguridad
node firebase-deploy-rules.js
```

**📖 Guía detallada:** Lee `README_FIREBASE_RULES.md`

---

## 🚀 Deployment

### Web (Hosting)

```bash
# Compilar para producción
npm run build

# El build estará en /dist
# Sube a: Netlify, Vercel, Firebase Hosting, etc.
```

### Android (Google Play)

```bash
# Generar APK firmado
npm run cap:build:android
# Luego firma y sube a Play Console
```

**📖 Guía detallada:** Lee `GUIA_EXPORTACION_COMPLETA.md`

---

## 📝 Licencia

Este proyecto es de código abierto bajo licencia MIT.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

¿Necesitas ayuda?

1. 📖 Lee `README_EMPEZAR_AQUI.md`
2. 🔍 Busca en los archivos de documentación
3. 🐛 Revisa `SOLUCION_DE_PROBLEMAS.md`
4. 💬 Abre un issue en el repositorio

---

## 🎯 Roadmap

- [ ] Sistema de notificaciones push
- [ ] Videollamadas integradas
- [ ] Pizarra colaborativa
- [ ] Integración con calendarios
- [ ] Sistema de referidos
- [ ] Modo oscuro
- [ ] Soporte multiidioma

---

## ✨ Créditos

Desarrollado con ❤️ en Colombia 🇨🇴

**Stack principal:**
- React Team por React
- Vercel por Next.js patterns
- Tailwind Labs por Tailwind CSS
- Firebase por el backend
- Ionic por Capacitor
- Shadcn por los componentes UI

---

## 🎉 ¡Listo para Empezar!

```bash
# Solo 3 comandos para empezar:
npm install
npm run dev
# Abre: http://localhost:5173
```

**¡Disfruta tu aplicación de tutorías!** 🎓📚

---

<div align="center">

**TutorApp Colombia** - Conectando estudiantes y tutores en Colombia

[⬆ Volver arriba](#-tutorapp-colombia---aplicación-de-tutorías-on-demand)

</div>
