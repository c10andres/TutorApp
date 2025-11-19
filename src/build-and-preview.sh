#!/bin/bash

# 🔨 BUILD Y PREVIEW CORRECTO - TUTORAPP

echo "🔨 CONSTRUYENDO Y PREVISUALIZANDO TUTORAPP"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "Este script hará un build de producción y luego preview."
echo "Para desarrollo normal, usa: npm run dev"
echo ""
read -p "¿Continuar con build y preview? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Cancelado. Para desarrollo usa: npm run dev"
    exit 0
fi

echo ""
echo -e "${BLUE}1️⃣  Limpiando build anterior...${NC}"
rm -rf dist
echo -e "${GREEN}✅ Build anterior eliminado${NC}"
echo ""

echo -e "${BLUE}2️⃣  Ejecutando TypeScript compiler...${NC}"
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Errores de TypeScript encontrados${NC}"
    echo "Tip: Revisa los errores arriba y corrígelos antes de continuar"
    exit 1
fi
echo -e "${GREEN}✅ TypeScript OK${NC}"
echo ""

echo -e "${BLUE}3️⃣  Construyendo aplicación...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build falló${NC}"
    echo "Tip: Revisa los errores arriba"
    exit 1
fi
echo -e "${GREEN}✅ Build completado${NC}"
echo ""

echo -e "${BLUE}4️⃣  Verificando archivos generados...${NC}"
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}   ✅ dist/index.html${NC}"
else
    echo -e "${RED}   ❌ dist/index.html no existe${NC}"
    exit 1
fi

if [ -d "dist/assets" ]; then
    JS_COUNT=$(find dist/assets -name "*.js" | wc -l)
    CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)
    echo -e "${GREEN}   ✅ dist/assets/ ($JS_COUNT JS, $CSS_COUNT CSS)${NC}"
else
    echo -e "${RED}   ❌ dist/assets/ no existe${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}5️⃣  Mostrando tamaños de archivos...${NC}"
du -h dist/assets/* | sort -rh | head -5
echo ""

echo -e "${GREEN}🎉 ¡BUILD EXITOSO!${NC}"
echo ""
echo "=========================================="
echo "📋 INSTRUCCIONES:"
echo "=========================================="
echo ""
echo "Ahora ejecuta manualmente:"
echo -e "   ${BLUE}npm run preview${NC}"
echo ""
echo "Luego abre en navegador:"
echo "   http://localhost:4173"
echo ""
echo "⚠️  RECUERDA: Para desarrollo normal usa:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""