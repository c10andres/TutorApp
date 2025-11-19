#!/bin/bash

# 📱 BUILD ANDROID - TUTORAPP

echo "📱 CONSTRUYENDO TUTORAPP PARA ANDROID"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Descarga desde: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"

echo ""
echo -e "${BLUE}1️⃣  Limpiando build anterior...${NC}"
rm -rf dist
echo -e "${GREEN}✅ Limpieza completada${NC}"
echo ""

echo -e "${BLUE}2️⃣  Construyendo aplicación web...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build falló${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build web completado${NC}"
echo ""

echo -e "${BLUE}3️⃣  Verificando archivos generados...${NC}"
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}   ✅ dist/index.html${NC}"
else
    echo -e "${RED}   ❌ dist/index.html no existe${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}4️⃣  Sincronizando con Android...${NC}"
npx cap sync android
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Sync falló${NC}"
    echo ""
    echo -e "${YELLOW}Posible solución:${NC}"
    echo "   npm install @capacitor/core @capacitor/cli @capacitor/android"
    exit 1
fi
echo -e "${GREEN}✅ Sincronización completada${NC}"
echo ""

echo -e "${BLUE}5️⃣  Abriendo Android Studio...${NC}"
npx cap open android
echo ""

echo -e "${GREEN}🎉 ¡PROCESO COMPLETADO!${NC}"
echo ""
echo "======================================"
echo "📋 SIGUIENTES PASOS EN ANDROID STUDIO:"
echo "======================================"
echo ""
echo "1. Espera a que Gradle sync termine"
echo "   (puede tardar 5-10 minutos la primera vez)"
echo ""
echo "2. Selecciona un dispositivo:"
echo "   - Emulador (crea uno si no tienes)"
echo "   - Dispositivo físico (conectado por USB)"
echo ""
echo "3. Click en el botón Play ▶️"
echo "   o presiona Shift + F10"
echo ""
echo "4. Espera a que compile e instale"
echo "   (primera vez puede tardar 5-10 minutos)"
echo ""
echo "======================================"
echo ""
echo -e "${YELLOW}💡 TIPS:${NC}"
echo "   • Si ves errores, ve a: File → Sync Project with Gradle Files"
echo "   • Para limpiar: Build → Clean Project"
echo "   • Para reconstruir: Build → Rebuild Project"
echo ""
echo -e "${BLUE}📚 Guía completa: GUIA_ANDROID_STUDIO.md${NC}"
echo ""
