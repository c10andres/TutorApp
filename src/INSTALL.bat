@echo off
setlocal enabledelayedexpansion

REM Script de Instalación Automatizada - TutorApp Colombia (Windows)
REM Este script instala todas las dependencias y configura el proyecto

echo ========================================================
echo   TutorApp Colombia - Instalacion Automatica
echo ========================================================
echo.

REM Paso 1: Verificar Node.js
echo [Paso 1/5] Verificando Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    echo.
    echo Por favor, instala Node.js desde: https://nodejs.org/
    echo Version recomendada: 18.x o superior
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js instalado: %NODE_VERSION%

REM Paso 2: Verificar npm
echo [Paso 2/5] Verificando npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm no esta instalado
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm instalado: v%NPM_VERSION%

REM Paso 3: Limpiar instalaciones previas
echo.
echo [Paso 3/5] Verificando instalaciones previas...
if exist node_modules (
    echo [ADVERTENCIA] Encontrado directorio node_modules anterior
    set /p CLEAN="Deseas eliminarlo y hacer una instalacion limpia? (S/N): "
    if /i "!CLEAN!"=="S" (
        echo Eliminando node_modules...
        rd /s /q node_modules 2>nul
        del /f /q package-lock.json 2>nul
        echo [OK] Limpieza completada
    ) else (
        echo [INFO] Manteniendo instalacion anterior
    )
) else (
    echo [OK] No se encontraron instalaciones previas
)

REM Paso 4: Instalar dependencias
echo.
echo [Paso 4/5] Instalando dependencias...
echo [ADVERTENCIA] Esto puede tomar 2-5 minutos dependiendo de tu conexion
echo.

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al instalar dependencias
    echo.
    echo Intenta ejecutar manualmente: npm install
    pause
    exit /b 1
)

echo [OK] Dependencias instaladas correctamente

REM Paso 5: Verificar instalación
echo.
echo [Paso 5/5] Verificando instalacion...

if not exist node_modules (
    echo [ERROR] No se creo el directorio node_modules
    pause
    exit /b 1
)

if exist node_modules\react\package.json (
    if exist node_modules\firebase\package.json (
        if exist node_modules\tailwindcss\package.json (
            echo [OK] Paquetes criticos verificados: React, Firebase, Tailwind
        )
    )
)

REM Resumen
echo.
echo ========================================================
echo   Instalacion Completada Exitosamente
echo ========================================================
echo.
echo [OK] Proyecto TutorApp Colombia listo para usar
echo.
echo --------------------------------------------------------
echo   Proximos Pasos:
echo --------------------------------------------------------
echo.
echo   1. Ejecutar en modo desarrollo:
echo      npm run dev
echo.
echo   2. Abrir en navegador:
echo      http://localhost:5173
echo.
echo   3. (Opcional) Configurar Firebase:
echo      Edita el archivo: firebase.ts
echo      Lee: README_FIREBASE_SETUP.md
echo.
echo --------------------------------------------------------
echo.

REM Preguntar si desea ejecutar
set /p RUN="Deseas ejecutar la aplicacion ahora? (S/N): "
if /i "%RUN%"=="S" (
    echo.
    echo [INFO] Iniciando servidor de desarrollo...
    echo.
    echo [OK] La aplicacion se abrira en: http://localhost:5173
    echo.
    echo [ADVERTENCIA] Presiona Ctrl+C para detener el servidor
    echo.
    call npm run dev
) else (
    echo.
    echo [INFO] Para ejecutar la aplicacion mas tarde, usa: npm run dev
    echo.
)

echo.
echo [OK] Disfruta tu aplicacion de tutorias!
echo.
pause
