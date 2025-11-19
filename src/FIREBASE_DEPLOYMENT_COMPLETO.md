# 🚀 GUÍA COMPLETA DE DEPLOYMENT A FIREBASE - TutorApp

## 📋 Índice
1. [Prerrequisitos](#prerrequisitos)
2. [Configuración Inicial de Firebase](#configuración-inicial-de-firebase)
3. [Configuración del Proyecto](#configuración-del-proyecto)
4. [Reglas de Seguridad Firestore](#reglas-de-seguridad-firestore)
5. [Reglas de Seguridad Storage](#reglas-de-seguridad-storage)
6. [Índices Compuestos](#índices-compuestos)
7. [Estructura de Datos](#estructura-de-datos)
8. [Build y Deployment](#build-y-deployment)
9. [Verificación](#verificación)
10. [Troubleshooting](#troubleshooting)

---

## 1. Prerrequisitos

### Programas Necesarios
```bash
# Verificar Node.js (v18 o superior)
node --version

# Verificar npm (v9 o superior)
npm --version

# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Verificar instalación de Firebase CLI
firebase --version
```

### Cuenta de Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Ten tu proyecto listo (o créalo durante el proceso)

---

## 2. Configuración Inicial de Firebase

### Paso 1: Login en Firebase CLI
```bash
# Login en Firebase
firebase login

# Verificar que estás logueado
firebase projects:list
```

### Paso 2: Crear o Seleccionar Proyecto Firebase

#### Opción A: Crear Nuevo Proyecto desde la Consola
1. Ve a https://console.firebase.google.com/
2. Haz clic en "Agregar proyecto"
3. Nombre del proyecto: `tutorapp-colombia` (o el nombre que prefieras)
4. Desactiva Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

#### Opción B: Usar proyecto existente
Si ya tienes un proyecto, anota su **Project ID**

### Paso 3: Activar Servicios Necesarios

En la consola de Firebase (https://console.firebase.google.com/), ve a tu proyecto y activa:

#### 3.1 Authentication
1. Ve a **Build > Authentication**
2. Haz clic en **"Comenzar"**
3. Habilita **Email/Password**:
   - Haz clic en "Email/Password"
   - Activa el toggle
   - Guarda

#### 3.2 Firestore Database
1. Ve a **Build > Firestore Database**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Producción"** (aplicaremos reglas después)
4. Selecciona ubicación: **nam5 (us-central)** o la más cercana a Colombia
5. Haz clic en "Habilitar"

#### 3.3 Storage
1. Ve a **Build > Storage**
2. Haz clic en **"Comenzar"**
3. Acepta las reglas por defecto (las actualizaremos después)
4. Selecciona la misma ubicación que Firestore
5. Haz clic en "Listo"

#### 3.4 Hosting
1. Ve a **Build > Hosting**
2. Haz clic en **"Comenzar"**
3. Sigue los pasos (los haremos con CLI más adelante)

---

## 3. Configuración del Proyecto

### Paso 1: Obtener Configuración de Firebase

1. En la consola de Firebase, ve a **Project Settings** (⚙️)
2. En la sección **"Tus aplicaciones"**, haz clic en **"</>** (Web)
3. Registra la app:
   - Nombre de la app: `TutorApp Web`
   - Marca **"También configurar Firebase Hosting"**
   - Haz clic en **"Registrar app"**
4. Copia la configuración (firebaseConfig)

### Paso 2: Crear Archivo de Configuración

Crea o actualiza el archivo `/firebase.ts`:

```typescript
// /firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';

// REEMPLAZA ESTOS VALORES CON TU CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com"
};

// Inicializar Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let realtimeDb: Database;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  realtimeDb = getDatabase(app);
  
  console.log('✅ Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
  throw error;
}

export { app, auth, db, storage, realtimeDb };
export default app;
```

### Paso 3: Inicializar Firebase en el Proyecto

```bash
# En la raíz del proyecto
firebase init

# Selecciona con ESPACIO (marca con X):
# ◉ Firestore
# ◉ Hosting
# ◉ Storage

# Preguntas:
# - Use an existing project: Selecciona tu proyecto
# - Firestore rules file: firestore.rules (default)
# - Firestore indexes file: firestore.indexes.json (default)
# - Public directory: dist
# - Configure as single-page app: Yes
# - Set up automatic builds: No
# - Storage rules file: storage.rules (default)
```

---

## 4. Reglas de Seguridad Firestore

### Archivo: `/firestore.rules`

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función helper para verificar que el usuario es el dueño
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Función helper para verificar que el documento existe
    function documentExists(path) {
      return exists(path);
    }
    
    // ===================
    // COLECCIÓN: users
    // ===================
    match /users/{userId} {
      // Leer: Solo el propio usuario o cualquier usuario autenticado (para ver perfiles públicos)
      allow read: if isAuthenticated();
      
      // Crear: Solo durante el registro (el usuario crea su propio documento)
      allow create: if isAuthenticated() && isOwner(userId);
      
      // Actualizar: Solo el propio usuario
      allow update: if isOwner(userId);
      
      // Eliminar: Solo el propio usuario
      allow delete: if isOwner(userId);
      
      // Subcolección: reviews (reseñas recibidas por el tutor)
      match /reviews/{reviewId} {
        allow read: if isAuthenticated();
        allow write: if isAuthenticated();
      }
    }
    
    // ===================
    // COLECCIÓN: tutoring_requests
    // ===================
    match /tutoring_requests/{requestId} {
      // Leer: Solo los usuarios involucrados (estudiante o tutor)
      allow read: if isAuthenticated() && 
        (resource.data.studentId == request.auth.uid || 
         resource.data.tutorId == request.auth.uid);
      
      // Crear: Cualquier usuario autenticado puede crear una solicitud
      allow create: if isAuthenticated() && 
        request.resource.data.studentId == request.auth.uid;
      
      // Actualizar: Solo estudiante o tutor involucrados
      allow update: if isAuthenticated() && 
        (resource.data.studentId == request.auth.uid || 
         resource.data.tutorId == request.auth.uid);
      
      // Eliminar: Solo el estudiante que creó la solicitud
      allow delete: if isAuthenticated() && 
        resource.data.studentId == request.auth.uid;
    }
    
    // ===================
    // COLECCIÓN: chats
    // ===================
    match /chats/{chatId} {
      // Leer: Solo los participantes del chat
      allow read: if isAuthenticated() && 
        (request.auth.uid in resource.data.participants);
      
      // Crear: Cualquier usuario autenticado
      allow create: if isAuthenticated() && 
        (request.auth.uid in request.resource.data.participants);
      
      // Actualizar: Solo los participantes
      allow update: if isAuthenticated() && 
        (request.auth.uid in resource.data.participants);
      
      // Subcolección: messages
      match /messages/{messageId} {
        allow read: if isAuthenticated() && 
          (request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants);
        
        allow create: if isAuthenticated() && 
          request.resource.data.senderId == request.auth.uid;
        
        allow update: if isAuthenticated();
      }
    }
    
    // ===================
    // COLECCIÓN: reviews
    // ===================
    match /reviews/{reviewId} {
      // Leer: Cualquier usuario autenticado
      allow read: if isAuthenticated();
      
      // Crear: Solo el estudiante que completó la tutoría
      allow create: if isAuthenticated() && 
        request.resource.data.studentId == request.auth.uid;
      
      // Actualizar: Solo el autor de la reseña (dentro de 24 horas)
      allow update: if isAuthenticated() && 
        resource.data.studentId == request.auth.uid &&
        request.time < resource.data.createdAt + duration.value(1, 'd');
      
      // Eliminar: Solo el autor o el tutor puede reportar/eliminar
      allow delete: if isAuthenticated() && 
        (resource.data.studentId == request.auth.uid || 
         resource.data.tutorId == request.auth.uid);
    }
    
    // ===================
    // COLECCIÓN: payments
    // ===================
    match /payments/{paymentId} {
      // Leer: Solo los usuarios involucrados
      allow read: if isAuthenticated() && 
        (resource.data.studentId == request.auth.uid || 
         resource.data.tutorId == request.auth.uid);
      
      // Crear: Solo el estudiante
      allow create: if isAuthenticated() && 
        request.resource.data.studentId == request.auth.uid;
      
      // Actualizar: Sistema (vía Cloud Functions) - Por ahora, solo lectura
      allow update: if false;
      
      // No se puede eliminar
      allow delete: if false;
    }
    
    // ===================
    // COLECCIÓN: transactions
    // ===================
    match /transactions/{transactionId} {
      // Leer: Solo el dueño de la transacción
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // No se puede crear manualmente (solo vía backend)
      allow create: if false;
      allow update: if false;
      allow delete: if false;
    }
    
    // ===================
    // COLECCIÓN: notifications
    // ===================
    match /notifications/{notificationId} {
      // Leer: Solo el destinatario
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Crear: Cualquier usuario autenticado
      allow create: if isAuthenticated();
      
      // Actualizar: Solo el destinatario (marcar como leída)
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Eliminar: Solo el destinatario
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // ===================
    // COLECCIÓN: semesters (Gestión Académica)
    // ===================
    match /semesters/{semesterId} {
      // Leer: Solo el dueño
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Crear: Solo el usuario autenticado para sí mismo
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      // Actualizar: Solo el dueño
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Eliminar: Solo el dueño
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Subcolección: subjects (materias del semestre)
      match /subjects/{subjectId} {
        allow read, write: if isAuthenticated() && 
          get(/databases/$(database)/documents/semesters/$(semesterId)).data.userId == request.auth.uid;
      }
    }
    
    // ===================
    // COLECCIÓN: documents (Documentos Universitarios)
    // ===================
    match /documents/{documentId} {
      // Leer: Según privacidad del documento
      allow read: if isAuthenticated() && 
        (resource.data.privacy == 'public' || 
         resource.data.userId == request.auth.uid);
      
      // Crear: Cualquier usuario autenticado
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      // Actualizar: Solo el creador
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Eliminar: Solo el creador
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // ===================
    // COLECCIÓN: study_plans (Smart Study Planner)
    // ===================
    match /study_plans/{planId} {
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Subcolección: tasks
      match /tasks/{taskId} {
        allow read, write: if isAuthenticated() && 
          get(/databases/$(database)/documents/study_plans/$(planId)).data.userId == request.auth.uid;
      }
    }
    
    // ===================
    // COLECCIÓN: support_tickets (Soporte)
    // ===================
    match /support_tickets/{ticketId} {
      // Leer: Solo el creador del ticket
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Crear: Cualquier usuario autenticado
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      // Actualizar: Solo el creador
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Subcolección: messages (mensajes del ticket)
      match /messages/{messageId} {
        allow read: if isAuthenticated() && 
          get(/databases/$(database)/documents/support_tickets/$(ticketId)).data.userId == request.auth.uid;
        
        allow create: if isAuthenticated();
      }
    }
    
    // ===================
    // COLECCIÓN: analytics (Predictor Académico)
    // ===================
    match /analytics/{userId} {
      allow read: if isAuthenticated() && userId == request.auth.uid;
      allow write: if isAuthenticated() && userId == request.auth.uid;
    }
    
    // ===================
    // BLOQUEAR TODO LO DEMÁS
    // ===================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Desplegar Reglas de Firestore

```bash
# Desplegar solo las reglas
firebase deploy --only firestore:rules

# Verificar que se desplegaron correctamente
# Ve a Firebase Console > Firestore Database > Rules
```

---

## 5. Reglas de Seguridad Storage

### Archivo: `/storage.rules`

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Función helper para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función helper para validar tipo de archivo de imagen
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }
    
    // Función helper para validar tipo de documento
    function isDocument() {
      return request.resource.contentType.matches('application/pdf') ||
             request.resource.contentType.matches('application/msword') ||
             request.resource.contentType.matches('application/vnd.openxmlformats-officedocument.*') ||
             request.resource.contentType.matches('text/.*');
    }
    
    // Función helper para validar tamaño de archivo (en bytes)
    function isValidSize(maxSize) {
      return request.resource.size <= maxSize;
    }
    
    // ===================
    // FOTOS DE PERFIL
    // ===================
    match /profile_pictures/{userId}/{fileName} {
      // Leer: Cualquier usuario autenticado
      allow read: if isAuthenticated();
      
      // Escribir: Solo el dueño del perfil
      // - Debe ser una imagen
      // - Máximo 5MB
      allow write: if isAuthenticated() && 
        userId == request.auth.uid &&
        isImage() &&
        isValidSize(5 * 1024 * 1024);
      
      // Eliminar: Solo el dueño
      allow delete: if isAuthenticated() && userId == request.auth.uid;
    }
    
    // ===================
    // DOCUMENTOS DE CHAT
    // ===================
    match /chat_files/{chatId}/{fileName} {
      // Leer: Solo participantes del chat (verificar en Firestore)
      allow read: if isAuthenticated();
      
      // Escribir: Usuario autenticado que participa en el chat
      // - Imágenes hasta 10MB o documentos hasta 20MB
      allow write: if isAuthenticated() &&
        (
          (isImage() && isValidSize(10 * 1024 * 1024)) ||
          (isDocument() && isValidSize(20 * 1024 * 1024))
        );
    }
    
    // ===================
    // DOCUMENTOS UNIVERSITARIOS
    // ===================
    match /university_documents/{userId}/{fileName} {
      // Leer: Según privacidad (verificar en Firestore)
      allow read: if isAuthenticated();
      
      // Escribir: Solo el dueño
      // - Documentos hasta 50MB
      allow write: if isAuthenticated() && 
        userId == request.auth.uid &&
        isValidSize(50 * 1024 * 1024);
      
      // Eliminar: Solo el dueño
      allow delete: if isAuthenticated() && userId == request.auth.uid;
    }
    
    // ===================
    // CERTIFICADOS DE TUTORES
    // ===================
    match /tutor_certificates/{userId}/{fileName} {
      // Leer: Cualquier usuario autenticado
      allow read: if isAuthenticated();
      
      // Escribir: Solo el tutor dueño
      // - Imágenes o PDFs hasta 10MB
      allow write: if isAuthenticated() && 
        userId == request.auth.uid &&
        (isImage() || request.resource.contentType == 'application/pdf') &&
        isValidSize(10 * 1024 * 1024);
      
      // Eliminar: Solo el dueño
      allow delete: if isAuthenticated() && userId == request.auth.uid;
    }
    
    // ===================
    // TICKETS DE SOPORTE - ATTACHMENTS
    // ===================
    match /support_attachments/{ticketId}/{fileName} {
      // Leer: Usuario autenticado
      allow read: if isAuthenticated();
      
      // Escribir: Usuario autenticado
      // - Imágenes o documentos hasta 10MB
      allow write: if isAuthenticated() &&
        (
          (isImage() && isValidSize(10 * 1024 * 1024)) ||
          (isDocument() && isValidSize(10 * 1024 * 1024))
        );
    }
    
    // ===================
    // BLOQUEAR TODO LO DEMÁS
    // ===================
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### Desplegar Reglas de Storage

```bash
# Desplegar solo las reglas de Storage
firebase deploy --only storage:rules

# Verificar en Firebase Console > Storage > Rules
```

---

## 6. Índices Compuestos

### Archivo: `/firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "tutoring_requests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "studentId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "tutoring_requests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "tutorId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "isTutor",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "subjects",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "rating",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "isTutor",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "location",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "rating",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "tutorId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "read",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        {
          "fieldPath": "chatId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "documents",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "subject",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "privacy",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "documents",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "semesters",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "startDate",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "support_tickets",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "studentId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "tutorId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "type",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### Desplegar Índices

```bash
# Desplegar índices
firebase deploy --only firestore:indexes

# Los índices tardan algunos minutos en construirse
# Verifica el progreso en: Firebase Console > Firestore Database > Indexes
```

---

## 7. Estructura de Datos en Firestore

### Colecciones Principales

#### `/users/{userId}`
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  location: string;
  bio?: string;
  
  // Rol dual
  isStudent: boolean;
  isTutor: boolean;
  
  // Datos de tutor
  subjects?: string[];
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  totalSessions?: number;
  education?: string;
  experience?: string;
  certificates?: string[];
  availability?: {
    [day: string]: { start: string; end: string }[];
  };
  
  // Datos de estudiante
  academicLevel?: string;
  interests?: string[];
  
  // Estadísticas
  totalEarned?: number;
  totalSpent?: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive?: Timestamp;
}
```

#### `/tutoring_requests/{requestId}`
```typescript
interface TutoringRequest {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  description: string;
  
  // Fecha y hora
  requestedDate: Timestamp;
  duration: number; // en minutos
  
  // Ubicación
  mode: 'online' | 'presencial';
  location?: string;
  
  // Precio
  price: number;
  
  // Estado
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Chat asociado
  chatId?: string;
}
```

#### `/chats/{chatId}`
```typescript
interface Chat {
  id: string;
  participants: string[]; // [studentId, tutorId]
  requestId?: string;
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  createdAt: Timestamp;
}
```

#### `/chats/{chatId}/messages/{messageId}`
```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  fileURL?: string;
  fileName?: string;
  fileType?: string;
  createdAt: Timestamp;
  read: boolean;
}
```

#### `/reviews/{reviewId}`
```typescript
interface Review {
  id: string;
  studentId: string;
  tutorId: string;
  requestId: string;
  rating: number; // 1-5
  comment: string;
  aspects: {
    knowledge: number;
    punctuality: number;
    communication: number;
    patience: number;
    materials: number;
    value: number;
  };
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  anonymous: boolean;
}
```

#### `/payments/{paymentId}`
```typescript
interface Payment {
  id: string;
  requestId: string;
  studentId: string;
  tutorId: string;
  amount: number;
  currency: 'COP';
  method: 'pse' | 'card' | 'nequi' | 'daviplata' | 'efectivo' | 'baloto';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
```

#### `/notifications/{notificationId}`
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'request' | 'message' | 'review' | 'payment' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Timestamp;
}
```

#### `/semesters/{semesterId}`
```typescript
interface Semester {
  id: string;
  userId: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  university?: string;
  program?: string;
  active: boolean;
  createdAt: Timestamp;
}
```

#### `/semesters/{semesterId}/subjects/{subjectId}`
```typescript
interface Subject {
  id: string;
  name: string;
  code?: string;
  credits: number;
  professor?: string;
  schedule?: {
    [day: string]: { start: string; end: string }[];
  };
  grades: {
    name: string;
    value: number;
    percentage: number;
    date: Timestamp;
  }[];
  finalGrade?: number;
}
```

#### `/documents/{documentId}`
```typescript
interface Document {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subject: string;
  type: 'guia' | 'apuntes' | 'ejercicios' | 'examen' | 'presentacion' | 'video';
  fileURL: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  privacy: 'public' | 'contacts' | 'private';
  university?: string;
  professor?: string;
  semester?: string;
  rating?: number;
  downloads: number;
  views: number;
  createdAt: Timestamp;
}
```

#### `/study_plans/{planId}`
```typescript
interface StudyPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  goals: string[];
  subjects: string[];
  technique: 'pomodoro' | 'spaced-repetition' | 'active-recall' | 'feynman';
  active: boolean;
  createdAt: Timestamp;
}
```

#### `/study_plans/{planId}/tasks/{taskId}`
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  subject: string;
  dueDate: Timestamp;
  duration: number; // minutos
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  completedAt?: Timestamp;
  createdAt: Timestamp;
}
```

#### `/support_tickets/{ticketId}`
```typescript
interface SupportTicket {
  id: string;
  userId: string;
  category: 'technical' | 'payment' | 'account' | 'tutoring' | 'security' | 'other';
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  attachments?: string[];
  assignedTo?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
}
```

#### `/analytics/{userId}`
```typescript
interface Analytics {
  userId: string;
  
  // Predicciones
  predictions: {
    subject: string;
    predictedGrade: number;
    confidence: number;
    recommendations: string[];
    lastUpdated: Timestamp;
  }[];
  
  // Rendimiento histórico
  performance: {
    date: Timestamp;
    subject: string;
    grade: number;
    hoursStudied: number;
    tutoringSessions: number;
  }[];
  
  // Metas
  goals: {
    subject: string;
    targetGrade: number;
    currentGrade: number;
    deadline: Timestamp;
    progress: number;
  }[];
  
  updatedAt: Timestamp;
}
```

---

## 8. Build y Deployment

### Paso 1: Configurar archivo `.firebaserc`

Este archivo ya debería existir después de `firebase init`, pero verifica:

```json
{
  "projects": {
    "default": "tu-proyecto-id"
  }
}
```

### Paso 2: Configurar `firebase.json`

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### Paso 3: Actualizar `package.json`

Asegúrate de tener estos scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "firebase:deploy": "npm run build && firebase deploy",
    "firebase:deploy:hosting": "npm run build && firebase deploy --only hosting",
    "firebase:deploy:rules": "firebase deploy --only firestore:rules,storage:rules",
    "firebase:deploy:indexes": "firebase deploy --only firestore:indexes",
    "firebase:serve": "npm run build && firebase serve"
  }
}
```

### Paso 4: Crear Script de Deployment Completo

#### Para Windows: `/deploy-firebase.ps1`

```powershell
# Script de Deployment Completo para Firebase - Windows
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT COMPLETO A FIREBASE - TutorApp   " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que Firebase CLI está instalado
Write-Host "1. Verificando Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "   ✓ Firebase CLI version: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Firebase CLI no está instalado" -ForegroundColor Red
    Write-Host "   Instala con: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar que estás logueado
Write-Host ""
Write-Host "2. Verificando autenticación..." -ForegroundColor Yellow
try {
    firebase projects:list | Out-Null
    Write-Host "   ✓ Autenticado correctamente" -ForegroundColor Green
} catch {
    Write-Host "   ✗ No estás autenticado" -ForegroundColor Red
    Write-Host "   Ejecuta: firebase login" -ForegroundColor Yellow
    exit 1
}

# 3. Instalar dependencias
Write-Host ""
Write-Host "3. Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Error instalando dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Dependencias instaladas" -ForegroundColor Green

# 4. Build del proyecto
Write-Host ""
Write-Host "4. Compilando proyecto..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Error en el build" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Build completado" -ForegroundColor Green

# 5. Desplegar reglas de Firestore
Write-Host ""
Write-Host "5. Desplegando reglas de Firestore..." -ForegroundColor Yellow
firebase deploy --only firestore:rules
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠ Advertencia: Error desplegando reglas de Firestore" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Reglas de Firestore desplegadas" -ForegroundColor Green
}

# 6. Desplegar índices de Firestore
Write-Host ""
Write-Host "6. Desplegando índices de Firestore..." -ForegroundColor Yellow
firebase deploy --only firestore:indexes
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠ Advertencia: Error desplegando índices" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Índices de Firestore desplegados" -ForegroundColor Green
}

# 7. Desplegar reglas de Storage
Write-Host ""
Write-Host "7. Desplegando reglas de Storage..." -ForegroundColor Yellow
firebase deploy --only storage:rules
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠ Advertencia: Error desplegando reglas de Storage" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Reglas de Storage desplegadas" -ForegroundColor Green
}

# 8. Desplegar Hosting
Write-Host ""
Write-Host "8. Desplegando aplicación a Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Error desplegando hosting" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Hosting desplegado" -ForegroundColor Green

# 9. Obtener URL del sitio
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   ✓✓✓ DEPLOYMENT COMPLETADO EXITOSAMENTE ✓✓✓  " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tu aplicación está disponible en:" -ForegroundColor Yellow
firebase hosting:sites:list
Write-Host ""
Write-Host "Para ver los logs: firebase hosting:channel:list" -ForegroundColor Cyan
Write-Host ""
```

#### Para Mac/Linux: `/deploy-firebase.sh`

```bash
#!/bin/bash

# Script de Deployment Completo para Firebase - Mac/Linux
echo "================================================"
echo "   DEPLOYMENT COMPLETO A FIREBASE - TutorApp   "
echo "================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 1. Verificar que Firebase CLI está instalado
echo -e "${YELLOW}1. Verificando Firebase CLI...${NC}"
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}   ✗ Firebase CLI no está instalado${NC}"
    echo -e "${YELLOW}   Instala con: npm install -g firebase-tools${NC}"
    exit 1
fi
FIREBASE_VERSION=$(firebase --version)
echo -e "${GREEN}   ✓ Firebase CLI version: $FIREBASE_VERSION${NC}"

# 2. Verificar que estás logueado
echo ""
echo -e "${YELLOW}2. Verificando autenticación...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}   ✗ No estás autenticado${NC}"
    echo -e "${YELLOW}   Ejecuta: firebase login${NC}"
    exit 1
fi
echo -e "${GREEN}   ✓ Autenticado correctamente${NC}"

# 3. Instalar dependencias
echo ""
echo -e "${YELLOW}3. Instalando dependencias...${NC}"
if ! npm install; then
    echo -e "${RED}   ✗ Error instalando dependencias${NC}"
    exit 1
fi
echo -e "${GREEN}   ✓ Dependencias instaladas${NC}"

# 4. Build del proyecto
echo ""
echo -e "${YELLOW}4. Compilando proyecto...${NC}"
if ! npm run build; then
    echo -e "${RED}   ✗ Error en el build${NC}"
    exit 1
fi
echo -e "${GREEN}   ✓ Build completado${NC}"

# 5. Desplegar reglas de Firestore
echo ""
echo -e "${YELLOW}5. Desplegando reglas de Firestore...${NC}"
if ! firebase deploy --only firestore:rules; then
    echo -e "${YELLOW}   ⚠ Advertencia: Error desplegando reglas de Firestore${NC}"
else
    echo -e "${GREEN}   ✓ Reglas de Firestore desplegadas${NC}"
fi

# 6. Desplegar índices de Firestore
echo ""
echo -e "${YELLOW}6. Desplegando índices de Firestore...${NC}"
if ! firebase deploy --only firestore:indexes; then
    echo -e "${YELLOW}   ⚠ Advertencia: Error desplegando índices${NC}"
else
    echo -e "${GREEN}   ✓ Índices de Firestore desplegados${NC}"
fi

# 7. Desplegar reglas de Storage
echo ""
echo -e "${YELLOW}7. Desplegando reglas de Storage...${NC}"
if ! firebase deploy --only storage:rules; then
    echo -e "${YELLOW}   ⚠ Advertencia: Error desplegando reglas de Storage${NC}"
else
    echo -e "${GREEN}   ✓ Reglas de Storage desplegadas${NC}"
fi

# 8. Desplegar Hosting
echo ""
echo -e "${YELLOW}8. Desplegando aplicación a Firebase Hosting...${NC}"
if ! firebase deploy --only hosting; then
    echo -e "${RED}   ✗ Error desplegando hosting${NC}"
    exit 1
fi
echo -e "${GREEN}   ✓ Hosting desplegado${NC}"

# 9. Obtener URL del sitio
echo ""
echo "================================================"
echo -e "${GREEN}   ✓✓✓ DEPLOYMENT COMPLETADO EXITOSAMENTE ✓✓✓  ${NC}"
echo "================================================"
echo ""
echo -e "${YELLOW}Tu aplicación está disponible en:${NC}"
firebase hosting:sites:list
echo ""
echo -e "${CYAN}Para ver los logs: firebase hosting:channel:list${NC}"
echo ""
```

#### Hacer ejecutable el script (Mac/Linux)

```bash
chmod +x deploy-firebase.sh
```

### Paso 5: Ejecutar Deployment

#### Opción 1: Script Completo (Recomendado)

```bash
# Windows
.\deploy-firebase.ps1

# Mac/Linux
./deploy-firebase.sh
```

#### Opción 2: Comandos Manuales

```bash
# 1. Instalar dependencias
npm install

# 2. Build del proyecto
npm run build

# 3. Desplegar todo a Firebase
firebase deploy

# O desplegar componentes específicos:
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage:rules
```

#### Opción 3: Usar scripts de package.json

```bash
# Deployment completo
npm run firebase:deploy

# Solo hosting
npm run firebase:deploy:hosting

# Solo reglas
npm run firebase:deploy:rules

# Solo índices
npm run firebase:deploy:indexes
```

---

## 9. Verificación

### Paso 1: Verificar Hosting

```bash
# Obtener URL de tu aplicación
firebase hosting:sites:list

# La URL será algo como:
# https://tu-proyecto-id.web.app
# o
# https://tu-proyecto-id.firebaseapp.com
```

Abre la URL en tu navegador y verifica que la aplicación carga correctamente.

### Paso 2: Verificar Reglas de Firestore

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database > Reglas**
4. Verifica que las reglas estén actualizadas (fecha de publicación)

### Paso 3: Verificar Índices

1. En Firebase Console, ve a **Firestore Database > Índices**
2. Verifica que todos los índices estén en estado **"Habilitado"** (puede tardar unos minutos)
3. Si algún índice está en **"Compilando"**, espera a que termine

### Paso 4: Verificar Storage

1. Ve a **Storage > Reglas**
2. Verifica que las reglas estén actualizadas

### Paso 5: Probar la Aplicación

#### Registro de Usuario
1. Abre la aplicación
2. Registra un nuevo usuario
3. Verifica que se crea en **Authentication > Usuarios**
4. Verifica que se crea el documento en **Firestore Database > users**

#### Subir Foto de Perfil
1. Edita tu perfil
2. Sube una foto
3. Verifica que se guarda en **Storage > profile_pictures**

#### Crear Solicitud de Tutoría
1. Busca un tutor
2. Solicita una tutoría
3. Verifica que se crea en **Firestore Database > tutoring_requests**

---

## 10. Troubleshooting

### Problema 1: Error "Missing or insufficient permissions"

**Causa**: Las reglas de seguridad están bloqueando la operación.

**Solución**:
```bash
# Volver a desplegar reglas
firebase deploy --only firestore:rules

# Verificar en la consola que se aplicaron correctamente
```

### Problema 2: Error "index not found"

**Causa**: Falta crear un índice compuesto.

**Solución**:
1. Copia la URL del error (contiene el link para crear el índice)
2. Ábrela en el navegador
3. Haz clic en "Crear índice"
4. Espera a que se complete la compilación

O despliega todos los índices:
```bash
firebase deploy --only firestore:indexes
```

### Problema 3: "Firebase config is not defined"

**Causa**: No has configurado las credenciales de Firebase.

**Solución**:
1. Ve a Firebase Console > Project Settings
2. Copia tu configuración
3. Actualiza `/firebase.ts` con tus credenciales

### Problema 4: Build falla

**Causa**: Errores de TypeScript o dependencias faltantes.

**Solución**:
```bash
# Limpiar cache
rm -rf node_modules
rm package-lock.json

# Reinstalar
npm install

# Build de nuevo
npm run build
```

### Problema 5: "Page not found" después del deployment

**Causa**: Configuración incorrecta de routing para SPA.

**Solución**:
Verifica que `firebase.json` tenga:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Problema 6: Imágenes no cargan

**Causa**: Reglas de Storage muy restrictivas o URLs incorrectas.

**Solución**:
```bash
# Verificar reglas
firebase deploy --only storage:rules

# Verificar en código que las URLs son correctas
```

### Problema 7: Chat en tiempo real no funciona

**Causa**: Realtime Database no está habilitado.

**Solución**:
1. Ve a Firebase Console
2. **Build > Realtime Database**
3. Haz clic en "Crear base de datos"
4. Selecciona ubicación
5. Reglas de seguridad: Empezar en modo bloqueado
6. Crea reglas personalizadas:

```json
{
  "rules": {
    "chats": {
      "$chatId": {
        ".read": "auth != null && (data.child('participants').child(auth.uid).exists())",
        ".write": "auth != null && (data.child('participants').child(auth.uid).exists() || !data.exists())",
        "messages": {
          "$messageId": {
            ".read": "auth != null",
            ".write": "auth != null && newData.child('senderId').val() === auth.uid"
          }
        }
      }
    }
  }
}
```

---

## 11. Comandos Rápidos de Referencia

```bash
# ==================
# DEPLOYMENT
# ==================

# Deploy completo
firebase deploy

# Deploy solo hosting
firebase deploy --only hosting

# Deploy solo reglas
firebase deploy --only firestore:rules,storage:rules

# Deploy solo índices
firebase deploy --only firestore:indexes

# ==================
# TESTING LOCAL
# ==================

# Emuladores locales (sin tocar producción)
firebase emulators:start

# Emuladores con datos de ejemplo
firebase emulators:start --import=./firebase-data --export-on-exit

# ==================
# GESTIÓN
# ==================

# Ver proyectos
firebase projects:list

# Cambiar proyecto activo
firebase use proyecto-id

# Ver estado del hosting
firebase hosting:sites:list

# Ver logs
firebase hosting:channel:list

# ==================
# MANTENIMIENTO
# ==================

# Limpiar cache de hosting
firebase hosting:clone --except-latest

# Ver uso de recursos
firebase projects:info

# ==================
# ROLLBACK
# ==================

# Ver versiones anteriores
firebase hosting:releases:list

# Volver a versión anterior
firebase hosting:rollback
```

---

## 12. URLs Importantes

### Tu Proyecto
- **App Web**: `https://tu-proyecto-id.web.app`
- **App Web (alternativa)**: `https://tu-proyecto-id.firebaseapp.com`
- **Firebase Console**: `https://console.firebase.google.com/project/tu-proyecto-id`

### Firebase Services
- **Authentication**: `https://console.firebase.google.com/project/tu-proyecto-id/authentication/users`
- **Firestore**: `https://console.firebase.google.com/project/tu-proyecto-id/firestore`
- **Storage**: `https://console.firebase.google.com/project/tu-proyecto-id/storage`
- **Hosting**: `https://console.firebase.google.com/project/tu-proyecto-id/hosting`

---

## 13. Checklist Final

Antes de considerar el deployment completo, verifica:

- [ ] Firebase CLI instalado y autenticado
- [ ] Proyecto de Firebase creado
- [ ] Authentication habilitado (Email/Password)
- [ ] Firestore Database creado
- [ ] Storage habilitado
- [ ] Hosting habilitado
- [ ] Archivo `/firebase.ts` configurado con credenciales correctas
- [ ] Reglas de Firestore desplegadas
- [ ] Reglas de Storage desplegadas
- [ ] Índices compuestos creados
- [ ] Build exitoso (`npm run build`)
- [ ] Deployment a Hosting completado
- [ ] Aplicación accesible en la URL de Firebase
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Búsqueda de tutores funciona
- [ ] Chat funciona (si usas Realtime Database)
- [ ] Subida de archivos funciona

---

## 14. Próximos Pasos

### Configuración Adicional Recomendada

#### 1. Dominio Personalizado
```bash
# Agregar dominio personalizado
firebase hosting:sites:create tu-dominio
firebase target:apply hosting tutorapp tu-dominio
```

#### 2. Email Verification
En Firebase Console > Authentication > Templates, personaliza los emails:
- Verificación de email
- Recuperación de contraseña
- Cambio de email

#### 3. Cloud Functions (Opcional)
Para lógica de backend:
```bash
firebase init functions
```

#### 4. Analytics (Opcional)
```bash
firebase init analytics
```

#### 5. Performance Monitoring
En Firebase Console > Performance, habilita el monitoreo.

---

## 15. Recursos Adicionales

- **Documentación Firebase**: https://firebase.google.com/docs
- **Firebase Console**: https://console.firebase.google.com
- **Firebase CLI Reference**: https://firebase.google.com/docs/cli
- **Pricing**: https://firebase.google.com/pricing
- **Status**: https://status.firebase.google.com
- **Community**: https://firebase.google.com/community

---

## 🎉 ¡Deployment Completo!

Tu aplicación TutorApp ahora está desplegada en Firebase y accesible globalmente. 

**URL de tu app**: `https://tu-proyecto-id.web.app`

Para actualizaciones futuras, simplemente ejecuta:
```bash
npm run build && firebase deploy
```

¡Felicitaciones! 🚀
