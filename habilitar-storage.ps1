# Script para habilitar Firebase Storage y desplegar reglas
Write-Host "🔧 Habilitando Firebase Storage..." -ForegroundColor Yellow

# Intentar habilitar Storage usando Firebase CLI
Write-Host "⚠️  Firebase Storage debe habilitarse manualmente desde la consola." -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Pasos a seguir:" -ForegroundColor Cyan
Write-Host "1. Abre: https://console.firebase.google.com/project/udconecta-4bfff/storage" -ForegroundColor White
Write-Host "2. Haz clic en 'Get Started' o 'Comenzar'" -ForegroundColor White
Write-Host "3. Selecciona 'Start in production mode' o 'Comenzar en modo producción'" -ForegroundColor White
Write-Host "4. Selecciona una ubicación (recomendado: us-central1 o southamerica-east1)" -ForegroundColor White
Write-Host "5. Haz clic en 'Done' o 'Listo'" -ForegroundColor White
Write-Host ""
Write-Host "Después de habilitar Storage, ejecuta:" -ForegroundColor Yellow
Write-Host "firebase deploy --only storage:rules" -ForegroundColor Green
Write-Host ""

# Esperar a que el usuario habilite Storage
$response = Read-Host "¿Ya habilitaste Firebase Storage? (s/n)"
if ($response -eq "s" -or $response -eq "S") {
    Write-Host "🚀 Desplegando reglas de Storage..." -ForegroundColor Cyan
    firebase deploy --only storage:rules
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Reglas de Storage desplegadas correctamente!" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al desplegar reglas. Verifica que Storage esté habilitado." -ForegroundColor Red
    }
} else {
    Write-Host "Por favor habilita Firebase Storage primero y luego ejecuta este script de nuevo." -ForegroundColor Yellow
}

