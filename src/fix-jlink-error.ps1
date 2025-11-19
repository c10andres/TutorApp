# 🔧 ARREGLAR ERROR JLINK - TUTORAPP (PowerShell como Administrador)

param(
    [switch]$Force = $false
)

Write-Host "🔧 SOLUCIONANDO ERROR JLINK" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Verificar privilegios de administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Este script necesita ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "   Haz click derecho → 'Ejecutar como administrador'" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Ejecuta este script desde la raíz del proyecto" -ForegroundColor Red
    Write-Host "   (la carpeta que contiene package.json)" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "✅ Privilegios verificados" -ForegroundColor Green
Write-Host ""

Write-Host "1️⃣  Matando procesos de Java/Gradle..." -ForegroundColor Blue

# Matar procesos que pueden estar usando los archivos
taskkill /f /im java.exe 2>$null
taskkill /f /im javaw.exe 2>$null
taskkill /f /im gradle.exe 2>$null
taskkill /f /im studio64.exe 2>$null

Write-Host "   ✅ Procesos terminados" -ForegroundColor Green
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "2️⃣  Limpiando cache local del proyecto..." -ForegroundColor Blue

# Limpiar cache local
$paths = @(
    "android\.gradle",
    "android\build",
    "android\.cxx",
    "node_modules\.cache",
    ".gradle"
)

foreach ($path in $paths) {
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        Write-Host "   ✅ Eliminado: $path" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "3️⃣  Limpiando cache global de Gradle..." -ForegroundColor Blue

# Cache global de Gradle
$globalPaths = @(
    "$env:USERPROFILE\.gradle\caches",
    "$env:USERPROFILE\.gradle\wrapper",
    "$env:USERPROFILE\.gradle\daemon",
    "$env:USERPROFILE\.android\build-cache"
)

foreach ($path in $globalPaths) {
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        Write-Host "   ✅ Eliminado cache: $(Split-Path $path -Leaf)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "4️⃣  Actualizando configuración de Gradle..." -ForegroundColor Blue

# Crear/actualizar gradle.properties
$gradlePropertiesPath = "android\gradle.properties"
$gradlePropertiesContent = @"
# Configuración optimizada para Java 21 y Android
android.useAndroidX=true
android.enableJetifier=true

# Deshabilitar transformaciones problemáticas
android.enableR8.fullMode=false
android.enableD8.desugaring=false

# Configuración de memoria para Gradle
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8

# Usar Java 17 para toolchain (compatible con Java 21)
android.compileSdkVersion=34
android.targetSdkVersion=34
android.minSdkVersion=22

# Optimizaciones de build
org.gradle.parallel=true
org.gradle.configureondemand=false
org.gradle.daemon=true
org.gradle.caching=true
android.enableBuildCache=true

# Capacitor
capacitorLogLevel=DEBUG
"@

$gradlePropertiesContent | Set-Content $gradlePropertiesPath -Encoding UTF8
Write-Host "   ✅ gradle.properties actualizado" -ForegroundColor Green

Write-Host ""
Write-Host "5️⃣  Actualizando build.gradle principal..." -ForegroundColor Blue

# Actualizar build.gradle principal
$buildGradlePath = "android\build.gradle"
$buildGradleContent = @"
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath 'com.google.gms:google-services:4.4.0'
        
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
"@

$buildGradleContent | Set-Content $buildGradlePath -Encoding UTF8
Write-Host "   ✅ build.gradle principal actualizado" -ForegroundColor Green

Write-Host ""
Write-Host "6️⃣  Actualizando build.gradle de app..." -ForegroundColor Blue

# Leer build.gradle de app actual
$appBuildGradlePath = "android\app\build.gradle"
if (Test-Path $appBuildGradlePath) {
    $appBuildContent = Get-Content $appBuildGradlePath -Raw
    
    # Asegurar que use Java 17 para compilación
    if ($appBuildContent -notmatch "JavaVersion.VERSION_17") {
        $appBuildContent = $appBuildContent -replace "JavaVersion\.VERSION_\d+", "JavaVersion.VERSION_17"
        $appBuildContent = $appBuildContent -replace "compileSdk \d+", "compileSdk 34"
        $appBuildContent = $appBuildContent -replace "targetSdk \d+", "targetSdk 34"
        
        $appBuildContent | Set-Content $appBuildGradlePath -Encoding UTF8
        Write-Host "   ✅ build.gradle de app actualizado (Java 17)" -ForegroundColor Green
    } else {
        Write-Host "   ✅ build.gradle de app ya está configurado" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "7️⃣  Actualizando wrapper de Gradle..." -ForegroundColor Blue

# Actualizar gradle-wrapper.properties
$wrapperPath = "android\gradle\wrapper\gradle-wrapper.properties"
$wrapperDir = Split-Path $wrapperPath -Parent
if (-not (Test-Path $wrapperDir)) {
    New-Item -ItemType Directory -Path $wrapperDir -Force | Out-Null
}

$wrapperContent = @"
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
"@

$wrapperContent | Set-Content $wrapperPath -Encoding UTF8
Write-Host "   ✅ Gradle wrapper actualizado a 8.5" -ForegroundColor Green

Write-Host ""
Write-Host "8️⃣  Verificando instalación de Java..." -ForegroundColor Blue

# Verificar Java
try {
    $javaVersion = & java -version 2>&1 | Select-Object -First 1
    Write-Host "   ✅ Java encontrado: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Java no encontrado en PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "9️⃣  Sincronizando con Capacitor..." -ForegroundColor Blue

# Sincronizar Capacitor
try {
    npx cap sync android
    Write-Host "   ✅ Capacitor sincronizado" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Error al sincronizar Capacitor" -ForegroundColor Yellow
    Write-Host "   Ejecuta manualmente: npx cap sync android" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 ¡SOLUCIÓN COMPLETADA!" -ForegroundColor Green
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📋 SIGUIENTES PASOS:" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Abre Android Studio:" -ForegroundColor White
Write-Host "   npx cap open android" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. En Android Studio:" -ForegroundColor White
Write-Host "   • File → Project Structure" -ForegroundColor Gray
Write-Host "   • Verifica que JDK sea Java 17 o 21" -ForegroundColor Gray
Write-Host "   • SDK Location debe estar correcto" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Espera Gradle sync automático" -ForegroundColor White
Write-Host "   (puede tardar 5-10 minutos)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Si sigue fallando:" -ForegroundColor White
Write-Host "   • File → Invalidate Caches → Invalidate and Restart" -ForegroundColor Gray
Write-Host "   • O ejecuta: .\fix-jlink-error.ps1 -Force" -ForegroundColor Gray
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 CAMBIOS REALIZADOS:" -ForegroundColor Yellow
Write-Host "   • Cache completamente limpiado" -ForegroundColor White
Write-Host "   • Gradle actualizado a 8.5" -ForegroundColor White
Write-Host "   • AGP actualizado a 8.2.1" -ForegroundColor White
Write-Host "   • Compilación forzada a Java 17" -ForegroundColor White
Write-Host "   • Transformaciones JDK deshabilitadas" -ForegroundColor White
Write-Host "   • Configuración optimizada" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación completa: SOLUCION_JLINK_ERROR.md" -ForegroundColor Cyan
Write-Host ""

# Pausar si no es ejecución automática
if (-not $Force) {
    Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
    Read-Host
}