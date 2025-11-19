# Reglas de Firebase para Entorno de Pruebas

## Resumen
Las reglas de Firebase han sido optimizadas para permitir máxima flexibilidad en el entorno de desarrollo y pruebas. Esto permite el cambio libre entre roles de estudiante y tutor sin restricciones restrictivas.

## Configuración Actual

### Características Principales
- **Acceso completo para usuarios autenticados**: Cualquier usuario autenticado puede leer y escribir datos
- **Cambio libre de roles**: No hay restricciones para cambiar entre modo estudiante y tutor
- **Validaciones mínimas**: Solo se validan campos esenciales para mantener la integridad básica de datos
- **Acceso permisivo a todos los nodos**: Chats, solicitudes, pagos, etc. son completamente accesibles

### Estructura de Reglas

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      "$userId": {
        ".write": "auth != null && (auth.uid == $userId || auth != null)",
        ".validate": "newData.hasChildren(['id', 'email', 'name', 'currentMode'])"
      }
    },
    "tutoring_requests": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    // ... otras colecciones con acceso permisivo
  }
}
```

## Mejoras Implementadas

### 1. Servicio de Autenticación
- **Inicialización robusta de campos**: Cuando un usuario cambia a modo tutor, se inicializan automáticamente todos los campos requeridos
- **Manejo mejorado de errores**: Mensajes de error más descriptivos y manejo de excepciones
- **Notificación automática**: Los listeners se actualizan automáticamente cuando cambia el modo

### 2. Cambio de Roles
```typescript
// El cambio de modo ahora incluye:
if (mode === 'tutor') {
  // Inicializar campos requeridos si no existen
  if (!currentUserData.subjects) updates.subjects = [];
  if (!currentUserData.hourlyRate) updates.hourlyRate = 0;
  if (!currentUserData.experience) updates.experience = '';
  if (!currentUserData.availability) updates.availability = false;
  // etc...
}
```

### 3. Contexto de Autenticación
- **Gestión optimizada del loading**: No bloquea la UI durante el cambio de modo
- **Propagación automática de cambios**: Los cambios se reflejan inmediatamente en la UI

## Validaciones Actuales

### Usuarios
- **Campos obligatorios**: `id`, `email`, `name`, `currentMode`
- **Acceso**: Cualquier usuario autenticado puede leer, solo el propietario puede escribir (aunque en pruebas se permite escritura más amplia)

### Otras Colecciones
- **Acceso completo**: Lectura y escritura para cualquier usuario autenticado
- **Sin validaciones restrictivas**: Para facilitar las pruebas

## Consideraciones de Seguridad

⚠️ **IMPORTANTE**: Estas reglas son SOLO para entorno de desarrollo/pruebas.

### Para Producción se Recomienda:
1. **Restricciones de acceso por usuario**: Solo permitir acceso a datos propios
2. **Validaciones estrictas**: Validar todos los campos y tipos de datos
3. **Permisos granulares**: Diferentes niveles de acceso según el rol
4. **Auditoría de cambios**: Registro de modificaciones importantes
5. **Limitaciones de escritura**: Prevenir modificaciones no autorizadas

### Ejemplo de Reglas de Producción:
```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null && (auth.uid == $userId || root.child('users').child(auth.uid).child('currentMode').val() == 'admin')",
        ".write": "auth != null && auth.uid == $userId",
        ".validate": "newData.hasChildren(['id', 'email', 'name', 'currentMode']) && newData.child('id').val() == $userId"
      }
    }
  }
}
```

## Troubleshooting

### Problemas Comunes
1. **Error de permisos**: Verificar que el usuario esté autenticado
2. **Campos faltantes**: Los campos requeridos se inicializan automáticamente
3. **Cambio de modo lento**: Los cambios son inmediatos, verificar la conexión a internet

### Verificación de Reglas
```bash
# Simular reglas de Firebase
firebase database:profile --input=./test-data.json
```

### Debug en Consola
```javascript
// Ver reglas actuales en Firebase Console
// Database > Rules > Ver reglas activas
```

## Actualización a Producción

Cuando esté listo para producción:

1. **Revisar y restringir reglas**
2. **Implementar validaciones estrictas**
3. **Configurar índices de seguridad**
4. **Habilitar auditoría**
5. **Probar con datos reales**

---

*Última actualización: Diciembre 2024*
*Versión: Entorno de Pruebas v1.0*