@echo off
REM 🎨 Script Automático para Arreglar Estilos de Tailwind en VS Code (Windows CMD)
REM Este script soluciona el problema de estilos que no se cargan

echo ========================================
echo 🎨 ARREGLANDO ESTILOS DE TAILWIND
echo ========================================
echo.

REM Paso 1: Verificar Node.js
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo Por favor instala Node.js desde: https://nodejs.org/
    exit /b 1
)
node --version
echo ✅ Node.js instalado
echo.

REM Paso 2: Limpiar instalación anterior
echo [2/6] Limpiando archivos antiguos...
if exist "node_modules" (
    rmdir /s /q "node_modules" 2>nul
    echo ✅ node_modules eliminado
) else (
    echo ⚠️  node_modules no existe
)

if exist "package-lock.json" (
    del /f /q "package-lock.json" 2>nul
    echo ✅ package-lock.json eliminado
) else (
    echo ⚠️  package-lock.json no existe
)

if exist ".vite" (
    rmdir /s /q ".vite" 2>nul
    echo ✅ .vite eliminado
) else (
    echo ⚠️  .vite no existe
)

if exist "dist" (
    rmdir /s /q "dist" 2>nul
    echo ✅ dist eliminado
) else (
    echo ⚠️  dist no existe
)
echo.

REM Paso 3: Verificar archivos críticos
echo [3/6] Verificando archivos críticos...

if not exist "styles\globals.css" (
    echo ❌ ERROR: styles/globals.css no existe
    exit /b 1
)
echo ✅ styles/globals.css existe

if not exist "tailwind.config.js" (
    echo ❌ ERROR: tailwind.config.js no existe
    exit /b 1
)
echo ✅ tailwind.config.js existe

if not exist "postcss.config.js" (
    echo ❌ ERROR: postcss.config.js no existe
    exit /b 1
)
echo ✅ postcss.config.js existe

if not exist "main.tsx" (
    echo ❌ ERROR: main.tsx no existe
    exit /b 1
)
echo ✅ main.tsx existe
echo.

REM Paso 4: Limpiar caché de npm
echo [4/6] Limpiando caché de npm...
call npm cache clean --force >nul 2>&1
echo ✅ Caché limpiada
echo.

REM Paso 5: Instalar dependencias
echo [5/6] Instalando dependencias...
echo Esto puede tomar unos minutos...
call npm install

if errorlevel 1 (
    echo ❌ ERROR: Falló la instalación de dependencias
    exit /b 1
)
echo ✅ Dependencias instaladas correctamente
echo.

REM Paso 6: Crear archivo de configuración de VS Code
echo [6/6] Configurando VS Code...
if not exist ".vscode" mkdir ".vscode"

(
echo {
echo   "css.validate": true,
echo   "tailwindCSS.emmetCompletions": true,
echo   "editor.quickSuggestions": {
echo     "strings": true
echo   },
echo   "files.associations": {
echo     "*.css": "tailwindcss"
echo   },
echo   "tailwindCSS.experimental.classRegex": [
echo     ["cva\\^(([^^)]*)\\^)", "[\"'`]([^\"'`]*).*?[\"'`]"],
echo     ["cn\\^(([^^)]*)\\^)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
echo   ],
echo   "editor.formatOnSave": true,
echo   "editor.defaultFormatter": "esbenp.prettier-vscode",
echo   "[typescriptreact]": {
echo     "editor.defaultFormatter": "esbenp.prettier-vscode"
echo   }
echo }
) > ".vscode\settings.json"

echo ✅ Configuración de VS Code creada
echo.

REM Resumen final
echo ========================================
echo ✅ ¡COMPLETADO!
echo ========================================
echo.
echo Ahora ejecuta:
echo npm run dev
echo.
echo Y abre en tu navegador:
echo http://localhost:5173
echo.
echo Los estilos deberían verse correctamente.
echo.
echo Si aún no funciona, revisa:
echo - SOLUCION_ESTILOS_VS_CODE.md
echo - La consola del navegador (F12^) para ver errores
echo.
echo ========================================

pause
