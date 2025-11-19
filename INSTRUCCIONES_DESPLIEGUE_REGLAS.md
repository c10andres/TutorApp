# 🚀 INSTRUCCIONES PARA DESPLEGAR REGLAS DE FIRESTORE

## ⚠️ PROBLEMA ACTUAL
El error "Missing or insufficient permissions" ocurre porque las reglas de Firestore no están desplegadas en Firebase.

## ✅ SOLUCIÓN: Desplegar las Reglas

### Método 1: Desde Firebase Console (RECOMENDADO - Más Fácil)

1. **Abre Firebase Console**
   - Ve a: https://console.firebase.google.com
   - Selecciona tu proyecto: **udconecta-4bfff**

2. **Ve a Firestore Database**
   - En el menú lateral izquierdo, haz clic en **"Firestore Database"**
   - Haz clic en la pestaña **"Rules"** (Reglas)

3. **Copia las Reglas**
   - Abre el archivo `firestore.rules` en tu proyecto
   - Selecciona TODO el contenido (Ctrl+A / Cmd+A)
   - Copia (Ctrl+C / Cmd+C)

4. **Pega en Firebase Console**
   - En la consola de Firebase, borra todo el contenido actual
   - Pega las reglas (Ctrl+V / Cmd+V)

5. **Publica las Reglas**
   - Haz clic en el botón **"Publicar"** (Publish)
   - Espera a que aparezca el mensaje "Rules published successfully"

6. **Verifica**
   - Deberías ver la sección `universityDocs` en las reglas
   - Recarga tu aplicación

### Método 2: Desde Terminal (Si tienes Firebase CLI)

```bash
# Asegúrate de estar en el directorio del proyecto
cd "C:\Users\carlo\Downloads\TutorApp (18)"

# Desplegar solo las reglas de Firestore
firebase deploy --only firestore:rules
```

## 📋 Reglas que se Desplegarán

Las reglas incluyen:
- ✅ Lectura: Cualquier usuario autenticado puede leer documentos
- ✅ Creación: Cualquier usuario autenticado puede subir documentos
- ✅ Actualización/Eliminación: Solo el usuario que subió el documento

## 🔍 Verificar que Funcionó

Después de desplegar, en la consola del navegador deberías ver:
- ✅ `📚 [getAllDocuments] Intentando obtener documentos...`
- ✅ `✅ [getAllDocuments] Usuario autenticado: [tu-uid]`
- ✅ `✅ [getAllDocuments] Se obtuvieron X documentos`

**NO deberías ver:**
- ❌ `permission-denied`
- ❌ `Missing or insufficient permissions`

## ⚡ Si Aún No Funciona

1. Verifica que estés autenticado (inicia sesión)
2. Espera 1-2 minutos después de desplegar (puede tardar en propagarse)
3. Recarga la página completamente (Ctrl+F5)
4. Verifica en Firebase Console que las reglas se guardaron correctamente

