# 🔥 Configuración de Firebase para TutorApp

## 📋 Pasos para configurar Firebase

### 1. Crear proyecto en Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombra tu proyecto (ej: "tutorapp-2024")
4. Acepta los términos y configura Analytics (opcional)

### 2. Configurar Firebase Realtime Database
1. En la consola de Firebase, ve a **"Realtime Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (para desarrollo)
4. Elige la ubicación más cercana a tu región

### 3. Configurar Authentication
1. Ve a **"Authentication"** > **"Sign-in method"**
2. Habilita **"Correo electrónico/contraseña"**
3. Opcionalmente habilita otros proveedores (Google, Facebook, etc.)

### 4. Configurar reglas de seguridad de Realtime Database

Reemplaza las reglas por defecto con estas reglas de seguridad:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    },
    "requests": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$requestId": {
        ".validate": "newData.hasChildren(['studentId', 'tutorId', 'subject', 'status'])"
      }
    },
    "chats": {
      "$chatId": {
        ".read": "auth != null && (data.child('participants').val().indexOf(auth.uid) >= 0 || newData.child('participants').val().indexOf(auth.uid) >= 0)",
        ".write": "auth != null && (data.child('participants').val().indexOf(auth.uid) >= 0 || newData.child('participants').val().indexOf(auth.uid) >= 0)"
      }
    },
    "subjects": {
      ".read": true,
      ".write": false
    },
    "reviews": {
      ".read": true,
      ".write": "auth != null",
      "$reviewId": {
        ".validate": "newData.hasChildren(['studentId', 'tutorId', 'rating', 'requestId'])"
      }
    }
  }
}
```

### 5. Obtener configuración del proyecto
1. Ve a **"Configuración del proyecto"** (ícono de engranaje)
2. En la pestaña **"General"**, busca **"Tus apps"**
3. Haz clic en **"Añadir app"** y selecciona **"Web"**
4. Registra tu app con un nombre
5. Copia la configuración que aparece

### 6. Configurar las credenciales en la app

Reemplaza las credenciales en `/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com/",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

## 🗄️ Estructura de datos en Firebase

La aplicación creará automáticamente esta estructura:

```
tu-proyecto-rtdb/
├── users/
│   └── {userId}/
│       ├── id: string
│       ├── email: string
│       ├── name: string
│       ├── currentMode: "student" | "tutor"
│       ├── subjects: string[]
│       ├── preferredSubjects: string[]
│       ├── hourlyRate: number
│       ├── rating: number
│       ├── totalReviews: number
│       ├── availability: boolean
│       ├── experience: string
│       ├── education: string
│       ├── phone: string
│       ├── location: string
│       ├── bio: string
│       ├── avatar: string
│       ├── createdAt: string (ISO)
│       └── updatedAt: string (ISO)
│
├── requests/
│   └── {requestId}/
│       ├── id: string
│       ├── studentId: string
│       ├── tutorId: string
│       ├── subject: string
│       ├── description: string
│       ├── isImmediate: boolean
│       ├── scheduledTime: string (ISO) | null
│       ├── status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
│       ├── location: string
│       ├── hourlyRate: number
│       ├── duration: number
│       ├── createdAt: string (ISO)
│       └── updatedAt: string (ISO)
│
├── chats/
│   └── {userId1_userId2}/
│       ├── id: string
│       ├── participants: string[]
│       ├── lastMessage: ChatMessage | null
│       ├── updatedAt: string (ISO)
│       └── messages/
│           └── {messageId}/
│               ├── id: string
│               ├── senderId: string
│               ├── receiverId: string
│               ├── content: string
│               ├── timestamp: string (ISO)
│               ├── read: boolean
│               └── requestId: string | null
│
├── subjects/
│   └── {subjectId}/
│       ├── id: string
│       ├── name: string
│       └── category: string
│
└── reviews/
    └── {reviewId}/
        ├── id: string
        ├── requestId: string
        ├── studentId: string
        ├── tutorId: string
        ├── rating: number (1-5)
        ├── comment: string
        └── createdAt: string (ISO)
```

## 🚀 Características habilitadas con Firebase

### ✅ **Autenticación Real**
- Registro y login con email/password
- Recuperación de contraseña
- Sesiones persistentes
- Validación de usuarios

### ✅ **Base de Datos en Tiempo Real**
- Actualizaciones automáticas de solicitudes
- Chat en tiempo real
- Sincronización entre dispositivos
- Persistencia offline

### ✅ **Seguridad**
- Reglas de base de datos configuradas
- Usuarios solo pueden editar sus propios datos
- Validación de datos en el servidor
- Autenticación requerida para operaciones sensibles

### ✅ **Escalabilidad**
- Base de datos NoSQL escalable
- Estructura optimizada para consultas
- Índices automáticos para búsquedas rápidas

## 🔧 Comandos útiles

### Para instalar dependencias de Firebase:
```bash
npm install firebase
```

### Para desarrollo local:
```bash
npm start
```

## 🐛 Troubleshooting

### Error de CORS
Si tienes problemas de CORS, añade tu dominio en Firebase Console > Authentication > Settings > Authorized domains

### Error de permisos
Verifica que las reglas de seguridad estén configuradas correctamente y que el usuario esté autenticado

### Base de datos vacía
La primera vez que uses la app, se crearán automáticamente las materias por defecto y estructura básica

## 📱 Testing

### Cuentas de prueba
- Puedes crear cuentas de prueba directamente en la app
- No hay restricciones en modo desarrollo
- Los datos se guardan realmente en Firebase

### Datos de prueba
- La app creará automáticamente materias por defecto
- Puedes crear usuarios de prueba con diferentes roles
- Todas las funcionalidades están habilitadas

---

¡Tu aplicación de tutorías ahora está completamente integrada con Firebase! 🎉