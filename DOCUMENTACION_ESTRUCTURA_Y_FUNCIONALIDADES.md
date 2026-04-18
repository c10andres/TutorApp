# 📚 TutorApp — Estructura completa de la aplicación y funcionalidades (documentación técnica)

> Documento generado a partir del **código real** del repositorio (carpetas `src/`, `scripts/`, configuración en `package.json`) y de documentos internos como `MANUAL_DE_USUARIO.md` y `src/FIREBASE_DATA_STRUCTURE.md`.
>
> **Stack principal**: React 18 + Vite, UI con Radix + Tailwind, despliegue multiplataforma (Web/PWA y móvil con Capacitor), backend en Firebase (Auth + Realtime Database + Firestore/Storage en partes).

---

## 🧭 1) Vista general (qué es TutorApp)

TutorApp es un ecosistema de apoyo académico (Universidad Distrital) con:

- **Roles dinámicos** en una misma cuenta: **Modo Estudiante** y **Modo Tutor** (toggle).
- **Tutorías solidarias** (en el código actual conviven referencias a COP y a **Puntos de Mérito (PM)**; el “modelo objetivo” del proyecto describe una economía de reputación sin dinero).
- **Búsqueda de tutores** (manual + filtros) y **matching inteligente (IA)**.
- **Chat en tiempo real** (Realtime Database) + notificaciones.
- **Gestión académica** (semestres, materias, notas, proyecciones).
- **Documentación universitaria** (documentos locales `public/documents` y/o Firebase Storage).
- **Encuesta de usabilidad + sistema de interacciones** para analítica.
- Módulos adicionales: foro, moderación/reportes, reputación, analítica/ML, soporte.

---

## 🧱 2) Arquitectura y “cómo navega” la app

### **2.1 Navegación**

La app NO usa React Router: navega por estado interno en `src/App.tsx`.

- El tipo `Page` define pantallas como: `home`, `search`, `profile`, `chat`, `requests`, `request-tutoring`, `tutor-profile`, `wallet`, `academic`, `docs`, `smart-matching`, `academic-predictor`, `study-planner`, `schedule`, `subject-groups`, `support`, `forum`, `demo`, `interactions-analytics`, `survey-analytics`, `survey`, `login`, `register`, `forgot-password`.
- `handleNavigate(page, data?)` cambia `navigation` y opcionalmente carga `data` (tutor, requestId, etc.).
- `MobileNavigation` gestiona barra lateral/navegación móvil (colapsada/oculta) y el margen del contenido.

### **2.2 Gate de autenticación**

En `src/App.tsx`:

- Si `AuthContext.loading` → pantalla de “Cargando…”
- Si **NO hay usuario** → `LoginPage` / `RegisterPage` / `ForgotPasswordPage`
- Si **hay usuario** → renderiza el resto de páginas con contenedor responsive y navegación móvil.

### **2.3 Multiplataforma (Web + Android/iOS)**

Capacitor está integrado:

- Ajustes de `StatusBar`/`SplashScreen`.
- “safe areas” forzadas por CSS y utilidades.
- Varios helpers y diagnósticos específicos Android (optimización GPU, performance, debug).

---

## 📦 3) Estructura del repositorio (orientativa)

> Nota: el repo tiene muchos archivos de guía `.md` y scripts de soporte. Aquí se documentan las carpetas que describen **la app**.

### **3.1 Raíz**

- `package.json`: dependencias, scripts de build/dev, scripts de “seed” y testing de flujos.
- `index.html`: entrada Vite.
- `firestore.rules` y reglas Firebase.
- `scripts/`: utilidades para test, seed, data setup, verificación de chat, tutores, etc.
- `functions/`: (carpeta presente; típico de Firebase Functions, depende de tu implementación).
- `public/`: assets y documentos (`public/documents`).

### **3.2 `src/` (núcleo de la aplicación)**

- `App.tsx`: orquestación (auth gate + navegación + contenedores + survey global).
- `firebase.ts`: inicialización unificada de Firebase + instancias exportadas.
- `contexts/`
  - `AuthContext.tsx`: estado global de usuario y métodos auth.
