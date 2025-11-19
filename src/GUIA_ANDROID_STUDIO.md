# 📱 GUÍA COMPLETA - ABRIR TUTORAPP EN ANDROID STUDIO

## 🎯 OBJETIVO
Convertir tu TutorApp en una aplicación Android y abrirla en Android Studio.

---

## 📋 REQUISITOS PREVIOS

### 1. Software Necesario:

✅ **Android Studio** - [Descargar aquí](https://developer.android.com/studio)
- Versión: Latest stable
- Componentes necesarios:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (AVD)

✅ **Java JDK 17+** - [Descargar aquí](https://www.oracle.com/java/technologies/downloads/)
- Verifica con: `java -version`

✅ **Node.js 18+** (ya lo tienes)
- Verifica con: `node -v`

✅ **Capacitor CLI** (se instalará automáticamente)

---

## 🚀 PASO A PASO COMPLETO

### **PASO 1: VERIFICAR INSTALACIÓN DE ANDROID STUDIO**

1. **Instala Android Studio** si no lo tienes:
   - Descarga desde: https://developer.android.com/studio
   - Sigue el instalador
   - Durante instalación, marca: "Android Virtual Device"

2. **Configura el SDK de Android:**
   - Abre Android Studio
   - Menú: Tools → SDK Manager
   - En "SDK Platforms", marca:
     - ✅ Android 13.0 (Tiramisu) - API 33
     - ✅ Android 12.0 (S) - API 31
   - En "SDK Tools", marca:
     - ✅ Android SDK Build-Tools
     - ✅ Android SDK Platform-Tools
     - ✅ Android Emulator
   - Click "Apply" y espera a que descargue

3. **Configurar variables de entorno:**

   **Windows:**
   ```powershell
   # Agregar al PATH del sistema
   # Panel de Control → Sistema → Variables de entorno
   
   ANDROID_HOME = C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
   
   Path → Agregar:
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   ```

   **Mac/Linux:**
   ```bash
   # Agregar a ~/.bash_profile o ~/.zshrc
   
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   ```

4. **Verificar instalación:**
   ```bash
   # Debe mostrar la versión
   adb version
   ```

---

### **PASO 2: PREPARAR EL PROYECTO**

1. **Abre VS Code con tu proyecto TutorApp**

2. **Abre la terminal** (Ctrl + `)

3. **Instala las dependencias de Capacitor** (si no están):
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

4. **Verifica que `capacitor.config.ts` existe:**
   ```bash
   # Deberías ver el archivo
   ls capacitor.config.ts
   ```

---

### **PASO 3: CONSTRUIR LA APLICACIÓN WEB**

```bash
# 1. Limpiar build anterior
rm -rf dist

# Windows:
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# 2. Hacer build de producción
npm run build
```

**✅ Deberías ver:**
```
✓ built in XXXXms
dist/index.html               X.XX kB
dist/assets/index-XXXXX.js    XXX.XX kB
dist/assets/index-XXXXX.css   XX.XX kB
```

---

### **PASO 4: AGREGAR PLATAFORMA ANDROID (Solo primera vez)**

```bash
# Si NO existe la carpeta 'android/', ejecuta:
npx cap add android
```

**✅ Deberías ver:**
```
✔ Adding native android project in android in X.XXs
✔ Creating capacitor.config.json in android in X.XXms
✔ Copying web assets from dist to android/app/src/main/assets/public in X.XXms
```

**Si ya existe la carpeta `android/`, SALTA este paso.**

---

### **PASO 5: SINCRONIZAR CON ANDROID**

```bash
# Sincroniza el código web con Android
npx cap sync android
```

**✅ Deberías ver:**
```
✔ Copying web assets from dist to android/app/src/main/assets/public in X.XXms
✔ Copying native bridge in X.XXms
✔ Copying capacitor.config.json in X.XXms
✔ copy android in X.XXms
✔ Updating Android plugins in X.XXms
```

---

### **PASO 6: ABRIR EN ANDROID STUDIO**

```bash
npx cap open android
```

**Esto abrirá Android Studio automáticamente.**

**O manualmente:**
1. Abre Android Studio
2. File → Open
3. Navega a: `TutorApp/android/`
4. Click "OK"

---

### **PASO 7: CONFIGURAR EL PROYECTO EN ANDROID STUDIO**

1. **Primera vez que abres el proyecto:**
   - Android Studio sincronizará automáticamente Gradle
   - Espera a que termine (puede tardar 5-10 minutos)
   - Verás en la parte inferior: "Gradle sync completed"

2. **Si aparece error de Gradle:**
   - File → Sync Project with Gradle Files
   - Espera a que termine

3. **Seleccionar dispositivo:**
   - En la barra superior, verás un dropdown de dispositivos
   - Opciones:
     - **Dispositivo físico** (si conectaste tu teléfono)
     - **Emulador** (si creaste uno)

---

### **PASO 8: CREAR UN EMULADOR (Si no tienes)**

1. **En Android Studio:**
   - Tools → Device Manager
   - Click "Create Device"

2. **Seleccionar hardware:**
   - Categoria: Phone
   - Dispositivo recomendado: Pixel 5 o Pixel 6
   - Click "Next"

3. **Seleccionar imagen del sistema:**
   - Release Name: Tiramisu (API 33) o S (API 31)
   - Click "Download" si no está descargado
   - Click "Next"

4. **Configurar AVD:**
   - AVD Name: Pixel_5_API_33
   - Click "Finish"

---

### **PASO 9: EJECUTAR LA APLICACIÓN**

1. **Selecciona el dispositivo:**
   - En la barra superior, selecciona tu emulador o dispositivo

2. **Click en el botón verde de Play** (▶️) o presiona:
   - **Shift + F10** (Windows/Linux)
   - **Control + R** (Mac)

3. **Espera a que compile y se instale:**
   - Primera vez puede tardar 5-10 minutos
   - Verás el progreso en "Build" en la parte inferior
   - El emulador se iniciará automáticamente
   - La app se instalará y abrirá

---

### **PASO 10: VERIFICAR QUE FUNCIONA**

**✅ Si todo está bien, verás:**
- El emulador Android iniciado
- Tu TutorApp abierta en el emulador
- Página de login con todos los estilos
- Todo funcionando como en el navegador

---

## 🎯 COMANDOS RÁPIDOS - RESUMEN

```bash
# 1. Build web
npm run build

# 2. Sync con Android
npx cap sync android

# 3. Abrir Android Studio
npx cap open android

# 4. (En Android Studio) Click Play ▶️
```

---

## 🔧 SCRIPT AUTOMATIZADO

Crea un script para hacer todo de una vez:

### **Windows (PowerShell):**
```powershell
# Guardar como: build-android.ps1

Write-Host "🔨 Construyendo TutorApp para Android..." -ForegroundColor Cyan

# 1. Limpiar
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# 2. Build
npm run build

# 3. Sync
npx cap sync android

# 4. Abrir Android Studio
npx cap open android

Write-Host "✅ ¡Listo! Android Studio se abrirá ahora." -ForegroundColor Green
Write-Host "Click en el botón Play ▶️ para ejecutar la app" -ForegroundColor Yellow
```

**Ejecutar:**
```powershell
.\build-android.ps1
```

---

### **Mac/Linux:**
```bash
# Guardar como: build-android.sh

#!/bin/bash

echo "🔨 Construyendo TutorApp para Android..."

# 1. Limpiar
rm -rf dist

# 2. Build
npm run build

# 3. Sync
npx cap sync android

# 4. Abrir Android Studio
npx cap open android

echo "✅ ¡Listo! Android Studio se abrirá ahora."
echo "Click en el botón Play ▶️ para ejecutar la app"
```

**Ejecutar:**
```bash
chmod +x build-android.sh
./build-android.sh
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### ❌ "ANDROID_HOME not set"
**Solución:**
```bash
# Windows (PowerShell):
$env:ANDROID_HOME = "C:\Users\TU_USUARIO\AppData\Local\Android\Sdk"

# Mac/Linux:
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### ❌ "adb: command not found"
**Solución:**
1. Abre Android Studio
2. Tools → SDK Manager
3. SDK Tools → Marca "Android SDK Platform-Tools"
4. Click "Apply"

### ❌ "Gradle sync failed"
**Solución:**
1. En Android Studio: File → Invalidate Caches → Invalidate and Restart
2. Espera a que reinicie
3. File → Sync Project with Gradle Files

### ❌ "SDK location not found"
**Solución:**
1. Crea archivo `android/local.properties`
2. Agrega:
   ```
   sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
   ```
   (En Mac/Linux: `/Users/TU_USUARIO/Library/Android/sdk`)

### ❌ Pantalla blanca en el emulador
**Solución:**
```bash
# Reconstruir todo
npm run build
npx cap sync android
# Luego en Android Studio: Build → Clean Project
# Build → Rebuild Project
```

### ❌ "Capacitor not found"
**Solución:**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap sync android
```

---

## 📱 EJECUTAR EN DISPOSITIVO FÍSICO

### 1. Habilitar opciones de desarrollador:
   - Settings → About phone
   - Toca "Build number" 7 veces
   - Vuelve atrás → Developer options
   - Activa "USB debugging"

### 2. Conectar por USB:
   - Conecta tu teléfono a la PC
   - Acepta el mensaje "Allow USB debugging?"

### 3. Verificar conexión:
   ```bash
   adb devices
   # Debe mostrar tu dispositivo
   ```

### 4. En Android Studio:
   - Selecciona tu dispositivo del dropdown
   - Click Play ▶️

---

## 🔄 FLUJO DE TRABAJO DIARIO

Cuando hagas cambios en el código:

```bash
# 1. Desarrolla normalmente en web
npm run dev

# 2. Cuando quieras probar en Android:
npm run build
npx cap sync android

# 3. En Android Studio: Click Play ▶️
```

---

## 📊 ESTRUCTURA DE CARPETAS ANDROID

```
TutorApp/
├── android/                    # ← Carpeta del proyecto Android
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── assets/
│   │   │       │   └── public/  # ← Tu código web está aquí
│   │   │       ├── java/
│   │   │       └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── gradle/
│   └── build.gradle
├── dist/                       # ← Build web (se copia a Android)
└── capacitor.config.ts         # ← Configuración Capacitor
```

---

## ⚙️ CONFIGURACIÓN AVANZADA

### Cambiar nombre de la app:
Edita `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">TutorApp</string>
```

### Cambiar ícono:
1. Genera íconos: https://icon.kitchen
2. Descarga el paquete
3. Reemplaza en: `android/app/src/main/res/mipmap-*/`

### Cambiar package name:
Edita `capacitor.config.ts`:
```typescript
appId: 'com.tutorapp.appname'
```

---

## 🎉 ¡LISTO!

Ahora puedes:
- ✅ Desarrollar en web con `npm run dev`
- ✅ Probar en Android Studio
- ✅ Ejecutar en emulador o dispositivo real
- ✅ Generar APK para distribución

---

## 📚 RECURSOS ADICIONALES

- [Documentación Capacitor](https://capacitorjs.com/docs)
- [Guía Android Studio](https://developer.android.com/studio/intro)
- [Capacitor Android](https://capacitorjs.com/docs/android)

---

**🇨🇴 ¡Tu TutorApp ahora funciona en Android!** 🚀📱
