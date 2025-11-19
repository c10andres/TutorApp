# 🔧 Solución para Firebase Storage

## ⚠️ Problema Actual
Firebase Storage no está habilitado en el proyecto, lo que causa errores de CORS al intentar subir documentos.

## ✅ Solución Paso a Paso

### Paso 1: Habilitar Firebase Storage

1. **Abre Firebase Console**
   - Ve a: https://console.firebase.google.com/project/udconecta-4bfff/storage

2. **Haz clic en "Get Started" o "Comenzar"**

3. **Configura Storage**
   - Selecciona: **"Start in production mode"** (Comenzar en modo producción)
   - **Ubicación**: Selecciona una ubicación cercana (recomendado: `southamerica-east1` para Colombia)
   - Haz clic en **"Done"** o **"Listo"**

### Paso 2: Desplegar Reglas de Storage

Después de habilitar Storage, ejecuta en la terminal:

```powershell
firebase deploy --only storage:rules
```

### Paso 3: Configurar CORS (Opcional pero Recomendado)

Si aún tienes problemas de CORS después de habilitar Storage:

1. **Instala gsutil** (si no lo tienes):
   ```powershell
   # Descarga e instala Google Cloud SDK desde:
   # https://cloud.google.com/sdk/docs/install
   ```

2. **Aplica configuración CORS**:
   ```powershell
   gsutil cors set cors.json gs://udconecta-4bfff.appspot.com
   ```

3. **Verifica**:
   ```powershell
   gsutil cors get gs://udconecta-4bfff.appspot.com
   ```

## 🚀 Solución Rápida (Script Automático)

Ejecuta el script:

```powershell
.\habilitar-storage.ps1
```

Este script te guiará paso a paso.

## ✅ Verificación

Después de completar los pasos:

1. Recarga la aplicación
2. Intenta subir un documento PDF
3. Deberías ver en la consola: `✅ [uploadDocument] Archivo subido a Storage`

## 📝 Nota

El error de CORS desaparecerá una vez que:
- ✅ Firebase Storage esté habilitado
- ✅ Las reglas de Storage estén desplegadas
- ✅ (Opcional) CORS esté configurado