- `pages/`: pantallas.
- `components/`: UI y componentes de negocio.
- `services/`: acceso a datos, lógica de dominio, ML, reputación, foro, docs, etc.
- `types/`: contratos TypeScript (`index.ts`, `survey.ts`).
- `hooks/`, `utils/`: helpers, diagnóstico, optimizaciones, sincronización de datos.

---

## 👤 4) Modelos de datos (TypeScript) — `src/types/index.ts`

### **4.1 `User` (usuario)**

Campos clave:

- **Identidad**: `id`, `email`, `name`, `avatar?`, `phone?`, `createdAt`, `updatedAt?`
- **Modo dinámico**: `currentMode: 'student' | 'tutor'`
- **Tutor**: `subjects`, `hourlyPoints`, `rating`, `totalReviews`, `availability`, `experience`
- **Economía reputación**: `reputationPoints`, `badges`, `rank`
- **Estudiante**: `preferredSubjects`
- **Permisos**: `isTestUser?` (usuarios maestros)
- **Rol académico adicional**: `academicRole?`

### **4.2 `TutorRequest` (solicitud de tutoría)**

- `studentId`, `tutorId`, `subject`, `description`
- `status`: `pending | accepted | rejected | completed | cancelled | in_progress`
- `scheduledTime?`, `duration`, `hourlyRate`, `totalAmount`
- `paymentMethod?`, `hasPaid?`, `hasReview?`

### **4.3 Chat**

- `ChatRoom`: `participants`, `updatedAt`, `lastMessage?`, `requestId?`
- `ChatMessage`: `senderId`, `receiverId`, `content`, `timestamp`, `read`, `requestId?`

### **4.4 Otros**

- `Review`, `Payment`, `Notification` (en el código actual hay tipificación; la implementación puede variar).
- Modelos académicos: `Semester`, `AcademicSubject`, `Evaluation`, `Schedule`, etc.
- Documentos: `UniversityDocument` y filtros.
- Interacciones: `UserInteraction` y `UserInteractionSummary` (para analítica).

---

## 🔥 5) Firebase (cómo se guarda la data realmente)

### **5.1 Inicialización — `src/firebase.ts`**

La app inicializa Firebase una sola vez y exporta:

- `auth` (Firebase Auth)
- `database` (Realtime Database)
- `db` (Firestore)
- `storage` (Firebase Storage)
- `perf` (Performance)

Además expone helpers como:

- `checkFirebaseConnection()`
- `initializeFirebaseData()` (verificación de rutas como `users` y `requests`)

### **5.2 Realtime Database vs Firestore**

En el código actual se usan ambos:

- **Realtime Database**: perfiles de usuario (`users`), solicitudes (`requests`), chat (`chatRooms`, `messages`), etc. (ej. `services/auth.ts`, `services/tutoring.ts`, `services/chat.ts`).
- **Firestore**: usado para `surveyResponses` (en `App.tsx`), y “knowledge base” en chat (`knowledge_base` en `services/chat.ts`).

> El archivo `src/FIREBASE_DATA_STRUCTURE.md` describe una arquitectura “ideal” más centrada en Firestore (users, tutoring_requests, chats/messages, etc.), pero el **código real** hoy implementa gran parte en **Realtime Database**.

---

## 🔐 6) Autenticación y perfil (Auth)

### **6.1 Contexto global — `src/contexts/AuthContext.tsx`**

Expone:

- **Estado**: `user`, `loading`
- **Acciones**: `signIn`, `signUp`, `signOut`, `resetPassword`, `switchMode`, `updateProfile`, `deleteAccount`
- `isTestUser()` (para mostrar opciones de prueba/diagnóstico)

El contexto se alimenta de `authService.onAuthStateChanged(...)`.

### **6.2 Servicio — `src/services/auth.ts`**

Back-end real:

