#!/bin/bash

echo "================================================"
echo "  DIAGNÓSTICO Y SOLUCIÓN DE ESTILOS TAILWIND"
echo "================================================"
echo ""

echo "[1/3] Ejecutando diagnóstico..."
node DIAGNOSTICO_COMPLETO.js

if [ $? -ne 0 ]; then
    echo ""
    echo "[!] Se encontraron errores. Intentando solucionar..."
    echo ""
    
    echo "[2/3] Instalando dependencias..."
    npm install
    
    echo ""
    echo "[3/3] Iniciando servidor..."
    echo ""
    echo "================================================"
    echo "  IMPORTANTE: Abre http://localhost:5173"
    echo "  Presiona Ctrl+Shift+R para limpiar caché"
    echo "================================================"
    echo ""
    npm run dev
else
    echo ""
    echo "[OK] ¡Todo está configurado correctamente!"
    echo ""
    echo "[2/3] Iniciando servidor..."
    echo ""
    echo "================================================"
    echo "  IMPORTANTE: Abre http://localhost:5173"
    echo "  Presiona Ctrl+Shift+R para limpiar caché"
    echo "================================================"
    echo ""
    npm run dev
fi
