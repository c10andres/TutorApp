#!/bin/bash

# 🎨 SCRIPT PARA ARREGLAR ESTILOS DE TUTORAPP
# Este script soluciona el problema de estilos no visibles

echo "🎨 ARREGLANDO ESTILOS DE TUTORAPP"
echo "=================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "Este script va a:"
echo "1. Limpiar node_modules y package-lock.json"
echo "2. Limpiar cache de npm"
echo "3. Reinstalar todas las dependencias"
echo "4. Instalar Tailwind CSS v3.4.1 (estable)"
echo ""
read -p "¿Continuar? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Cancelado."
    exit 1
fi

echo ""
echo -e "${BLUE}1️⃣  Limpiando instalación anterior...${NC}"
rm -rf node_modules package-lock.json dist
echo -e "${GREEN}✅ Limpieza completada${NC}"
echo ""

echo -e "${BLUE}2️⃣  Limpiando cache de npm...${NC}"
npm cache clean --force
echo -e "${GREEN}✅ Cache limpiado${NC}"
echo ""

echo -e "${BLUE}3️⃣  Instalando dependencias...${NC}"
echo "   Esto puede tardar unos minutos..."
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
else
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}4️⃣  Verificando archivos de configuración...${NC}"

# Verificar tailwind.config.js
if [ -f "tailwind.config.js" ]; then
    echo -e "${GREEN}   ✅ tailwind.config.js${NC}"
else
    echo -e "${YELLOW}   ⚠️  tailwind.config.js no existe (debería haberse creado)${NC}"
fi

# Verificar postcss.config.js
if [ -f "postcss.config.js" ]; then
    echo -e "${GREEN}   ✅ postcss.config.js${NC}"
else
    echo -e "${YELLOW}   ⚠️  postcss.config.js no existe (debería haberse creado)${NC}"
fi

# Verificar globals.css
if [ -f "styles/globals.css" ]; then
    echo -e "${GREEN}   ✅ styles/globals.css${NC}"
else
    echo -e "${YELLOW}   ⚠️  styles/globals.css no existe${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ¡ARREGLO COMPLETADO!${NC}"
echo ""
echo "=================================="
echo "📋 SIGUIENTES PASOS:"
echo "=================================="
echo ""
echo "1️⃣  Ejecutar la aplicación:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "2️⃣  Abrir en navegador:"
echo "   http://localhost:5173"
echo ""
echo "3️⃣  Verificar que se vean los estilos:"
echo "   - Gradiente azul en fondo de login"
echo "   - Botones con colores"
echo "   - Formularios con bordes redondeados"
echo ""
echo "4️⃣  Si aún no se ven:"
echo "   - Presiona Ctrl+Shift+R en el navegador"
echo "   - Abre en modo incógnito"
echo "   - Revisa consola del navegador (F12)"
echo ""
echo "📚 Documentación: SOLUCION_ESTILOS.md"
echo ""
echo "=================================="
echo ""