- Firebase Auth: `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `sendPasswordResetEmail`, `deleteUser`, `onAuthStateChanged`.
- Perfil de usuario en Realtime DB: `users/{uid}` (con `set`, `get`, `update`, `remove`).

Características destacables:

- **Usuarios maestros** por email:
  - `CarlosAdminTutor@gmail.com`
  - `CarlosAdminEstudiante@gmail.com`
  - Se les inicializan defaults (modo, materias, rating, availability, etc.).
- `switchMode(mode)` asegura campos requeridos cuando un usuario pasa a tutor (subjects, hourlyRate/hourlyPoints, rating, etc.).
- `deleteAccount()` hace hard delete: borra `users/{uid}` en RTDB y luego elimina usuario de Auth (puede requerir re-login).

---

## 🏠 7) Pantallas (Pages) y funcionalidades

> Todas las páginas están en `src/pages/` y reciben `onNavigate(page, data?)` desde `App.tsx` (excepto algunas que dependen sólo de contexto).

### **7.1 `HomePage` (Dashboard) — `src/pages/HomePage.tsx`**

Funcionalidades:

- **Dashboard adaptado al modo** (`student` vs `tutor`):
  - Estudiante: CTA a buscar tutores, ver clases, módulos IA, soporte, tutores destacados.
  - Tutor: solicitudes pendientes, recordatorio de completar perfil, herramientas IA, tablero CIEM.
- **Carga de datos** (paralelo):
  - `usersService.getRecommendedTutors(user.id, 6)`
  - `tutoringService.getUserRequests(user.id)`
  - `usersService.getUserStats(user.id)`
- **Acciones rápidas**:
  - Cambiar modo (llama `switchMode()` y recarga).
  - Aceptar/rechazar solicitudes (actualiza estado y recarga).
  - Acceso a demo interactiva (`demo`).
- **Debug/diagnóstico**:
  - `DebugStatsPanel`, `TestUserOptions`, y utilidades Android/diagnóstico (principalmente visibles para test users).

### **7.2 `SearchPage` (Buscar tutores) — `src/pages/SearchPage.tsx`**

Funcionalidades:

- **Búsqueda por texto**: nombre, bio, materias (usa `tutoringService.searchTutors` con búsqueda “smart” que ignora tildes/case).
- **Filtros**:
  - Ciudad (select)
  - Rango de **PM por hora** (min/max)
- **UI de exploración** cuando no hay búsqueda: materias populares, ciudades, consejos.
- **Acciones por tutor**:
  - Ver perfil (`tutor-profile`)
  - Solicitar tutoría (`request-tutoring`)
- Alerta de configuración Firebase (`FirebaseSetupAlert`) si hay problemas de permisos.

### **7.3 `TutorProfilePage` (Perfil de tutor) — `src/pages/TutorProfilePage.tsx`**

Funcionalidades típicas (según navegación y componentes):

- Mostrar perfil detallado de tutor (bio, materias, rating, badges/rank, disponibilidad).
- Acciones: contactar / solicitar tutoría / abrir chat según flujo.

> El detalle exacto depende del contenido del archivo, pero el flujo está integrado desde `SearchPage` y `HomePage`.

### **7.4 `RequestTutoringPage` (Crear solicitud) — `src/pages/RequestTutoringPage.tsx`**

Funcionalidades:

- Formulario para crear solicitud (materia, descripción, fecha/hora, duración, modalidad).
- Guarda en RTDB mediante `tutoringService.createRequest(...)` (que usa `tutoring-unified` internamente).
- Dispara notificación al tutor (`notificationsService.createNotification`).

### **7.5 `RequestsPage` (Solicitudes / Clases) — `src/pages/RequestsPage.tsx`**

Funcionalidades:

- Vista por tabs:
  - **Activas**: `pending`, `accepted`, `in_progress`
  - **Historial**: `completed`, `cancelled`, `rejected`
- Acciones por rol:
  - **Estudiante**:
    - Cancelar (si `pending`)
    - Unirse a sesión (placeholder)
    - Botón unificado: **Finalizar y Calificar** (si `in_progress`)
    - Si `completed` pero falta pagar/calificar → “Pagar y Calificar”
  - **Tutor**:
    - Aceptar/Rechazar (si `pending`)
    - Marcar completada (si `in_progress`)
- **Pago solidario + reseña** en un mismo dialog:
  - Slider de puntos (5 a 10 por defecto en UI).
  - Rating 1–5 + comentario.
  - En backend:
    - `reputationService.transferPoints(studentId, tutorId, amount)`
    - `tutoringService.addReview(...)` (si hay comentario)
    - `tutoringService.updateRequestStatus(..., 'completed')`
    - `tutoringService.updateRequest(..., { hasPaid, hasReview, totalAmount: amount, paymentMethod: 'puntos_merito' })`

### **7.6 `ChatPage` (Mensajería) — `src/pages/ChatPage.tsx`**

Funcionalidades:

- Lista de conversaciones (`chatRooms`) del usuario:
  - `chatService.getUserChatRooms(user.id)`
  - Carga de perfiles “del otro usuario” con `usersService.getUsersByIds(...)` y cache local.
- Vista de mensajes:
  - Carga inicial: `chatService.getMessages(roomId)` (últimos 50).
  - Tiempo real: `chatService.onMessagesChanged(roomId, cb)`
  - Marcar leídos: `chatService.markMessagesAsRead(roomId, userId)`
- Creación automática de chat si se entra con `initialUser` (por ejemplo desde búsqueda o solicitud):
  - `chatService.getOrCreateChatRoom(user.id, otherUser.id, requestId)`
  - `chatService.createDemoMessages(...)` si hay `requestId` (demo)
- Adjuntos: UI de selección de archivo (placeholder; no sube todavía).
- Botones de llamada/videollamada: placeholders (“próximamente”).

### **7.7 `WalletPage` (Billetera / méritos) — `src/pages/WalletPage.tsx`**

Funcionalidades:

- Pantalla informativa de reputación/puntos:
  - Puntos, progreso a siguiente rango, insignias.
  - “Transacciones” y consejos para ganar puntos.
- Estado actual: mayormente mock/demostración en UI (la lógica real está en `services/reputation.ts`).

### **7.8 `AcademicManagementPage` (Gestión académica) — `src/pages/AcademicManagementPage.tsx`**

Este archivo es grande (no se leyó completo aquí por límite de tamaño), pero por tipos/servicios asociados incluye:

- Gestión de semestres, materias, créditos, notas por evaluación (cortes/quices/proyectos).
- Cálculos: promedios actuales, notas necesarias, proyecciones.
- Integración con servicios académicos (`src/services/academic.ts`, `src/services/academic-firebase.ts`) y módulos IA (predictor/planificador).

### **7.9 `AcademicPredictorPage` (Predictor IA) — `src/pages/AcademicPredictorPage.tsx`**

- Predicción de rendimiento y riesgo por materia.
- Recomendaciones accionables.
- Implementación ML: `src/services/ml/AcademicPredictorML.ts` y `src/services/ml/MLService.ts`.

### **7.10 `StudyPlannerPage` (Planificador IA) — `src/pages/StudyPlannerPage.tsx`**

- Planes de estudio, tareas, progreso.
- ML/heurísticas en `src/services/ml/StudyPlannerML.ts`.

### **7.11 `SmartMatchingPage` (Matching IA) — `src/pages/SmartMatchingPage.tsx`**

Funcionalidades:

- Wizard en 3 pasos: `preferences` → `analysis` → `results`.
- Preferencias:
  - Materia (búsqueda libre)
  - Presupuesto máximo (PM/h)
  - Rating mínimo
  - Objetivos de aprendizaje (checkbox)
- Motor:
  - Preferente: `smartMatchingML.findMatches(user, preferences, tutors)`
  - Fallback: scoring heurístico (materia, puntos, ubicación, horario, estilo/“rating”, experiencia)
- Resultados:
  - “Match perfecto” + lista secundaria
  - Recomendaciones “colaborativas” (simuladas)
  - CTA: ver perfil / contactar / solicitar tutoría

### **7.12 `UniversityDocsPage` (Documentación universitaria) — `src/pages/UniversityDocsPage.tsx`**

Funcionalidades:

- Carga documentos: `universityDocsService.getAllDocuments()`
  - Puede provenir de local (`public/documents` + `metadata.json`) y/o Firebase Storage.
- Filtros:
  - Búsqueda por texto (título/descr/tags)
  - Categoría
  - Rango de fechas
  - Orden (reciente/antiguo/título)
- Acciones:
  - **Ver**: abre PDF/link en nueva pestaña.
  - **Descargar**: usa servicio de descarga.
- Manejo de error: si no hay docs, indica cómo poblar `public/documents`.

### **7.13 `SurveyPage` y `SurveyAnalyticsPage` (Encuesta + analítica)**

En `App.tsx` existe un estado global `surveyData`:

- Arranca con `initialSurveyData` (150 filas generadas).
- Se mezcla con respuestas reales en Firestore `surveyResponses` por `onSnapshot`.
- `onSurveySubmit` guarda en Firestore y redirige a `survey-analytics`.

Además existen:

- `src/pages/InteractionsAnalyticsPage.tsx`
- hooks y servicios para interacciones (`useUserInteractions`, `services/user-interactions.ts`, generadores).

### **7.14 `ForumPage` (Foro)**

Está presente (`src/pages/ForumPage.tsx`) y hay servicios:

- `src/services/forum.ts`
- `src/services/moderation.ts`
- componentes de reporte/reputación (`ReportButton`, `ReputationBadge`, `ReportingSystem`).

Funcionalidades esperables:

- Publicar preguntas, responder, votar, marcar útil.
- Moderación y reportes.
- Impacto en reputación/PM.

### **7.15 `SupportPage` (Soporte)**

- Centro de soporte y posible “asistente IA” (por dependencias y servicios `src/services/support.ts`, `src/services/ml/SupportCenterML.ts`).
- Tickets o FAQ (la “knowledge base” de chat usa Firestore `knowledge_base`).

### **7.16 Otras pantallas**

- `SchedulePage`: gestión/visualización de horarios.
- `SubjectGroupsPage`: grupos por materia (ver tipo `SubjectGroup`).
- `DocumentsPage`: módulo adicional de documentos (distinto de “UniversityDocs”).
- `AppDemoPage`: demostración guiada de funcionalidades.
- `MLDashboardPage`: panel de estado/diagnóstico ML.
- Páginas auth: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`.

