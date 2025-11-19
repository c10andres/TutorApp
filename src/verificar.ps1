# 🔍 SCRIPT DE VERIFICACIÓN TUTORAPP (PowerShell)
# Este script verifica que todo esté configurado correctamente

Write-Host "🔍 VERIFICANDO TUTORAPP..." -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0

# 1. Verificar Node.js
Write-Host "1️⃣  Verificando Node.js..."
try {
    $NodeVersion = node -v
    Write-Host "✅ Node.js instalado: $NodeVersion" -ForegroundColor Green
    
    # Verificar versión
    $NodeMajor = [int]($NodeVersion -replace 'v', '' -split '\.')[0]
    if ($NodeMajor -lt 18) {
        Write-Host "❌ Node.js debe ser v18 o superior" -ForegroundColor Red
        $ErrorCount++
    }
} catch {
    Write-Host "❌ Node.js NO está instalado" -ForegroundColor Red
    Write-Host "   Descargar desde: https://nodejs.org" -ForegroundColor Yellow
    $ErrorCount++
}
Write-Host ""

# 2. Verificar npm
Write-Host "2️⃣  Verificando npm..."
try {
    $NpmVersion = npm -v
    Write-Host "✅ npm instalado: $NpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm NO está instalado" -ForegroundColor Red
    $ErrorCount++
}
Write-Host ""

# 3. Verificar archivos esenciales
Write-Host "3️⃣  Verificando archivos esenciales..."
$Files = @(
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "index.html",
    "main.tsx",
    "App.tsx",
    "firebase.ts",
    "styles/globals.css"
)

foreach ($file in $Files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (FALTA)" -ForegroundColor Red
        $ErrorCount++
    }
}
Write-Host ""

# 4. Verificar node_modules
Write-Host "4️⃣  Verificando dependencias..."
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules existe" -ForegroundColor Green
    
    # Contar paquetes
    $PkgCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host "   📦 $PkgCount paquetes instalados"
} else {
    Write-Host "⚠️  node_modules NO existe" -ForegroundColor Yellow
    Write-Host "   Ejecutar: npm install" -ForegroundColor Yellow
}
Write-Host ""

# 5. Verificar estructura de carpetas
Write-Host "5️⃣  Verificando estructura de carpetas..."
$Dirs = @(
    "pages",
    "components",
    "services",
    "contexts",
    "types",
    "styles",
    "public"
)

foreach ($dir in $Dirs) {
    if (Test-Path $dir) {
        $FilesCount = (Get-ChildItem $dir -Recurse -File).Count
        Write-Host "   ✅ $dir/ ($FilesCount archivos)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dir/ (FALTA)" -ForegroundColor Red
        $ErrorCount++
    }
}
Write-Host ""

# 6. Verificar Firebase
Write-Host "6️⃣  Verificando configuración Firebase..."
if (Test-Path "firebase.ts") {
    $FirebaseContent = Get-Content "firebase.ts" -Raw
    if ($FirebaseContent -match "udconecta-4bfff") {
        Write-Host "✅ Firebase configurado correctamente" -ForegroundColor Green
        Write-Host "   Proyecto: udconecta-4bfff"
    } else {
        Write-Host "❌ Firebase NO está configurado" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "❌ firebase.ts NO existe" -ForegroundColor Red
    $ErrorCount++
}
Write-Host ""

# 7. Verificar package.json
Write-Host "7️⃣  Verificando package.json..."
if (Test-Path "package.json") {
    $PackageJson = Get-Content "package.json" -Raw
    
    if ($PackageJson -match '"react"') {
        Write-Host "✅ React configurado" -ForegroundColor Green
    }
    if ($PackageJson -match '"firebase"') {
        Write-Host "✅ Firebase configurado" -ForegroundColor Green
    }
    if ($PackageJson -match '"tailwindcss"') {
        Write-Host "✅ Tailwind CSS configurado" -ForegroundColor Green
    }
    if ($PackageJson -match '"typescript"') {
        Write-Host "✅ TypeScript configurado" -ForegroundColor Green
    }
}
Write-Host ""

# 8. Verificar tipos TypeScript
Write-Host "8️⃣  Verificando tipos TypeScript..."
if (Test-Path "types/index.ts") {
    $TypesContent = Get-Content "types/index.ts" -Raw
    if ($TypesContent -match "export interface User") {
        Write-Host "✅ Tipos definidos correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Tipos incompletos" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "❌ Archivo de tipos NO existe" -ForegroundColor Red
    $ErrorCount++
}
Write-Host ""

# 9. Contar páginas
Write-Host "9️⃣  Contando páginas de la aplicación..."
if (Test-Path "pages") {
    $PageCount = (Get-ChildItem "pages" -Filter "*.tsx").Count
    Write-Host "✅ $PageCount páginas encontradas" -ForegroundColor Green
    
    # Listar páginas principales
    Write-Host "   📄 Páginas:"
    $Pages = Get-ChildItem "pages" -Filter "*.tsx" | Select-Object -First 5 | ForEach-Object { $_.Name }
    foreach ($page in $Pages) {
        Write-Host "      $page"
    }
    if ($PageCount -gt 5) {
        Write-Host "      ... y $($PageCount - 5) más"
    }
}
Write-Host ""

# 10. Verificar componentes UI
Write-Host "🔟 Verificando componentes UI..."
if (Test-Path "components/ui") {
    $UiCount = (Get-ChildItem "components/ui" -Filter "*.tsx").Count
    Write-Host "✅ $UiCount componentes UI (ShadCN)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Carpeta components/ui NO existe" -ForegroundColor Yellow
}
Write-Host ""

# RESUMEN FINAL
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($ErrorCount -eq 0) {
    Write-Host "🎉 ¡TODO ESTÁ CORRECTO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Configuración completa"
    Write-Host "✅ Archivos presentes"
    Write-Host "✅ Estructura correcta"
    Write-Host ""
    Write-Host "🚀 SIGUIENTE PASO:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Luego abrir: http://localhost:5173" -ForegroundColor Cyan
} else {
    Write-Host "❌ ERRORES ENCONTRADOS: $ErrorCount" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 ACCIONES REQUERIDAS:" -ForegroundColor Yellow
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "   1. npm install" -ForegroundColor Cyan
    }
    
    if ($ErrorCount -gt 0) {
        Write-Host "   2. Revisar archivos faltantes arriba"
        Write-Host "   3. Consultar: INSTRUCCIONES_EJECUCION.md"
    }
}

Write-Host ""
Write-Host "📚 DOCUMENTACIÓN:" -ForegroundColor Cyan
Write-Host "   - INSTRUCCIONES_EJECUCION.md"
Write-Host "   - GUIA_REPLICACION_COMPLETA.md"
Write-Host "   - README_FIREBASE_SETUP.md"
Write-Host ""

# Pausar al final
Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host

exit $ErrorCount
