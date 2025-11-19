# 🔨 BUILD Y PREVIEW CORRECTO - TUTORAPP (PowerShell)

Write-Host "🔨 CONSTRUYENDO Y PREVISUALIZANDO TUTORAPP" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "Este script hará un build de producción y luego preview."
Write-Host "Para desarrollo normal, usa: npm run dev"
Write-Host ""

$Confirm = Read-Host "¿Continuar con build y preview? (s/n)"
if ($Confirm -ne 's' -and $Confirm -ne 'S') {
    Write-Host "Cancelado. Para desarrollo usa: npm run dev" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "1️⃣  Limpiando build anterior..." -ForegroundColor Blue
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
Write-Host "✅ Build anterior eliminado" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣  Ejecutando TypeScript compiler..." -ForegroundColor Blue
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errores de TypeScript encontrados" -ForegroundColor Red
    Write-Host "Tip: Revisa los errores arriba y corrígelos antes de continuar" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ TypeScript OK" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣  Construyendo aplicación..." -ForegroundColor Blue
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falló" -ForegroundColor Red
    Write-Host "Tip: Revisa los errores arriba" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Build completado" -ForegroundColor Green
Write-Host ""

Write-Host "4️⃣  Verificando archivos generados..." -ForegroundColor Blue
if (Test-Path "dist/index.html") {
    Write-Host "   ✅ dist/index.html" -ForegroundColor Green
} else {
    Write-Host "   ❌ dist/index.html no existe" -ForegroundColor Red
    exit 1
}

if (Test-Path "dist/assets") {
    $JsCount = (Get-ChildItem "dist/assets" -Filter "*.js").Count
    $CssCount = (Get-ChildItem "dist/assets" -Filter "*.css").Count
    Write-Host "   ✅ dist/assets/ ($JsCount JS, $CssCount CSS)" -ForegroundColor Green
} else {
    Write-Host "   ❌ dist/assets/ no existe" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "5️⃣  Mostrando tamaños de archivos..." -ForegroundColor Blue
Get-ChildItem "dist/assets" | Sort-Object Length -Descending | Select-Object -First 5 | ForEach-Object {
    $size = [math]::Round($_.Length / 1KB, 2)
    Write-Host "   $($_.Name): ${size} KB"
}
Write-Host ""

Write-Host "🎉 ¡BUILD EXITOSO!" -ForegroundColor Green
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📋 INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora ejecuta manualmente:"
Write-Host "   npm run preview" -ForegroundColor Cyan
Write-Host ""
Write-Host "Luego abre en navegador:"
Write-Host "   http://localhost:4173"
Write-Host ""
Write-Host "⚠️  RECUERDA: Para desarrollo normal usa:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""

# Pausar
Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host
