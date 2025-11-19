# Script para desplegar reglas de Storage después de habilitarlo
Write-Host "🚀 Desplegando reglas de Firebase Storage..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "firebase.json")) {
    Write-Host "❌ Error: No se encuentra firebase.json. Asegúrate de estar en el directorio del proyecto." -ForegroundColor Red
    exit 1
}

# Intentar desplegar
Write-Host "Intentando desplegar reglas de Storage..." -ForegroundColor Yellow
firebase deploy --only storage:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡Reglas de Storage desplegadas correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ahora puedes:" -ForegroundColor Cyan
    Write-Host "1. Recargar tu aplicación (Ctrl+F5)" -ForegroundColor White
    Write-Host "2. Intentar subir un documento PDF" -ForegroundColor White
    Write-Host "3. Verificar que funciona correctamente" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Error al desplegar. Verifica que:" -ForegroundColor Red
    Write-Host "   - Firebase Storage esté habilitado en la consola" -ForegroundColor Yellow
    Write-Host "   - Estés autenticado en Firebase CLI" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para habilitar Storage:" -ForegroundColor Cyan
    Write-Host "1. Abre: https://console.firebase.google.com/project/udconecta-4bfff/storage" -ForegroundColor White
    Write-Host "2. Haz clic en 'Get Started'" -ForegroundColor White
    Write-Host "3. Selecciona 'Start in production mode'" -ForegroundColor White
    Write-Host "4. Elige una ubicación y haz clic en 'Done'" -ForegroundColor White
    Write-Host "5. Ejecuta este script de nuevo" -ForegroundColor White
}

