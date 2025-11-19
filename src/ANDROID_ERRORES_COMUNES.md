# 🔧 ANDROID - ERRORES COMUNES Y SOLUCIONES

## 📋 ÍNDICE DE ERRORES

1. [Error JLink JDK Transform](#1-error-jlink-jdk-transform)
2. [Incompatibilidad Java/Gradle](#2-incompatibilidad-javagradle)
3. [Gradle Sync Failed](#3-gradle-sync-failed)
4. [SDK no encontrado](#4-sdk-no-encontrado)
5. [Build Tools no encontrado](#5-build-tools-no-encontrado)
6. [Memoria insuficiente](#6-memoria-insuficiente)
7. [Permisos en Windows](#7-permisos-en-windows)

---

## 1. ERROR JLINK JDK TRANSFORM

### ❌ **Error:**
```
Error while executing process jlink.exe
Execution failed for JdkImageTransform
```

### ✅ **Solución:**
```powershell
# Ejecutar como Administrador
.\fix-jlink-error.ps1
```

**O manualmente:**
1. Limpiar cache: `Remove-Item -Recurse -Force $env:USERPROFILE\.gradle\caches`
2. Deshabilitar transformaciones en `android/gradle.properties`:
   ```properties
   android.enableR8.fullMode=false
   android.enableD8.desugaring=false
   ```

---

## 2. INCOMPATIBILIDAD JAVA/GRADLE

### ❌ **Error:**
```
Your build is currently configured to use incompatible Java X and Gradle Y
```

### ✅ **Solución:**
```powershell
.\actualizar-gradle.ps1
```

**Tabla de compatibilidad:**
| Java | Gradle | AGP |
|------|--------|-----|
| 11-17 | 7.x-8.4 | 7.x-8.1 |
| 21 | 8.5+ | 8.2+ |

---

## 3. GRADLE SYNC FAILED

### ❌ **Error:**
```
Gradle sync failed
Could not resolve dependencies
```

### ✅ **Solución:**

#### **Paso 1: Limpiar proyecto**
```bash
cd android
./gradlew clean
```

#### **Paso 2: Invalidar cache**
En Android Studio: **File → Invalidate Caches → Invalidate and Restart**

#### **Paso 3: Verificar internet/proxy**
```bash
# Test conexión
curl -I https://repo1.maven.org/maven2/

# Si hay proxy, configurar en gradle.properties:
systemProp.http.proxyHost=proxy.empresa.com
systemProp.http.proxyPort=8080
```

---

## 4. SDK NO ENCONTRADO

### ❌ **Error:**
```
SDK location not found
Android SDK not found
```

### ✅ **Solución:**

#### **Paso 1: Verificar ubicación**
```powershell
# Ubicación típica:
C:\Users\[usuario]\AppData\Local\Android\Sdk
```

#### **Paso 2: Configurar en Android Studio**
1. **File → Project Structure**
2. **SDK Location**
3. **Android SDK Location**: Seleccionar carpeta correcta

#### **Paso 3: Crear local.properties**
```properties
# Archivo: android/local.properties
sdk.dir=C\:\\Users\\[usuario]\\AppData\\Local\\Android\\Sdk
```

---

## 5. BUILD TOOLS NO ENCONTRADO

### ❌ **Error:**
```
Build Tools version X not found
Failed to find Build Tools revision X
```

### ✅ **Solución:**

#### **Paso 1: Instalar Build Tools**
1. Abrir **SDK Manager** en Android Studio
2. **SDK Tools** tab
3. Marcar **Android SDK Build-Tools**
4. **Apply**

#### **Paso 2: Verificar versión en build.gradle**
```gradle
android {
    compileSdk 34
    buildToolsVersion "34.0.0"
}
```

---

## 6. MEMORIA INSUFICIENTE

### ❌ **Error:**
```
OutOfMemoryError
GC overhead limit exceeded
```

### ✅ **Solución:**

#### **Configurar memoria en gradle.properties:**
```properties
# Archivo: android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError

# Habilitar parallel builds
org.gradle.parallel=true
org.gradle.daemon=true
```

#### **Si sigue fallando:**
```properties
# Aumentar más memoria
org.gradle.jvmargs=-Xmx8192m -XX:MaxMetaspaceSize=1024m
```

---

## 7. PERMISOS EN WINDOWS

### ❌ **Error:**
```
Permission denied
Access is denied
```

### ✅ **Solución:**

#### **Paso 1: Ejecutar como Administrador**
- Click derecho en PowerShell → **Ejecutar como administrador**

#### **Paso 2: Dar permisos a carpeta**
```powershell
# Dar permisos completos
icacls "android" /grant Everyone:F /T
```

#### **Paso 3: Verificar antivirus**
- Agregar carpeta del proyecto a exclusiones del antivirus
- Temporalmente deshabilitar protección en tiempo real

---

## 🚀 SCRIPTS DE SOLUCIÓN RÁPIDA

### **Para Error JLink:**
```powershell
.\fix-jlink-error.ps1
```

### **Para actualizar Gradle:**
```powershell
.\actualizar-gradle.ps1
```

### **Para limpiar todo:**
```powershell
# Limpiar cache global
Remove-Item -Recurse -Force $env:USERPROFILE\.gradle\caches
Remove-Item -Recurse -Force $env:USERPROFILE\.android\build-cache

# Limpiar proyecto
Remove-Item -Recurse -Force android\.gradle
Remove-Item -Recurse -Force android\build

# Sincronizar
npx cap sync android
```

---

## 🔄 PROCESO DE DIAGNÓSTICO

### **Cuando hay un error:**

#### **Paso 1: Identificar el tipo**
```bash
# Leer error completo
# Buscar palabras clave:
# - "JLink" = Error JDK Transform
# - "incompatible" = Error Java/Gradle
# - "not found" = SDK/Build Tools missing
# - "OutOfMemory" = Memoria insuficiente
```

#### **Paso 2: Aplicar solución específica**
```bash
# Usar script correspondiente
# O seguir pasos manuales
```

#### **Paso 3: Si no funciona**
```bash
# Limpiar TODO
.\fix-jlink-error.ps1

# Reinstalar Android Studio si es necesario
```

---

## 📊 CONFIGURACIÓN ÓPTIMA

### **gradle.properties (Completo):**
```properties
# Android
android.useAndroidX=true
android.enableJetifier=true

# Optimizaciones
android.enableR8.fullMode=false
android.enableD8.desugaring=false
android.enableBuildCache=true

# Memoria
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError

# Performance
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.caching=true
org.gradle.configureondemand=false

# SDK
android.compileSdkVersion=34
android.targetSdkVersion=34
android.minSdkVersion=22

# Capacitor
capacitorLogLevel=DEBUG
```

### **build.gradle (Versiones estables):**
```gradle
buildscript {
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### **gradle-wrapper.properties:**
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
```

---

## 🆘 ÚLTIMO RECURSO

### **Si NADA funciona:**

#### **Reinstalación completa:**
```powershell
# 1. Desinstalar Android Studio
# 2. Eliminar carpetas:
Remove-Item -Recurse -Force $env:USERPROFILE\.android
Remove-Item -Recurse -Force $env:USERPROFILE\.gradle
Remove-Item -Recurse -Force "C:\Users\[usuario]\.AndroidStudio*"

# 3. Reinstalar Android Studio
# 4. Reconfigurar SDK
# 5. Clonar proyecto nuevamente
```

#### **Usar versiones anteriores:**
```gradle
# build.gradle
classpath 'com.android.tools.build:gradle:8.1.4'

# gradle-wrapper.properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.4-bin.zip
```

---

## 📞 OBTENER AYUDA

### **Comandos de diagnóstico:**
```bash
# Información del sistema
java -version
./gradlew --version

# Estado de Gradle
./gradlew --status

# Build con información detallada
./gradlew assembleDebug --info --stacktrace
```

### **Logs importantes:**
- Android Studio: **View → Tool Windows → Build**
- Gradle: `android/build/reports/`
- Capacitor: Terminal donde ejecutaste `npx cap open android`

---

## 🎯 CHECKLIST DE VERIFICACIÓN

Antes de compilar Android, verifica:

- [ ] ✅ Java 17 o 21 instalado
- [ ] ✅ Android Studio actualizado
- [ ] ✅ SDK Platform API 34 instalado
- [ ] ✅ Build Tools 34.0.0 instalado
- [ ] ✅ Cache de Gradle limpio
- [ ] ✅ Gradle 8.5+ configurado
- [ ] ✅ AGP 8.2+ configurado
- [ ] ✅ Internet sin restricciones
- [ ] ✅ Antivirus no bloquea carpeta
- [ ] ✅ Espacio en disco suficiente (5GB+)

---

## 🇨🇴 ¡TU TUTORAPP FUNCIONARÁ EN ANDROID!

Con estas soluciones, tu TutorApp compilará perfectamente en Android. 

**En caso de duda, ejecuta:**
```powershell
.\fix-jlink-error.ps1
```

**¡Y listo!** 🚀📱