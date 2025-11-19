# Script para configurar Git y GitHub Actions para iOS
# Ejecuta este script paso a paso

Write-Host "🚀 Configuración de Git y GitHub Actions para iOS" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar/Instalar Git
Write-Host "📋 PASO 1: Verificando Git..." -ForegroundColor Yellow
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue

if (-not $gitInstalled) {
    Write-Host "❌ Git NO está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Necesitas instalar Git primero:" -ForegroundColor Yellow
    Write-Host "1. Ve a: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Descarga e instala Git" -ForegroundColor White
    Write-Host "3. IMPORTANTE: Cierra y abre PowerShell de nuevo después de instalar" -ForegroundColor White
    Write-Host "4. Ejecuta este script de nuevo" -ForegroundColor White
    Write-Host ""
    Write-Host "¿Quieres que abra el navegador para descargar Git? (S/N)" -ForegroundColor Cyan
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        Start-Process "https://git-scm.com/download/win"
    }
    exit
} else {
    $gitVersion = git --version
    Write-Host "✅ Git está instalado: $gitVersion" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 PASO 2: Configurando Git..." -ForegroundColor Yellow

# Verificar si ya está configurado
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName -or -not $userEmail) {
    Write-Host "Git no está configurado. Necesito tu información:" -ForegroundColor Yellow
    Write-Host ""
    $name = Read-Host "Ingresa tu nombre (ej: Carlo)"
    $email = Read-Host "Ingresa tu email (ej: carlo@ejemplo.com)"
    
    git config --global user.name "$name"
    git config --global user.email "$email"
    
    Write-Host "✅ Git configurado correctamente" -ForegroundColor Green
} else {
    Write-Host "✅ Git ya está configurado:" -ForegroundColor Green
    Write-Host "   Nombre: $userName" -ForegroundColor White
    Write-Host "   Email: $userEmail" -ForegroundColor White
    Write-Host ""
    Write-Host "¿Quieres cambiar la configuración? (S/N)" -ForegroundColor Cyan
    $change = Read-Host
    if ($change -eq "S" -or $change -eq "s") {
        $name = Read-Host "Ingresa tu nombre"
        $email = Read-Host "Ingresa tu email"
        git config --global user.name "$name"
        git config --global user.email "$email"
        Write-Host "✅ Configuración actualizada" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📋 PASO 3: Inicializando repositorio Git..." -ForegroundColor Yellow

if (Test-Path ".git") {
    Write-Host "✅ Git ya está inicializado" -ForegroundColor Green
} else {
    git init
    Write-Host "✅ Repositorio Git inicializado" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 PASO 4: Verificando archivos..." -ForegroundColor Yellow

if (-not (Test-Path "package-lock.json")) {
    Write-Host "⚠️ package-lock.json no existe. Generándolo..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ package-lock.json generado" -ForegroundColor Green
} else {
    Write-Host "✅ package-lock.json existe" -ForegroundColor Green
}

if (-not (Test-Path ".github\workflows\ios-build.yml")) {
    Write-Host "⚠️ Workflow de iOS no existe. Creándolo..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path ".github\workflows" -Force | Out-Null
    # El workflow ya debería existir, pero por si acaso
    Write-Host "✅ Verifica que .github\workflows\ios-build.yml existe" -ForegroundColor Yellow
} else {
    Write-Host "✅ Workflow de iOS existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 PASO 5: Preparando commit inicial..." -ForegroundColor Yellow

# Agregar todos los archivos
git add .
$status = git status --short

if ($status) {
    Write-Host "Archivos listos para commit:" -ForegroundColor White
    Write-Host $status -ForegroundColor Gray
    Write-Host ""
    Write-Host "¿Quieres hacer el commit ahora? (S/N)" -ForegroundColor Cyan
    $commit = Read-Host
    if ($commit -eq "S" -or $commit -eq "s") {
        git commit -m "Initial commit - TutorApp Colombia - Preparado para iOS"
        Write-Host "✅ Commit realizado" -ForegroundColor Green
    }
} else {
    Write-Host "✅ No hay cambios pendientes" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 PASO 6: Conectar con GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Ahora necesitas:" -ForegroundColor Cyan
Write-Host "1. Crear un repositorio en GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Configuración recomendada:" -ForegroundColor White
Write-Host "   - Nombre: TutorApp (o el que prefieras)" -ForegroundColor Gray
Write-Host "   - Descripción: TutorApp Colombia" -ForegroundColor Gray
Write-Host "   - Visibilidad: PÚBLICO (para GitHub Actions gratis)" -ForegroundColor Gray
Write-Host "   - NO marques: Add README, .gitignore, license" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Después de crear el repo, GitHub te mostrará comandos." -ForegroundColor White
Write-Host "   O usa estos comandos (REEMPLAZA TU_USUARIO y TU_REPO):" -ForegroundColor White
Write-Host ""
Write-Host "   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git" -ForegroundColor Yellow
Write-Host "   git branch -M main" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "¿Quieres que abra GitHub para crear el repositorio? (S/N)" -ForegroundColor Cyan
$openGitHub = Read-Host
if ($openGitHub -eq "S" -or $openGitHub -eq "s") {
    Start-Process "https://github.com/new"
}

Write-Host ""
Write-Host "📋 PASO 7: Después de subir a GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a tu repositorio en GitHub" -ForegroundColor White
Write-Host "2. Click en la pestaña 'Actions'" -ForegroundColor White
Write-Host "3. Busca 'Build iOS App' en el menú izquierdo" -ForegroundColor White
Write-Host "4. Click en 'Run workflow' (botón azul arriba)" -ForegroundColor White
Write-Host "5. Selecciona rama 'main' y click 'Run workflow'" -ForegroundColor White
Write-Host "6. Espera 5-15 minutos" -ForegroundColor White
Write-Host "7. Descarga los artefactos cuando termine" -ForegroundColor White
Write-Host ""

Write-Host "✅ Configuración local completada!" -ForegroundColor Green
Write-Host ""
Write-Host "¿Necesitas ayuda con algún paso? Avísame!" -ForegroundColor Cyan

