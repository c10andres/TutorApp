# 🔧 ACTUALIZAR GRADLE A 8.5 - TUTORAPP (PowerShell)

Write-Host "🔧 ACTUALIZANDO GRADLE A 8.5" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    Write-Host "   (la carpeta que contiene package.json)" -ForegroundColor Yellow
    exit 1
}

# Verificar que existe la carpeta android
if (-not (Test-Path "android")) {
    Write-Host "❌ Error: No existe la carpeta 'android/'" -ForegroundColor Red
    Write-Host "   Primero ejecuta: npx cap add android" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Carpeta del proyecto verificada" -ForegroundColor Green
Write-Host ""

Write-Host "1️⃣  Actualizando gradle-wrapper.properties..." -ForegroundColor Blue

# Archivo gradle-wrapper.properties
$wrapperFile = "android\gradle\wrapper\gradle-wrapper.properties"

if (Test-Path $wrapperFile) {
    # Leer contenido
    $content = Get-Content $wrapperFile -Raw
    
    # Reemplazar versión de Gradle
    $content = $content -replace 'gradle-\d+\.\d+(\.\d+)?-bin\.zip', 'gradle-8.5-bin.zip'
    
    # Guardar
    $content | Set-Content $wrapperFile -NoNewline
    
    Write-Host "   ✅ gradle-wrapper.properties actualizado a Gradle 8.5" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No se encontró gradle-wrapper.properties" -ForegroundColor Yellow
    Write-Host "      Creando archivo..." -ForegroundColor Yellow
    
    $wrapperDir = "android\gradle\wrapper"
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
    
    $wrapperContent | Set-Content $wrapperFile
    Write-Host "   ✅ gradle-wrapper.properties creado" -ForegroundColor Green
}

Write-Host ""
Write-Host "2️⃣  Actualizando build.gradle (Android Gradle Plugin)..." -ForegroundColor Blue

# Archivo build.gradle
$buildFile = "android\build.gradle"

if (Test-Path $buildFile) {
    $buildContent = Get-Content $buildFile -Raw
    
    # Actualizar Android Gradle Plugin a 8.2.0
    $buildContent = $buildContent -replace "classpath 'com\.android\.tools\.build:gradle:\d+\.\d+(\.\d+)?'", "classpath 'com.android.tools.build:gradle:8.2.0'"
    
    $buildContent | Set-Content $buildFile -NoNewline
    
    Write-Host "   ✅ build.gradle actualizado (AGP 8.2.0)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No se encontró build.gradle" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3️⃣  Limpiando cache de Gradle..." -ForegroundColor Blue

# Limpiar cache local
if (Test-Path "android\.gradle") {
    Remove-Item -Recurse -Force "android\.gradle"
    Write-Host "   ✅ Limpiado android/.gradle" -ForegroundColor Green
}

if (Test-Path "android\build") {
    Remove-Item -Recurse -Force "android\build"
    Write-Host "   ✅ Limpiado android/build" -ForegroundColor Green
}

Write-Host ""
Write-Host "4️⃣  Sincronizando con Capacitor..." -ForegroundColor Blue

npx cap sync android

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Sincronización completada" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Hubo un problema al sincronizar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ¡ACTUALIZACIÓN COMPLETADA!" -ForegroundColor Green
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📋 SIGUIENTES PASOS:" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Abre Android Studio:" -ForegroundColor White
Write-Host "   npx cap open android" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Espera a que Gradle sync termine automáticamente" -ForegroundColor White
Write-Host "   (puede tardar 5-10 minutos la primera vez)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Verás en la parte inferior:" -ForegroundColor White
Write-Host "   'Gradle sync completed successfully'" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Si hay problemas:" -ForegroundColor White
Write-Host "   File → Invalidate Caches → Invalidate and Restart" -ForegroundColor Gray
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 VERSIONES ACTUALIZADAS:" -ForegroundColor Yellow
Write-Host "   • Gradle: 8.5" -ForegroundColor White
Write-Host "   • Android Gradle Plugin: 8.2.0" -ForegroundColor White
Write-Host "   • Compatible con: Java 21" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación completa: SOLUCION_GRADLE_JAVA.md" -ForegroundColor Cyan
Write-Host ""

# Pausar
Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host
