# Script de Deployment Completo para Firebase - Windows PowerShell
# TutorApp - Plataforma de Tutorías Colombia

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT COMPLETO A FIREBASE - TutorApp   " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Variables de control
$ERRORS = 0

# ===================
# 1. VERIFICAR FIREBASE CLI
# ===================
Write-Host "1. Verificando Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "   ✓ Firebase CLI instalado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Firebase CLI no está instalado" -ForegroundColor Red
    Write-Host "   Instala con: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# ===================
# 2. VERIFICAR AUTENTICACIÓN
# ===================
Write-Host ""
Write-Host "2. Verificando autenticación..." -ForegroundColor Yellow
try {
    $projects = firebase projects:list 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "No autenticado"
    }
    Write-Host "   ✓ Autenticado correctamente" -ForegroundColor Green
} catch {
    Write-Host "   ✗ No estás autenticado en Firebase" -ForegroundColor Red
    Write-Host "   Ejecuta: firebase login" -ForegroundColor Yellow
    exit 1
}

# Obtener proyecto activo
try {
    $projectInfo = firebase use 2>&1 | Out-String
    if ($projectInfo -match "Active project: ([\w-]+)") {
        $PROJECT_ID = $matches[1]
        Write-Host "   → Proyecto activo: $PROJECT_ID" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠ No hay proyecto activo configurado" -ForegroundColor Yellow
        Write-Host "   Configurando proyecto..." -ForegroundColor Yellow
        firebase use --add
        $projectInfo = firebase use 2>&1 | Out-String
        if ($projectInfo -match "Active project: ([\w-]+)") {
            $PROJECT_ID = $matches[1]
        }
    }
} catch {
    Write-Host "   ⚠ No se pudo determinar el proyecto activo" -ForegroundColor Yellow
    $PROJECT_ID = "tu-proyecto-id"
}

# ===================
# 3. VERIFICAR NODE_MODULES
# ===================
Write-Host ""
Write-Host "3. Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   → Instalando dependencias (primera vez)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ✗ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ✓ node_modules existe" -ForegroundColor Green
    Write-Host "   → Verificando actualizaciones..." -ForegroundColor Yellow
    npm install --silent
}
Write-Host "   ✓ Dependencias listas" -ForegroundColor Green

# ===================
# 4. LIMPIAR BUILD ANTERIOR
# ===================
Write-Host ""
Write-Host "4. Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "   ✓ Carpeta dist eliminada" -ForegroundColor Green
} else {
    Write-Host "   → No hay build anterior" -ForegroundColor Cyan
}

# ===================
# 5. BUILD DEL PROYECTO
# ===================
Write-Host ""
Write-Host "5. Compilando proyecto..." -ForegroundColor Yellow
Write-Host "   → Ejecutando: npm run build" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Error en el build" -ForegroundColor Red
    Write-Host "   Revisa los errores de TypeScript arriba" -ForegroundColor Yellow
    exit 1
}

# Verificar que se creó la carpeta dist
if (-not (Test-Path "dist")) {
    Write-Host "   ✗ No se generó la carpeta dist" -ForegroundColor Red
    exit 1
}

# Verificar que hay archivos en dist
$fileCount = (Get-ChildItem -Path "dist" -Recurse -File).Count
if ($fileCount -lt 1) {
    Write-Host "   ✗ La carpeta dist está vacía" -ForegroundColor Red
    exit 1
}

Write-Host "   ✓ Build completado ($fileCount archivos generados)" -ForegroundColor Green

# ===================
# 6. DESPLEGAR REGLAS DE FIRESTORE
# ===================
Write-Host ""
Write-Host "6. Desplegando reglas de Firestore..." -ForegroundColor Yellow
if (Test-Path "firestore.rules") {
    firebase deploy --only firestore:rules
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Reglas de Firestore desplegadas" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Advertencia: Error desplegando reglas de Firestore" -ForegroundColor Yellow
        $ERRORS++
    }
} else {
    Write-Host "   ⚠ Archivo firestore.rules no encontrado" -ForegroundColor Yellow
    $ERRORS++
}