---

## 🧩 8) Servicios (Services) — qué hace cada módulo de backend

### **8.1 `services/auth.ts`**

- Auth Firebase y perfil RTDB `users/{uid}`.
- Cambio de modo + inicialización de defaults.
- Update profile y delete account.

### **8.2 `services/tutoring.ts`**

Responsabilidades:

- Obtener tutores (`getTutors`) desde RTDB:
  - Detecta perfiles con `subjects`.
  - Crea tutores mock si hay menos de 50 (para demos).
  - Migración “economía” (convierte legacy money → points) y asigna `reputationPoints/badges/rank/hourlyPoints`.
- Buscar tutores (`searchTutors`) con filtros (materia/ubicación/rating, etc.).
- Solicitudes:
  - Crear solicitud y notificar al tutor.
  - Obtener solicitudes del usuario (delegando a `tutoring-unified`).
  - Update de solicitud y estado.

### **8.3 `services/chat.ts`**

Responsabilidades:

- Sala única por par de usuarios: `roomId = userA_userB` (ordenado).
- Limpieza de salas duplicadas.
- Envío de mensaje:
  - Guarda en RTDB `messages/{roomId}`.
  - Actualiza `chatRooms/{roomId}` con `lastMessage`.
  - Crea notificación al receptor.
- Lectura/escucha:
  - `getMessages` (últimos 50).
  - `onMessagesChanged` (tiempo real).
  - `markMessagesAsRead`, `getUnreadCount`.
