# 🎨 Script Automático para Arreglar Estilos de Tailwind en VS Code (Windows)
# Este script soluciona el problema de estilos que no se cargan

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎨 ARREGLANDO ESTILOS DE TAILWIND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar Node.js
Write-Host "[1/6] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde: https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 2: Limpiar instalación anterior
Write-Host "[2/6] Limpiando archivos antiguos..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "✅ node_modules eliminado" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules no existe" -ForegroundColor Yellow
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "✅ package-lock.json eliminado" -ForegroundColor Green
} else {
    Write-Host "⚠️  package-lock.json no existe" -ForegroundColor Yellow
}

if (Test-Path ".vite") {
    Remove-Item -Recurse -Force ".vite" -ErrorAction SilentlyContinue
    Write-Host "✅ .vite eliminado" -ForegroundColor Green
} else {
    Write-Host "⚠️  .vite no existe" -ForegroundColor Yellow
}

if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    Write-Host "✅ dist eliminado" -ForegroundColor Green
} else {
    Write-Host "⚠️  dist no existe" -ForegroundColor Yellow
}

Write-Host ""

# Paso 3: Verificar archivos críticos
Write-Host "[3/6] Verificando archivos críticos..." -ForegroundColor Yellow

if (-Not (Test-Path "styles/globals.css")) {
    Write-Host "❌ ERROR: styles/globals.css no existe" -ForegroundColor Red
    exit 1
}
Write-Host "✅ styles/globals.css existe" -ForegroundColor Green

if (-Not (Test-Path "tailwind.config.js")) {
    Write-Host "❌ ERROR: tailwind.config.js no existe" -ForegroundColor Red
    exit 1
}
Write-Host "✅ tailwind.config.js existe" -ForegroundColor Green

if (-Not (Test-Path "postcss.config.js")) {
    Write-Host "❌ ERROR: postcss.config.js no existe" -ForegroundColor Red
    exit 1
}
Write-Host "✅ postcss.config.js existe" -ForegroundColor Green

if (-Not (Test-Path "main.tsx")) {
    Write-Host "❌ ERROR: main.tsx no existe" -ForegroundColor Red
    exit 1
}
Write-Host "✅ main.tsx existe" -ForegroundColor Green

# Verificar que main.tsx importa el CSS
$mainContent = Get-Content "main.tsx" -Raw
if ($mainContent -notmatch "import './styles/globals.css'") {
    Write-Host "❌ ERROR: main.tsx no importa styles/globals.css" -ForegroundColor Red
    exit 1
}
Write-Host "✅ main.tsx importa el CSS correctamente" -ForegroundColor Green
Write-Host ""

# Paso 4: Limpiar caché de npm
Write-Host "[4/6] Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "✅ Caché limpiada" -ForegroundColor Green
Write-Host ""

# Paso 5: Instalar dependencias
Write-Host "[5/6] Instalando dependencias..." -ForegroundColor Yellow
Write-Host "Esto puede tomar unos minutos..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Falló la instalación de dependencias" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 6: Crear archivo de configuración de VS Code si no existe
Write-Host "[6/6] Configurando VS Code..." -ForegroundColor Yellow

if (-Not (Test-Path ".vscode")) {
    New-Item -ItemType Directory -Path ".vscode" -Force | Out-Null
}

$vsCodeSettings = @'
{
  "css.validate": true,
  "tailwindCSS.emmetCompletions": true,
  "editor.quickSuggestions": {
    "strings": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
'@

Set-Content -Path ".vscode/settings.json" -Value $vsCodeSettings
Write-Host "✅ Configuración de VS Code creada" -ForegroundColor Green
Write-Host ""

# Resumen final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ ¡COMPLETADO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora ejecuta:" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Y abre en tu navegador:" -ForegroundColor White
Write-Host "http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Los estilos deberían verse correctamente." -ForegroundColor Green
Write-Host ""
Write-Host "Si aún no funciona, revisa:" -ForegroundColor White
Write-Host "- SOLUCION_ESTILOS_VS_CODE.md" -ForegroundColor Cyan
Write-Host "- La consola del navegador (F12) para ver errores" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
