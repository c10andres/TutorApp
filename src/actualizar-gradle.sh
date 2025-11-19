#!/bin/bash

# 🔧 ACTUALIZAR GRADLE A 8.5 - TUTORAPP

echo "🔧 ACTUALIZANDO GRADLE A 8.5"
echo "============================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en la carpeta correcta
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Debes ejecutar este script desde la raíz del proyecto${NC}"
    echo -e "${YELLOW}   (la carpeta que contiene package.json)${NC}"
    exit 1
fi

# Verificar que existe la carpeta android
if [ ! -d "android" ]; then
    echo -e "${RED}❌ Error: No existe la carpeta 'android/'${NC}"
    echo -e "${YELLOW}   Primero ejecuta: npx cap add android${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Carpeta del proyecto verificada${NC}"
echo ""

echo -e "${BLUE}1️⃣  Actualizando gradle-wrapper.properties...${NC}"

# Archivo gradle-wrapper.properties
WRAPPER_FILE="android/gradle/wrapper/gradle-wrapper.properties"

if [ -f "$WRAPPER_FILE" ]; then
    # Hacer backup
    cp "$WRAPPER_FILE" "$WRAPPER_FILE.backup"
    
    # Actualizar versión de Gradle
    sed -i.bak 's|gradle-[0-9]*\.[0-9]*\(\.[0-9]*\)\?-bin\.zip|gradle-8.5-bin.zip|g' "$WRAPPER_FILE"
    rm "$WRAPPER_FILE.bak" 2>/dev/null
    
    echo -e "${GREEN}   ✅ gradle-wrapper.properties actualizado a Gradle 8.5${NC}"
else
    echo -e "${YELLOW}   ⚠️  No se encontró gradle-wrapper.properties${NC}"
    echo -e "${YELLOW}      Creando archivo...${NC}"
    
    mkdir -p "android/gradle/wrapper"
    
    cat > "$WRAPPER_FILE" << 'EOF'
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
EOF
    
    echo -e "${GREEN}   ✅ gradle-wrapper.properties creado${NC}"
fi

echo ""
echo -e "${BLUE}2️⃣  Actualizando build.gradle (Android Gradle Plugin)...${NC}"

# Archivo build.gradle
BUILD_FILE="android/build.gradle"

if [ -f "$BUILD_FILE" ]; then
    # Hacer backup
    cp "$BUILD_FILE" "$BUILD_FILE.backup"
    
    # Actualizar Android Gradle Plugin a 8.2.0
    sed -i.bak "s/classpath 'com\.android\.tools\.build:gradle:[0-9]*\.[0-9]*\(\.[0-9]*\)\?'/classpath 'com.android.tools.build:gradle:8.2.0'/g" "$BUILD_FILE"
    rm "$BUILD_FILE.bak" 2>/dev/null
    
    echo -e "${GREEN}   ✅ build.gradle actualizado (AGP 8.2.0)${NC}"
else
    echo -e "${YELLOW}   ⚠️  No se encontró build.gradle${NC}"
fi

echo ""
echo -e "${BLUE}3️⃣  Limpiando cache de Gradle...${NC}"

# Limpiar cache local
if [ -d "android/.gradle" ]; then
    rm -rf "android/.gradle"
    echo -e "${GREEN}   ✅ Limpiado android/.gradle${NC}"
fi

if [ -d "android/build" ]; then
    rm -rf "android/build"
    echo -e "${GREEN}   ✅ Limpiado android/build${NC}"
fi

echo ""
echo -e "${BLUE}4️⃣  Sincronizando con Capacitor...${NC}"

npx cap sync android

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Sincronización completada${NC}"
else
    echo -e "${YELLOW}   ⚠️  Hubo un problema al sincronizar${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ¡ACTUALIZACIÓN COMPLETADA!${NC}"
echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}📋 SIGUIENTES PASOS:${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo "1. Abre Android Studio:"
echo -e "   ${BLUE}npx cap open android${NC}"
echo ""
echo "2. Espera a que Gradle sync termine automáticamente"
echo "   (puede tardar 5-10 minutos la primera vez)"
echo ""
echo "3. Verás en la parte inferior:"
echo "   'Gradle sync completed successfully'"
echo ""
echo "4. Si hay problemas:"
echo "   File → Invalidate Caches → Invalidate and Restart"
echo ""
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "${YELLOW}📊 VERSIONES ACTUALIZADAS:${NC}"
echo "   • Gradle: 8.5"
echo "   • Android Gradle Plugin: 8.2.0"
echo "   • Compatible con: Java 21"
echo ""
echo -e "${BLUE}📚 Documentación completa: SOLUCION_GRADLE_JAVA.md${NC}"
echo ""