- **PromoteToFAQ**:
  - Guarda en Firestore colección `knowledge_base` para construir una base de conocimiento colaborativa.

### **8.4 `services/notifications.ts`**

- Creación/lectura de notificaciones (aparece en UI `NotificationsDropdown` y en `Layout` hay botón de “notificación de prueba”).

### **8.5 `services/reputation.ts`**

- Economía de reputación:
  - Transferencias de puntos (estudiante → tutor al finalizar sesión).
  - Cálculo de rangos/badges (según reglas del sistema).

### **8.6 `services/users.ts`**

- Recomendación de tutores (para Home).
- Carga por ids (para Chat).
- Stats del usuario (contadores en Home).

### **8.7 Módulos ML — `services/ml/*`**

Arquitectura típica:

- `MLService` / `MLConfig`: inicialización y estado.
- `SmartMatchingML`: matching compatibilidad.
- `AcademicPredictorML`: predicción de rendimiento.
- `StudyPlannerML`: sugerencias de plan.
- `SupportCenterML`: respuestas/triage de soporte.

### **8.8 Documentos — `services/university-docs.ts` y `services/documents.ts`**

- Lectura de metadata local.
- Download/view con fallback si Storage falla.

### **8.9 Foro/moderación**

- `forum.ts`, `moderation.ts`, `security.ts`, `reporting`.