# ===================
# 7. DESPLEGAR ÍNDICES DE FIRESTORE
# ===================
Write-Host ""
Write-Host "7. Desplegando índices de Firestore..." -ForegroundColor Yellow
if (Test-Path "firestore.indexes.json") {
    firebase deploy --only firestore:indexes
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Índices de Firestore desplegados" -ForegroundColor Green
        Write-Host "   → Los índices pueden tardar unos minutos en compilarse" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠ Advertencia: Error desplegando índices" -ForegroundColor Yellow
        $ERRORS++
    }
} else {
    Write-Host "   ⚠ Archivo firestore.indexes.json no encontrado" -ForegroundColor Yellow
    $ERRORS++
}

# ===================
# 8. DESPLEGAR REGLAS DE STORAGE
# ===================
Write-Host ""
Write-Host "8. Desplegando reglas de Storage..." -ForegroundColor Yellow
if (Test-Path "storage.rules") {
    firebase deploy --only storage:rules
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Reglas de Storage desplegadas" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Advertencia: Error desplegando reglas de Storage" -ForegroundColor Yellow
        $ERRORS++
    }
} else {
    Write-Host "   ⚠ Archivo storage.rules no encontrado" -ForegroundColor Yellow
    $ERRORS++
}

# ===================
# 9. DESPLEGAR HOSTING
# ===================
Write-Host ""
Write-Host "9. Desplegando aplicación a Firebase Hosting..." -ForegroundColor Yellow
Write-Host "   → Esto puede tardar unos minutos..." -ForegroundColor Cyan
firebase deploy --only hosting
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Hosting desplegado exitosamente" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error desplegando hosting" -ForegroundColor Red
    exit 1
}

# ===================
# 10. OBTENER INFORMACIÓN DEL DEPLOYMENT
# ===================
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
if ($ERRORS -eq 0) {
    Write-Host "   ✓✓✓ DEPLOYMENT COMPLETADO EXITOSAMENTE ✓✓✓  " -ForegroundColor Green
} else {
    Write-Host "   ⚠⚠⚠ DEPLOYMENT COMPLETADO CON ADVERTENCIAS ⚠⚠⚠  " -ForegroundColor Yellow
    Write-Host "   ($ERRORS advertencias)" -ForegroundColor Yellow
}
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Obtener URLs
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📱 INFORMACIÓN DE TU APLICACIÓN" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URL Principal:" -ForegroundColor Yellow
Write-Host "   https://$PROJECT_ID.web.app"
Write-Host ""
Write-Host "🌐 URL Alternativa:" -ForegroundColor Yellow
Write-Host "   https://$PROJECT_ID.firebaseapp.com"
Write-Host ""
Write-Host "🔧 Firebase Console:" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com/project/$PROJECT_ID"
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ===================
# 11. COMANDOS ÚTILES
# ===================
Write-Host "📋 COMANDOS ÚTILES:" -ForegroundColor Green
Write-Host ""
Write-Host "Ver logs de hosting:" -ForegroundColor Yellow
Write-Host "   firebase hosting:channel:list"
Write-Host ""
Write-Host "Ver todas las versiones:" -ForegroundColor Yellow
Write-Host "   firebase hosting:releases:list"
Write-Host ""
Write-Host "Revertir a versión anterior:" -ForegroundColor Yellow
Write-Host "   firebase hosting:rollback"
Write-Host ""
Write-Host "Ver estado de índices:" -ForegroundColor Yellow
Write-Host "   → Ve a: https://console.firebase.google.com/project/$PROJECT_ID/firestore/indexes"
Write-Host ""

# ===================
# 12. PRÓXIMOS PASOS
# ===================
Write-Host "🚀 PRÓXIMOS PASOS:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Abre tu aplicación: https://$PROJECT_ID.web.app" -ForegroundColor Cyan
Write-Host "2. Verifica que funciona correctamente" -ForegroundColor Cyan
Write-Host "3. Revisa Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID" -ForegroundColor Cyan
Write-Host "4. Configura dominios personalizados (opcional)" -ForegroundColor Cyan
Write-Host "5. Activa Analytics (opcional)" -ForegroundColor Cyan
Write-Host ""

# ===================
# 13. RECORDATORIOS
# ===================
if ($ERRORS -gt 0) {
    Write-Host "⚠️  RECORDATORIOS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "- Revisa que los archivos de reglas existan"
    Write-Host "- Verifica los índices en Firebase Console"
    Write-Host "- Algunos índices pueden tardar en compilarse"
    Write-Host ""
}

Write-Host "✨ ¡Deployment completado! ✨" -ForegroundColor Green
Write-Host ""
