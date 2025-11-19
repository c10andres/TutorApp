# 📱 BUILD ANDROID - TUTORAPP (PowerShell)

Write-Host "📱 CONSTRUYENDO TUTORAPP PARA ANDROID" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Node.js está instalado
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Descarga desde: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "1️⃣  Limpiando build anterior..." -ForegroundColor Blue
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣  Construyendo aplicación web..." -ForegroundColor Blue
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falló" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build web completado" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣  Verificando archivos generados..." -ForegroundColor Blue
if (Test-Path "dist/index.html") {
    Write-Host "   ✅ dist/index.html" -ForegroundColor Green
} else {
    Write-Host "   ❌ dist/index.html no existe" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "4️⃣  Sincronizando con Android..." -ForegroundColor Blue
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Sync falló" -ForegroundColor Red
    Write-Host "" -ForegroundColor Yellow
    Write-Host "Posible solución:" -ForegroundColor Yellow
    Write-Host "   npm install @capacitor/core @capacitor/cli @capacitor/android" -ForegroundColor Cyan
    exit 1
}
Write-Host "✅ Sincronización completada" -ForegroundColor Green
Write-Host ""

Write-Host "5️⃣  Abriendo Android Studio..." -ForegroundColor Blue
npx cap open android
Write-Host ""

Write-Host "🎉 ¡PROCESO COMPLETADO!" -ForegroundColor Green
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📋 SIGUIENTES PASOS EN ANDROID STUDIO:" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Espera a que Gradle sync termine" -ForegroundColor White
Write-Host "   (puede tardar 5-10 minutos la primera vez)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Selecciona un dispositivo:" -ForegroundColor White
Write-Host "   - Emulador (crea uno si no tienes)" -ForegroundColor Gray
Write-Host "   - Dispositivo físico (conectado por USB)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Click en el botón Play ▶️" -ForegroundColor White
Write-Host "   o presiona Shift + F10" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Espera a que compile e instale" -ForegroundColor White
Write-Host "   (primera vez puede tardar 5-10 minutos)" -ForegroundColor Gray
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 TIPS:" -ForegroundColor Yellow
Write-Host "   • Si ves errores, ve a: File → Sync Project with Gradle Files" -ForegroundColor Gray
Write-Host "   • Para limpiar: Build → Clean Project" -ForegroundColor Gray
Write-Host "   • Para reconstruir: Build → Rebuild Project" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Guía completa: GUIA_ANDROID_STUDIO.md" -ForegroundColor Cyan
Write-Host ""

# Pausar
Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host