---

## 🔁 9) Flujos end‑to‑end (de usuario) — “cómo funciona”

### **9.1 Registro → Perfil**

1. Usuario se registra (`RegisterPage`) → `authService.signUp`.
2. Se crea Auth user y perfil en RTDB `users/{uid}`.
3. `AuthContext` recibe cambio por `onAuthStateChanged`.

### **9.2 Cambiar modo Estudiante ↔ Tutor**

1. Usuario pulsa toggle (en UI: header o navegación).
2. `AuthContext.switchMode(mode)` → `authService.switchMode(mode)`.
3. Se actualiza `currentMode` en RTDB y se garantizan campos de tutor cuando aplica.

### **9.3 Buscar tutor → ver perfil → solicitar tutoría**

1. `SearchPage` ejecuta búsqueda → `tutoringService.searchTutors`.
2. Usuario abre perfil (`tutor-profile`) o solicita (`request-tutoring`).
3. `RequestTutoringPage` crea solicitud → RTDB `requests/{id}` + notificación al tutor.

### **9.4 Tutor recibe solicitud → acepta → sesión**

1. Tutor ve pendientes en `HomePage` o `RequestsPage`.
2. Acepta → `tutoringService.updateRequestStatus(id, 'accepted')`.
3. (Sesión/videollamada: hoy hay placeholder; el “join session” no está integrado a un proveedor).

### **9.5 Finalizar → pago solidario (PM) → reseña**

1. Estudiante pulsa “Finalizar y calificar”.
2. Se transfiere PM → `reputationService.transferPoints`.
3. Se crea reseña (si hay comentario) y se marca request:
   - `hasPaid=true`, `hasReview=true`, `paymentMethod='puntos_merito'`
   - Estado `completed`

### **9.6 Chat**

1. Se crea/abre sala por par de usuarios (única).
2. Mensajes en tiempo real; notificaciones al receptor.
3. Opción de “promover a FAQ” (base de conocimiento) desde servicio.

### **9.7 Encuesta + analítica**

1. Usuario responde encuesta (`SurveyPage`) → `onSurveySubmit`.
2. Se guarda en Firestore `surveyResponses`.
3. Analytics: páginas de analítica combinan respuestas + interacciones.

---

## 🧪 10) Scripts y utilidades (operación y pruebas)

En `package.json` hay muchos scripts para:

- **ML**: instalación de deps, status y tests de init.
- **Seed/Setup de datos**: crear usuarios, requests, completar perfiles, limpiar/verificar datos.
- **Test de chat**: varios scripts para depurar carga, duplicados, flujos.
- **iOS**: build/sync y prueba en navegador (`scripts/test-ios-browser.js`).

Esto es importante porque el repo está diseñado para ser “demo‑friendly” y validable por scripts.

---

## ⚠️ 11) Observaciones importantes (consistencias y “deuda técnica” visible)

Estas son inconsistencias detectables por lectura del código/documentos:

- **Modelo “pago” mixto**:
  - En `types`, `TutorRequest.hourlyRate/totalAmount` son numéricos (parecen COP).
  - En UI y reputación se usa **PM** (puntos) para finalizar y pagar.
  - `WalletPage` muestra puntos y rangos, pero usa mock data.
  - `tutoringService` contiene migraciones para pasar tutores legacy money → points.
  - Recomendación: definir claramente si `hourlyRate` representa COP o PM (o separar campos).
