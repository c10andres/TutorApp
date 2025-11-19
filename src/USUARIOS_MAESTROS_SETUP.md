# Configuración de Usuarios Maestros

## Descripción
Los usuarios maestros son cuentas especiales con acceso a opciones de prueba y desarrollo que están ocultas para usuarios regulares.

## Usuarios Maestros Disponibles

### 1. CarlosAdminEstudiante@gmail.com
- **Contraseña:** 98765
- **Enfoque:** Funcionalidades de estudiante
- **Modo por defecto:** Estudiante
- **Materias de interés:** Matemáticas, Física, Programación

### 2. CarlosAdminTutor@gmail.com
- **Contraseña:** 98765
- **Enfoque:** Funcionalidades de tutor
- **Modo por defecto:** Tutor
- **Materias que enseña:** Matemáticas, Física, Programación
- **Tarifa:** $50,000 COP/hora
- **Rating:** 4.8/5 con 25 reseñas

## Funcionalidades Especiales para Usuarios Maestros

### En la Página Principal (HomePage)
- **Panel de Opciones de Prueba** (`TestUserOptions`): 
  - Creación de solicitudes de prueba
  - Opciones de notificaciones de prueba
  - Panel de debug para estadísticas

### En la Página de Perfil (ProfilePage)
- **Panel de Usuario Maestro** (`MasterUserInfo`):
  - Información de permisos especiales
  - Lista de usuarios maestros disponibles
  - Indicador de cuenta activa

### Componentes Debug
- **Panel de Estadísticas de Debug** (`DebugStatsPanel`):
  - Contadores de usuarios totales
  - Contadores de solicitudes activas
  - Contadores de sesiones de chat
  - Botones para refrescar estadísticas

## Configuración Automática

### Al Registrarse
Cuando un usuario se registra con uno de los emails maestros, automáticamente:
1. Se marca como `isTestUser: true`
2. Se configuran datos por defecto apropiados según el rol
3. Se obtienen permisos especiales

### Detección de Usuarios Maestros
El sistema detecta usuarios maestros a través de:
- Campo `isTestUser` en la base de datos
- Función `isTestUserEmail()` que verifica emails específicos
- Función `isTestUser()` en el contexto de autenticación

## Cómo Usar

### Para Pruebas como Estudiante
1. Registrarse o iniciar sesión con `CarlosAdminEstudiante@gmail.com`
2. Usar contraseña `98765`
3. Acceder a opciones de prueba en la página principal
4. Ver panel de usuario maestro en el perfil

### Para Pruebas como Tutor
1. Registrarse o iniciar sesión con `CarlosAdminTutor@gmail.com`
2. Usar contraseña `98765`
3. Cuenta ya configurada como tutor con datos de prueba
4. Acceder a todas las funcionalidades de tutor

## Seguridad

- Las opciones de prueba están completamente ocultas para usuarios regulares
- Solo los emails específicos pueden obtener permisos de maestro
- No hay forma de escalar privilegios desde una cuenta regular
- Los usuarios maestros no afectan la funcionalidad para usuarios normales

## Solución de Problemas

### Si no aparecen las opciones de prueba:
1. Verificar que estés usando el email exacto: `CarlosAdminEstudiante@gmail.com` o `CarlosAdminTutor@gmail.com`
2. Verificar que la contraseña sea exactamente: `98765`
3. Cerrar sesión y volver a iniciar sesión
4. Verificar en el perfil que aparezca el panel de usuario maestro

### Si hay errores de permisos:
- Los usuarios maestros ya no se crean automáticamente al inicializar la aplicación
- Se crean automáticamente cuando alguien se registra con el email correcto
- Esto evita errores de permisos en Firebase

## Notas Técnicas

- Los usuarios maestros se identifican por el campo `isTestUser: true`
- La detección se hace tanto por email como por el campo en la base de datos
- Los componentes de prueba se renderizan condicionalmente usando `isTestUser()`
- No se requiere configuración manual adicional