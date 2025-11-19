# 🔥 Configuración de Reglas de Firebase - UDConecta

## ⚠️ **IMPORTANTE: Reglas Optimizadas para Cambio de Roles**

Para que UDConecta funcione correctamente con el sistema de roles duales (estudiante ↔ tutor), debes configurar estas reglas optimizadas.

## 📋 **Pasos para Configurar las Nuevas Reglas**

### 1. **Ve a Firebase Console**
Abre tu [Firebase Console](https://console.firebase.google.com/project/udconecta-4bfff/database/udconecta-4bfff-default-rtdb/rules)

### 2. **Actualiza las Reglas de Seguridad**
En la pestaña **"Rules"**, reemplaza todo el contenido con:

```json
{
  "rules": {
    // Reglas para usuarios - Permiten cambio libre entre roles
    "users": {
      ".read": "auth != null",
      ".indexOn": ["currentMode", "availability", "subjects"],
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid",
        ".validate": "newData.hasChildren(['id', 'email', 'name', 'currentMode']) && newData.child('id').val() === $uid"
      }
    },

    // Reglas para solicitudes de tutoría
    "requests": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["studentId", "tutorId", "status", "createdAt"],
      "$requestId": {
        ".read": "auth != null",
        ".write": "auth != null && (data.child('studentId').val() === auth.uid || data.child('tutorId').val() === auth.uid || !data.exists())",
        ".validate": "newData.hasChildren(['studentId', 'tutorId', 'subject', 'status', 'createdAt'])"
      }
    },

    // Reglas para chat - Más permisivas para facilitar comunicación
    "chats": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["participants", "updatedAt"],
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "participants": {
          ".read": "auth != null",
          ".write": "auth != null"
        },
        "messages": {
          ".read": "auth != null",
          ".write": "auth != null",
          ".indexOn": ["timestamp", "senderId"],
          "$messageId": {
            ".validate": "newData.hasChildren(['senderId', 'content', 'timestamp'])"
          }
        }
      }
    },

    // Reglas para materias - Solo lectura para todos
    "subjects": {
      ".read": "auth != null",
      ".write": false
    },

    // Reglas para reseñas - Permisivas para estudiantes y tutores
    "reviews": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["tutorId", "studentId", "requestId", "createdAt"],
      "$reviewId": {
        ".read": "auth != null",
        ".write": "auth != null && (newData.child('studentId').val() === auth.uid || !data.exists())",
        ".validate": "newData.hasChildren(['studentId', 'tutorId', 'rating', 'requestId', 'createdAt'])"
      }
    },

    // Reglas para notificaciones
    "notifications": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["userId", "createdAt", "read"],
      "$notificationId": {
        ".read": "auth != null && data.child('userId').val() === auth.uid",
        ".write": "auth != null && (newData.child('userId').val() === auth.uid || !data.exists())"
      }
    },

    // Reglas para datos de la aplicación (materias predefinidas, etc.)
    "app_data": {
      "subjects": {
        ".read": "auth != null",
        ".write": false
      },
      "categories": {
        ".read": "auth != null",
        ".write": false
      }
    }
  }
}
```

### 3. **Haz Click en "Publish"**
Asegúrate de hacer click en **"Publish"** para aplicar los cambios.

## 🚀 **¿Qué Mejoras Incluyen Estas Reglas?**

### **✅ Cambio de Roles Sin Restricciones:**
- **Lectura global de usuarios**: Permite ver perfiles de otros usuarios (necesario para buscar tutores)
- **Cambio de currentMode**: Los usuarios pueden alternar entre estudiante/tutor libremente
- **Validación flexible**: Solo requiere campos esenciales

### **✅ Búsqueda Optimizada:**
- **Índices por currentMode**: Búsquedas rápidas de tutores disponibles
- **Índices por availability**: Filtros por disponibilidad en tiempo real
- **Índices por subjects**: Búsquedas por materias específicas

### **✅ Chat Mejorado:**
- **Reglas permisivas**: Facilita la comunicación entre estudiantes y tutores
- **Acceso bidireccional**: Ambos roles pueden iniciar conversaciones
- **Índices optimizados**: Mensajes ordenados por timestamp

### **✅ Gestión de Solicitudes:**
- **Acceso bilateral**: Estudiantes y tutores pueden gestionar solicitudes
- **Estados dinámicos**: Cambios de estado fluidos
- **Permisos flexibles**: Permite aceptar/rechazar solicitudes

## 🔍 **Índices Optimizados**

| Tabla | Campo | Propósito |
|-------|-------|-----------|
| `users` | `currentMode` | Filtrar por tipo de usuario |
| `users` | `availability` | Encontrar tutores disponibles |
| `users` | `subjects` | Buscar por materias |
| `requests` | `studentId` | Solicitudes por estudiante |
| `requests` | `tutorId` | Solicitudes por tutor |
| `requests` | `status` | Filtrar por estado |
| `requests` | `createdAt` | Ordenar por fecha |
| `chats` | `participants` | Chats del usuario |
| `chats` | `updatedAt` | Ordenar conversaciones |
| `reviews` | `tutorId` | Reseñas por tutor |

## ✅ **Verificación**

Después de aplicar las reglas:

1. **El cambio de roles funcionará instantáneamente** 🔄
2. **La búsqueda de tutores será más rápida** 🚀
3. **No habrá más errores de permisos** ✅
4. **El chat funcionará fluidamente** 💬

## 🚨 **Troubleshooting**

Si sigues viendo errores:

1. **Verifica la sintaxis JSON** en Firebase Console
2. **Espera 1-2 minutos** para que se propaguen los cambios
3. **Recarga la aplicación** para limpiar el cache
4. **Revisa la consola del navegador** para errores específicos

## 🎯 **Beneficios de las Nuevas Reglas**

- ✅ **Roles duales sin restricciones**
- ✅ **Búsquedas optimizadas**
- ✅ **Chat fluido entre roles**
- ✅ **Gestión flexible de solicitudes**
- ✅ **Performance mejorado**
- ✅ **Escalabilidad preparada**

¡Con estas reglas, UDConecta funcionará perfectamente para el sistema de roles duales! 🚀