- **Firebase data model híbrido**:
  - Documentación `src/FIREBASE_DATA_STRUCTURE.md` describe Firestore como núcleo.
  - Implementación real usa **Realtime Database** como núcleo para usuarios/requests/chat.
  - Firestore se usa para encuesta y knowledge base.
  - Recomendación: documentar/estandarizar dónde vive cada entidad.

---

## ✅ 12) Lista rápida de funcionalidades por módulo (checklist)

- **Auth**
  - Login/registro/reset password
  - Perfil en RTDB
  - Delete account
  - Switch modo estudiante/tutor
- **Tutores**
  - Listado y recomendados
  - Búsqueda inteligente + filtros
  - Perfil de tutor
  - Smart Matching IA
- **Solicitudes**
  - Crear solicitud
  - Aceptar/rechazar/cancelar
  - Estados y historial
  - Finalizar + pago solidario + reseña
- **Reputación**
  - Transferencias de PM
  - Ranks/Badges
  - Wallet (UI)
- **Chat**
  - Salas, mensajes, real‑time
  - Read receipts + unread count
  - Notificaciones por mensaje
  - Knowledge base (promote FAQ)
- **Académico**
  - Semestres, materias, evaluaciones, proyecciones
  - Predictor IA
  - Planificador IA
  - Horarios y grupos
- **Documentos**
  - Biblioteca de documentos universitarios
  - Filtrado por categoría/fecha/tags
  - Ver/descargar (local + fallback Storage)
- **Comunidad**
  - Foro + moderación/reportes (según servicios y componentes presentes)
- **Soporte**
  - Centro de soporte + IA (según servicios ML)
- **Analítica**
  - Encuesta (Firestore)
  - Interacciones de usuario (tipadas y con páginas dedicadas)

---

## 📌 13) Qué archivo mirar para cada cosa (índice de “dónde está”)

- **Navegación y app shell**: `src/App.tsx`, `src/components/MobileNavigation.tsx`, `src/components/ResponsiveContainer.tsx`
- **Auth**: `src/contexts/AuthContext.tsx`, `src/services/auth.ts`, `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`
- **Tutores y solicitudes**: `src/services/tutoring.ts`, `src/pages/SearchPage.tsx`, `src/pages/RequestsPage.tsx`, `src/pages/RequestTutoringPage.tsx`
- **Chat**: `src/services/chat.ts`, `src/pages/ChatPage.tsx`
- **Notificaciones**: `src/services/notifications.ts`, `src/components/NotificationsDropdown.tsx`
- **Reputación**: `src/services/reputation.ts`, `src/components/ReputationSystem.tsx`, `src/pages/WalletPage.tsx`
- **IA/ML**: `src/services/ml/*`, `src/pages/SmartMatchingPage.tsx`, `src/pages/AcademicPredictorPage.tsx`, `src/pages/StudyPlannerPage.tsx`
- **Académico**: `src/pages/AcademicManagementPage.tsx`, `src/services/academic*.ts`, `src/pages/SchedulePage.tsx`
- **Documentos**: `src/pages/UniversityDocsPage.tsx`, `src/services/university-docs.ts`, `public/documents/*`
- **Encuesta/Analítica**: `src/pages/SurveyPage.tsx`, `src/pages/SurveyAnalyticsPage.tsx`, `src/pages/InteractionsAnalyticsPage.tsx`, `src/types/survey.ts`

---

## 🔚 14) Próximo paso recomendado (si quieres “máxima exactitud”)

Si quieres que este documento quede 100% exhaustivo “pantalla por pantalla” con todos los campos, validaciones, estados y UI, lo ideal es que yo:

- Lea completo `AcademicManagementPage.tsx`, `ProfilePage.tsx`, `TutorProfilePage.tsx`, `ForumPage.tsx`, `SupportPage.tsx`, `SchedulePage.tsx`, `SubjectGroupsPage.tsx`, `DocumentsPage.tsx`.
- Resuma cada uno en secciones: **props**, **estado**, **llamadas a servicios**, **colecciones/rutas Firebase**, **casos de error**, **interacciones**.

Puedo hacerlo y dejar esta documentación en versión “v2” dentro del mismo archivo (o en un `docs/` con índice).

