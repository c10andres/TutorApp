# 🚀 SCRIPT AUTOMÁTICO - EXPORTACIÓN COMPLETA DESDE FIGMA MAKE
# Ejecuta este script para replicar 100% tu app en VS Code y Android Studio

Write-Host "🎯 TutorApp Colombia - Exportación Completa desde Figma Make" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Green

# Verificar Node.js
Write-Host "📋 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    if ($nodeVersion) {
        Write-Host "✅ Node.js $nodeVersion detectado" -ForegroundColor Green
        
        # Verificar versión
        $versionNumber = $nodeVersion.Substring(1,2)
        if ([int]$versionNumber -lt 18) {
            Write-Host "⚠️ Node.js versión $versionNumber detectada. Recomendamos versión 18 o superior" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Node.js no está instalado. Instálalo desde: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Limpiar instalaciones previas
Write-Host ""
Write-Host "🧹 Limpiando instalaciones previas..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Write-Host "✅ Limpieza completada" -ForegroundColor Green

# Instalar dependencias
Write-Host ""
Write-Host "📦 Instalando dependencias exactas..." -ForegroundColor Yellow
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Error en instalación, intentando con --force..." -ForegroundColor Yellow
    npm install --force
}
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green

# Verificar archivos críticos
Write-Host ""
Write-Host "🔍 Verificando archivos críticos..." -ForegroundColor Yellow

# Verificar App.tsx
if (!(Test-Path "App.tsx")) {
    Write-Host "❌ App.tsx no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar styles/globals.css
if (!(Test-Path "styles/globals.css")) {
    Write-Host "❌ styles/globals.css no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar firebase.ts
if (!(Test-Path "firebase.ts")) {
    Write-Host "⚠️ firebase.ts no encontrado - necesitarás configurar Firebase" -ForegroundColor Yellow
} else {
    Write-Host "✅ firebase.ts encontrado" -ForegroundColor Green
}

# Verificar tailwind.config.js
if (!(Test-Path "tailwind.config.js")) {
    Write-Host "⚠️ tailwind.config.js no encontrado" -ForegroundColor Yellow
} else {
    Write-Host "✅ tailwind.config.js encontrado" -ForegroundColor Green
}

Write-Host "✅ Verificación de archivos completada" -ForegroundColor Green

# Build del proyecto
Write-Host ""
Write-Host "🔨 Construyendo proyecto..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en build. Verificar configuración." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build exitoso" -ForegroundColor Green

# Configurar Capacitor para Android
Write-Host ""
Write-Host "📱 Configurando Capacitor para Android..." -ForegroundColor Yellow

# Verificar si Capacitor ya está configurado
if (!(Test-Path "capacitor.config.ts")) {
    Write-Host "🔧 Inicializando Capacitor..." -ForegroundColor Cyan
    npx cap init "TutorApp Colombia" "com.tutorapp.colombia"
}

# Agregar plataforma Android si no existe
if (!(Test-Path "android")) {
    Write-Host "🤖 Agregando plataforma Android..." -ForegroundColor Cyan
    npx cap add android
}

# Sincronizar con Android
Write-Host "🔄 Sincronizando con Android..." -ForegroundColor Cyan
npx cap sync android
Write-Host "✅ Sincronización completada" -ForegroundColor Green

# Verificar estructura final
Write-Host ""
Write-Host "📁 Verificando estructura final..." -ForegroundColor Yellow

$RequiredDirs = @("components", "pages", "services", "styles", "types", "utils", "contexts", "hooks")
$AllGood = $true

foreach ($dir in $RequiredDirs) {
    if (!(Test-Path $dir)) {
        Write-Host "❌ Directorio faltante: $dir" -ForegroundColor Red
        $AllGood = $false
    } else {
        Write-Host "✅ $dir" -ForegroundColor Green
    }
}

# Verificar archivos críticos
$RequiredFiles = @("App.tsx", "main.tsx", "index.html", "package.json")

foreach ($file in $RequiredFiles) {
    if (!(Test-Path $file)) {
        Write-Host "❌ Archivo faltante: $file" -ForegroundColor Red
        $AllGood = $false
    } else {
        Write-Host "✅ $file" -ForegroundColor Green
    }
}

if ($AllGood) {
    Write-Host ""
    Write-Host "🎉 ¡EXPORTACIÓN COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1️⃣ DESARROLLO WEB (VS Code):" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Yellow
    Write-Host "   Abre: http://localhost:3000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2️⃣ DESARROLLO ANDROID (Android Studio):" -ForegroundColor White
    Write-Host "   npx cap open android" -ForegroundColor Yellow
    Write-Host "   Conecta dispositivo y presiona Run ▶️" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3️⃣ CONFIGURAR FIREBASE (si no está configurado):" -ForegroundColor White
    Write-Host "   - Edita firebase.ts con tus credenciales" -ForegroundColor Gray
    Write-Host "   - Habilita Authentication en Firebase Console" -ForegroundColor Gray
    Write-Host "   - Habilita Firestore Database" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔗 Enlaces útiles:" -ForegroundColor Cyan
    Write-Host "   - Firebase Console: https://console.firebase.google.com" -ForegroundColor Gray
    Write-Host "   - Android Studio: https://developer.android.com/studio" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✅ Tu app está lista para ejecutarse idénticamente en ambas plataformas!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️ Algunos archivos o directorios están faltando." -ForegroundColor Yellow
    Write-Host "Verifica que todos los archivos se copiaron correctamente desde Figma Make." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📞 ¿Necesitas ayuda? Verifica:" -ForegroundColor Cyan
Write-Host "   - Todos los archivos se copiaron desde Figma Make" -ForegroundColor Gray
Write-Host "   - Node.js versión 18+ está instalado" -ForegroundColor Gray
Write-Host "   - Firebase está configurado (si planeas usar autenticación)" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 ¡Listo para desarrollar!" -ForegroundColor Green

# Pausa para que el usuario pueda leer el resultado
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null