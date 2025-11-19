# Script para Desplegar Reglas de Firestore y Storage
# Ejecuta este script para resolver el error de permisos

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DESPLEGANDO REGLAS DE FIREBASE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Firebase CLI
Write-Host "1. Verificando Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "   ✓ Firebase CLI: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Firebase CLI no está instalado" -ForegroundColor Red
    Write-Host "   Instala con: npm install -g firebase-tools" -ForegroundColor Yellow
    Write-Host "   Luego ejecuta: firebase login" -ForegroundColor Yellow
    exit 1
}

# Verificar autenticación
Write-Host ""
Write-Host "2. Verificando autenticación..." -ForegroundColor Yellow
try {
    $projects = firebase projects:list 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "No autenticado"
    }
    Write-Host "   ✓ Autenticado correctamente" -ForegroundColor Green
} catch {
    Write-Host "   ✗ No estás autenticado" -ForegroundColor Red
    Write-Host "   Ejecuta: firebase login" -ForegroundColor Yellow
    exit 1
}

# Verificar proyecto
Write-Host ""
Write-Host "3. Verificando proyecto..." -ForegroundColor Yellow
$projectInfo = firebase use 2>&1 | Out-String
if ($projectInfo -match "Active project: ([\w-]+)") {
    $PROJECT_ID = $matches[1]
    Write-Host "   ✓ Proyecto activo: $PROJECT_ID" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Configurando proyecto..." -ForegroundColor Yellow
    firebase use --add
    $projectInfo = firebase use 2>&1 | Out-String
    if ($projectInfo -match "Active project: ([\w-]+)") {
        $PROJECT_ID = $matches[1]
        Write-Host "   ✓ Proyecto configurado: $PROJECT_ID" -ForegroundColor Green
    } else {
        Write-Host "   ✗ No se pudo configurar el proyecto" -ForegroundColor Red
        exit 1
    }
}

# Desplegar reglas de Firestore
Write-Host ""
Write-Host "4. Desplegando reglas de Firestore..." -ForegroundColor Yellow
if (Test-Path "firestore.rules") {
    Write-Host "   → Desplegando firestore.rules..." -ForegroundColor Cyan
    firebase deploy --only firestore:rules
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Reglas de Firestore desplegadas exitosamente" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Error desplegando reglas de Firestore" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ✗ Archivo firestore.rules no encontrado" -ForegroundColor Red
    exit 1
}

# Desplegar reglas de Storage
Write-Host ""
Write-Host "5. Desplegando reglas de Storage..." -ForegroundColor Yellow
if (Test-Path "src/storage.rules") {
    Write-Host "   → Desplegando src/storage.rules..." -ForegroundColor Cyan
    firebase deploy --only storage:rules
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Reglas de Storage desplegadas exitosamente" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Advertencia: Error desplegando reglas de Storage" -ForegroundColor Yellow
        Write-Host "   (Esto puede ser normal si no están configuradas)" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ⚠ Archivo src/storage.rules no encontrado" -ForegroundColor Yellow
}

# Resumen
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   ✓✓✓ REGLAS DESPLEGADAS EXITOSAMENTE ✓✓✓" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Espera 1-2 minutos para que las reglas se propaguen" -ForegroundColor Cyan
Write-Host "   2. Recarga tu aplicación (Ctrl+F5)" -ForegroundColor Cyan
Write-Host "   3. Verifica que ya no aparezca el error de permisos" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Firebase Console:" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com/project/$PROJECT_ID" -ForegroundColor Cyan
Write-Host ""

