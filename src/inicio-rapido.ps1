# ====================================
# 🚀 INICIO RÁPIDO - TUTORAPP COLOMBIA
# ====================================
# Este script ejecuta todo automáticamente en Windows

# Configurar encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║           🚀 INICIO RÁPIDO - TUTORAPP COLOMBIA              ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encuentra package.json" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio del proyecto." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Directorio correcto detectado" -ForegroundColor Green
Write-Host ""

# 2. Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor White
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Instala Node.js desde: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 3. Verificar npm
try {
    $npmVersion = npm -v
    Write-Host "✅ npm $npmVersion instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Verificar si node_modules existe
if (Test-Path "node_modules") {
    Write-Host "⚠️  node_modules ya existe" -ForegroundColor Yellow
    Write-Host "¿Quieres reinstalar las dependencias? (recomendado si hay problemas)" -ForegroundColor White
    Write-Host "1) No, usar las dependencias existentes"
    Write-Host "2) Sí, reinstalar todo (limpia caché)"
    $reinstallOption = Read-Host "Opción [1-2]"
    
    if ($reinstallOption -eq "2") {
        Write-Host ""
        Write-Host "Limpiando node_modules y caché..." -ForegroundColor White
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Limpieza completada" -ForegroundColor Green
        Write-Host ""
    }
}

# 5. Instalar dependencias si es necesario
if (-not (Test-Path "node_modules")) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📦 INSTALANDO DEPENDENCIAS" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏱️  Esto puede tomar 2-5 minutos..." -ForegroundColor Yellow
    Write-Host ""
    
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
        Write-Host "Intenta ejecutar manualmente: npm install" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
    Write-Host ""
}

# 6. Verificar archivos críticos
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 VERIFICANDO CONFIGURACIÓN" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$criticalFiles = @(
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "tsconfig.json",
    "App.tsx",
    "main.tsx",
    "styles/globals.css"
)

$allFilesOk = $true

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (FALTA)" -ForegroundColor Red
        $allFilesOk = $false
    }
}

Write-Host ""

if (-not $allFilesOk) {
    Write-Host "❌ Faltan archivos críticos" -ForegroundColor Red
    Write-Host "Verifica que el proyecto esté completo" -ForegroundColor Yellow
    exit 1
}

# 7. Ofrecer ejecutar verificación completa
Write-Host "¿Quieres ejecutar la verificación completa? (opcional)" -ForegroundColor White
Write-Host "1) No, continuar directamente"
Write-Host "2) Sí, ejecutar verificación completa"
$verifyOption = Read-Host "Opción [1-2]"

if ($verifyOption -eq "2") {
    Write-Host ""
    if (Test-Path "verificar-todo.js") {
        node verificar-todo.js
        Write-Host ""
    } else {
        Write-Host "⚠️  verificar-todo.js no encontrado, continuando..." -ForegroundColor Yellow
        Write-Host ""
    }
}

# 8. Iniciar servidor de desarrollo
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 INICIANDO SERVIDOR DE DESARROLLO" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ El navegador se abrirá automáticamente" -ForegroundColor Green
Write-Host "✨ Los estilos están configurados y listos" -ForegroundColor Green
Write-Host "✨ Hot Module Replacement habilitado" -ForegroundColor Green
Write-Host ""
Write-Host "Para detener el servidor: Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "Iniciando en 3 segundos..." -ForegroundColor White
Start-Sleep -Seconds 3

# Ejecutar el servidor
npm run dev

# Si el servidor se detiene
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║                 Servidor detenido                            ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para volver a ejecutar:" -ForegroundColor White
Write-Host "  .\inicio-rapido.ps1" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
