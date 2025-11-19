#!/bin/bash

# Script para hacer ejecutables todos los scripts necesarios

echo "🔧 Haciendo scripts ejecutables..."
echo ""

chmod +x INSTALL.sh
chmod +x VERIFICAR_INSTALACION.sh
chmod +x diagnostico-estilos.js
chmod +x arreglar-estilos-automatico.js
chmod +x actualizar-gradle.sh
chmod +x build-android.sh
chmod +x fix-all-layouts.sh
chmod +x FIX_NAVEGACION_SCRIPT.sh
chmod +x ARREGLAR_ESTILOS.sh
chmod +x build-and-preview.sh

echo "✅ Scripts ahora son ejecutables"
echo ""
echo "Puedes ejecutarlos directamente:"
echo "  ./INSTALL.sh"
echo "  ./VERIFICAR_INSTALACION.sh"
echo "  node diagnostico-estilos.js"
echo "  node arreglar-estilos-automatico.js"
echo ""
