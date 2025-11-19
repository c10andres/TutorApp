# 🎨 SCRIPT PARA ARREGLAR ESTILOS DE TUTORAPP (PowerShell)
# Este script soluciona el problema de estilos no visibles

Write-Host "🎨 ARREGLANDO ESTILOS DE TUTORAPP" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "Este script va a:"
Write-Host "1. Limpiar node_modules y package-lock.json"
Write-Host "2. Limpiar cache de npm"
Write-Host "3. Reinstalar todas las dependencias"
Write-Host "4. Instalar Tailwind CSS v3.4.1 (estable)"
Write-Host ""

$Confirm = Read-Host "¿Continuar? (s/n)"
if ($Confirm -ne 's' -and $Confirm -ne 'S') {
    Write-Host "Cancelado." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "1️⃣  Limpiando instalación anterior..." -ForegroundColor Blue

# Limpiar node_modules, package-lock.json y dist
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣  Limpiando cache de npm..." -ForegroundColor Blue
npm cache clean --force
Write-Host "✅ Cache limpiado" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣  Instalando dependencias..." -ForegroundColor Blue
Write-Host "   Esto puede tardar unos minutos..." -ForegroundColor Gray

npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "4️⃣  Verificando archivos de configuración..." -ForegroundColor Blue

# Verificar tailwind.config.js
if (Test-Path "tailwind.config.js") {
    Write-Host "   ✅ tailwind.config.js" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  tailwind.config.js no existe (debería haberse creado)" -ForegroundColor Yellow
}

# Verificar postcss.config.js
if (Test-Path "postcss.config.js") {
    Write-Host "   ✅ postcss.config.js" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  postcss.config.js no existe (debería haberse creado)" -ForegroundColor Yellow
}

# Verificar globals.css
if (Test-Path "styles/globals.css") {
    Write-Host "   ✅ styles/globals.css" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  styles/globals.css no existe" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ¡ARREGLO COMPLETADO!" -ForegroundColor Green
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "📋 SIGUIENTES PASOS:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Ejecutar la aplicación:"
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  Abrir en navegador:"
Write-Host "   http://localhost:5173"
Write-Host ""
Write-Host "3️⃣  Verificar que se vean los estilos:"
Write-Host "   - Gradiente azul en fondo de login"
Write-Host "   - Botones con colores"
Write-Host "   - Formularios con bordes redondeados"
Write-Host ""
Write-Host "4️⃣  Si aún no se ven:"
Write-Host "   - Presiona Ctrl+Shift+R en el navegador"
Write-Host "   - Abre en modo incógnito"
Write-Host "   - Revisa consola del navegador (F12)"
Write-Host ""
Write-Host "📚 Documentación: SOLUCION_ESTILOS.md"
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Pausar al final
Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host
