@echo off
echo ================================================
echo   DIAGNOSTICO Y SOLUCION DE ESTILOS TAILWIND
echo ================================================
echo.

echo [1/3] Ejecutando diagnostico...
node DIAGNOSTICO_COMPLETO.js

if %errorlevel% neq 0 (
    echo.
    echo [!] Se encontraron errores. Intentando solucionar...
    echo.
    
    echo [2/3] Instalando dependencias...
    call npm install
    
    echo.
    echo [3/3] Iniciando servidor...
    echo.
    echo ================================================
    echo   IMPORTANTE: Abre http://localhost:5173
    echo   Presiona Ctrl+Shift+R para limpiar cache
    echo ================================================
    echo.
    call npm run dev
) else (
    echo.
    echo [OK] Todo esta configurado correctamente!
    echo.
    echo [2/3] Iniciando servidor...
    echo.
    echo ================================================
    echo   IMPORTANTE: Abre http://localhost:5173
    echo   Presiona Ctrl+Shift+R para limpiar cache
    echo ================================================
    echo.
    call npm run dev
)
