#!/bin/bash

# 🔍 SCRIPT DE VERIFICACIÓN TUTORAPP
# Este script verifica que todo esté configurado correctamente

echo "🔍 VERIFICANDO TUTORAPP..."
echo "=========================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Verificar Node.js
echo "1️⃣  Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
    
    # Verificar versión
    NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${RED}❌ Node.js debe ser v18 o superior${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Node.js NO está instalado${NC}"
    echo "   Descargar desde: https://nodejs.org"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Verificar npm
echo "2️⃣  Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm instalado: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm NO está instalado${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Verificar archivos esenciales
echo "3️⃣  Verificando archivos esenciales..."
FILES=(
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "index.html"
    "main.tsx"
    "App.tsx"
    "firebase.ts"
    "styles/globals.css"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}   ✅ $file${NC}"
    else
        echo -e "${RED}   ❌ $file (FALTA)${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# 4. Verificar node_modules
echo "4️⃣  Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules existe${NC}"
    
    # Contar paquetes
    PKG_COUNT=$(ls -1 node_modules | wc -l)
    echo "   📦 $PKG_COUNT paquetes instalados"
else
    echo -e "${YELLOW}⚠️  node_modules NO existe${NC}"
    echo "   Ejecutar: npm install"
fi
echo ""

# 5. Verificar estructura de carpetas
echo "5️⃣  Verificando estructura de carpetas..."
DIRS=(
    "pages"
    "components"
    "services"
    "contexts"
    "types"
    "styles"
    "public"
)

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        FILES_COUNT=$(find "$dir" -type f | wc -l)
        echo -e "${GREEN}   ✅ $dir/ ($FILES_COUNT archivos)${NC}"
    else
        echo -e "${RED}   ❌ $dir/ (FALTA)${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# 6. Verificar Firebase
echo "6️⃣  Verificando configuración Firebase..."
if grep -q "udconecta-4bfff" firebase.ts 2>/dev/null; then
    echo -e "${GREEN}✅ Firebase configurado correctamente${NC}"
    echo "   Proyecto: udconecta-4bfff"
else
    echo -e "${RED}❌ Firebase NO está configurado${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 7. Verificar package.json
echo "7️⃣  Verificando package.json..."
if [ -f "package.json" ]; then
    if grep -q "\"react\"" package.json; then
        echo -e "${GREEN}✅ React configurado${NC}"
    fi
    if grep -q "\"firebase\"" package.json; then
        echo -e "${GREEN}✅ Firebase configurado${NC}"
    fi
    if grep -q "\"tailwindcss\"" package.json; then
        echo -e "${GREEN}✅ Tailwind CSS configurado${NC}"
    fi
    if grep -q "\"typescript\"" package.json; then
        echo -e "${GREEN}✅ TypeScript configurado${NC}"
    fi
fi
echo ""

# 8. Verificar tipos TypeScript
echo "8️⃣  Verificando tipos TypeScript..."
if [ -f "types/index.ts" ]; then
    if grep -q "export interface User" types/index.ts; then
        echo -e "${GREEN}✅ Tipos definidos correctamente${NC}"
    else
        echo -e "${RED}❌ Tipos incompletos${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Archivo de tipos NO existe${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 9. Contar páginas
echo "9️⃣  Contando páginas de la aplicación..."
if [ -d "pages" ]; then
    PAGE_COUNT=$(ls -1 pages/*.tsx 2>/dev/null | wc -l)
    echo -e "${GREEN}✅ $PAGE_COUNT páginas encontradas${NC}"
    
    # Listar páginas principales
    echo "   📄 Páginas:"
    ls -1 pages/*.tsx 2>/dev/null | head -5 | sed 's/^/      /'
    if [ "$PAGE_COUNT" -gt 5 ]; then
        echo "      ... y $((PAGE_COUNT - 5)) más"
    fi
fi
echo ""

# 10. Verificar componentes UI
echo "🔟 Verificando componentes UI..."
if [ -d "components/ui" ]; then
    UI_COUNT=$(ls -1 components/ui/*.tsx 2>/dev/null | wc -l)
    echo -e "${GREEN}✅ $UI_COUNT componentes UI (ShadCN)${NC}"
else
    echo -e "${YELLOW}⚠️  Carpeta components/ui NO existe${NC}"
fi
echo ""

# RESUMEN FINAL
echo "================================"
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "================================"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡TODO ESTÁ CORRECTO!${NC}"
    echo ""
    echo "✅ Configuración completa"
    echo "✅ Archivos presentes"
    echo "✅ Estructura correcta"
    echo ""
    echo "🚀 SIGUIENTE PASO:"
    echo "   npm run dev"
    echo ""
    echo "Luego abrir: http://localhost:5173"
else
    echo -e "${RED}❌ ERRORES ENCONTRADOS: $ERRORS${NC}"
    echo ""
    echo "🔧 ACCIONES REQUERIDAS:"
    
    if [ ! -d "node_modules" ]; then
        echo "   1. npm install"
    fi
    
    if [ $ERRORS -gt 0 ]; then
        echo "   2. Revisar archivos faltantes arriba"
        echo "   3. Consultar: INSTRUCCIONES_EJECUCION.md"
    fi
fi

echo ""
echo "📚 DOCUMENTACIÓN:"
echo "   - INSTRUCCIONES_EJECUCION.md"
echo "   - GUIA_REPLICACION_COMPLETA.md"
echo "   - README_FIREBASE_SETUP.md"
echo ""

exit $ERRORS
