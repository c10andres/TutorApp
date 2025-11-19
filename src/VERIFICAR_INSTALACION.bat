@echo off
setlocal enabledelayedexpansion

REM Script de Verificación - TutorApp Colombia (Windows)
REM Verifica que todo esté instalado correctamente

echo ========================================================
echo   TutorApp Colombia - Verificacion de Instalacion
echo ========================================================
echo.

set SUCCESS=0
set WARNINGS=0
set ERRORS=0

echo --------------------------------------------------------
echo   1. Verificando Herramientas del Sistema
echo --------------------------------------------------------
echo.

REM Node.js
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [OK] Node.js !NODE_VERSION!
    set /a SUCCESS+=1
) else (
    echo [ERROR] Node.js no esta instalado
    echo         Instala desde: https://nodejs.org/
    set /a ERRORS+=1
)

REM npm
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [OK] npm v!NPM_VERSION!
    set /a SUCCESS+=1
) else (
    echo [ERROR] npm no esta instalado
    set /a ERRORS+=1
)

REM Git (opcional)
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=3" %%i in ('git --version') do set GIT_VERSION=%%i
    echo [OK] Git !GIT_VERSION!
    set /a SUCCESS+=1
) else (
    echo [ADVERTENCIA] Git no esta instalado (opcional)
    set /a WARNINGS+=1
)

echo.
echo --------------------------------------------------------
echo   2. Verificando Archivos del Proyecto
echo --------------------------------------------------------
echo.

REM Archivos críticos
set FILES=package.json App.tsx main.tsx index.html vite.config.ts tsconfig.json firebase.ts

for %%f in (%FILES%) do (
    if exist %%f (
        echo [OK] %%f existe
        set /a SUCCESS+=1
    ) else (
        echo [ERROR] %%f NO encontrado
        set /a ERRORS+=1
    )
)

REM Directorios críticos
set DIRS=pages components services contexts styles public

for %%d in (%DIRS%) do (
    if exist %%d (
        echo [OK] %%d\ existe
        set /a SUCCESS+=1
    ) else (
        echo [ERROR] %%d\ NO encontrado
        set /a ERRORS+=1
    )
)

echo.
echo --------------------------------------------------------
echo   3. Verificando Instalacion de Dependencias
echo --------------------------------------------------------
echo.

REM node_modules
if exist node_modules (
    echo [OK] node_modules\ existe
    set /a SUCCESS+=1
) else (
    echo [ERROR] node_modules\ NO encontrado
    echo         Ejecuta: npm install
    set /a ERRORS+=1
)

REM Paquetes críticos
set PACKAGES=react react-dom firebase tailwindcss vite @capacitor lucide-react

if exist node_modules (
    for %%p in (%PACKAGES%) do (
        if exist node_modules\%%p (
            echo [OK] %%p instalado
            set /a SUCCESS+=1
        ) else (
            echo [ERROR] %%p NO instalado
            set /a ERRORS+=1
        )
    )
)

echo.
echo --------------------------------------------------------
echo   4. Verificando Configuracion
echo --------------------------------------------------------
echo.

REM Firebase
if exist firebase.ts (
    findstr /C:"YOUR_API_KEY" /C:"TU_API_KEY" /C:"AIzaSyA2cv8Zv9ahULWaPrqvfDeRUo2M5Je5BTU" firebase.ts >nul
    if !ERRORLEVEL! EQU 0 (
        echo [ADVERTENCIA] Firebase usa configuracion de ejemplo
        echo              La app funcionara en modo demo
        echo              Para produccion: configura firebase.ts
        set /a WARNINGS+=1
    ) else (
        echo [OK] Firebase parece estar configurado
        set /a SUCCESS+=1
    )
)

REM Capacitor
if exist capacitor.config.ts (
    echo [OK] Capacitor configurado
    set /a SUCCESS+=1
) else (
    echo [ADVERTENCIA] capacitor.config.ts no encontrado (opcional)
    set /a WARNINGS+=1
)

echo.
echo --------------------------------------------------------
echo   Resumen de Verificacion
echo --------------------------------------------------------
echo.
echo   Exitos:       %SUCCESS%
echo   Advertencias: %WARNINGS%
echo   Errores:      %ERRORS%
echo.

REM Diagnóstico final
if %ERRORS% EQU 0 (
    if %WARNINGS% EQU 0 (
        echo ========================================================
        echo   INSTALACION PERFECTA
        echo ========================================================
        echo.
        echo [OK] Todo esta correctamente instalado y configurado
        echo.
        echo   Proximo paso: npm run dev
        echo.
    ) else (
        echo ========================================================
        echo   INSTALACION COMPLETA (con advertencias menores)
        echo ========================================================
        echo.
        echo [OK] La instalacion esta completa y funcional
        echo [ADVERTENCIA] Hay algunas advertencias pero no son criticas
        echo.
        echo   Proximo paso: npm run dev
        echo.
    )
) else (
    echo ========================================================
    echo   INSTALACION INCOMPLETA
    echo ========================================================
    echo.
    echo [ERROR] Se encontraron %ERRORS% errores que deben corregirse
    echo.
    echo   Acciones recomendadas:
    echo.
    echo   1. Si faltan archivos del proyecto:
    echo      - Verifica que descargaste/descomprimiste todo
    echo.
    echo   2. Si falta Node.js o npm:
    echo      - Instala desde: https://nodejs.org/
    echo.
    echo   3. Si falta node_modules:
    echo      - Ejecuta: npm install
    echo.
    echo   4. Si hay errores de paquetes:
    echo      - Ejecuta: rmdir /s /q node_modules
    echo      - Luego: npm install
    echo.
)

echo --------------------------------------------------------
echo.
pause
