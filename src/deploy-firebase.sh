#!/bin/bash

# Script de Deployment Completo para Firebase - Mac/Linux
# TutorApp - Plataforma de Tutorías Colombia

echo "================================================"
echo "   DEPLOYMENT COMPLETO A FIREBASE - TutorApp   "
echo "================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables de control
ERRORS=0

# ===================
# 1. VERIFICAR FIREBASE CLI
# ===================
echo -e "${YELLOW}1. Verificando Firebase CLI...${NC}"
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}   ✗ Firebase CLI no está instalado${NC}"
    echo -e "${YELLOW}   Instala con: npm install -g firebase-tools${NC}"
    exit 1
fi
FIREBASE_VERSION=$(firebase --version 2>&1)
echo -e "${GREEN}   ✓ Firebase CLI instalado: $FIREBASE_VERSION${NC}"

# ===================
# 2. VERIFICAR AUTENTICACIÓN
# ===================
echo ""
echo -e "${YELLOW}2. Verificando autenticación...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}   ✗ No estás autenticado en Firebase${NC}"
    echo -e "${YELLOW}   Ejecuta: firebase login${NC}"
    exit 1
fi
echo -e "${GREEN}   ✓ Autenticado correctamente${NC}"

# Mostrar proyecto activo
PROJECT_ID=$(firebase use 2>&1 | grep "Active project" | awk '{print $NF}' | tr -d '()')
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}   ⚠ No hay proyecto activo configurado${NC}"
    echo -e "${YELLOW}   Configurando proyecto...${NC}"
    firebase use --add
    PROJECT_ID=$(firebase use 2>&1 | grep "Active project" | awk '{print $NF}' | tr -d '()')
fi
echo -e "${CYAN}   → Proyecto activo: $PROJECT_ID${NC}"

# ===================
# 3. VERIFICAR NODE_MODULES
# ===================
echo ""
echo -e "${YELLOW}3. Verificando dependencias...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   → Instalando dependencias (primera vez)...${NC}"
    if ! npm install; then
        echo -e "${RED}   ✗ Error instalando dependencias${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}   ✓ node_modules existe${NC}"
    echo -e "${YELLOW}   → Verificando actualizaciones...${NC}"
    npm install --silent
fi
echo -e "${GREEN}   ✓ Dependencias listas${NC}"

# ===================
# 4. LIMPIAR BUILD ANTERIOR
# ===================
echo ""
echo -e "${YELLOW}4. Limpiando build anterior...${NC}"
if [ -d "dist" ]; then
    rm -rf dist
    echo -e "${GREEN}   ✓ Carpeta dist eliminada${NC}"
else
    echo -e "${CYAN}   → No hay build anterior${NC}"
fi

# ===================
# 5. BUILD DEL PROYECTO
# ===================
echo ""
echo -e "${YELLOW}5. Compilando proyecto...${NC}"
echo -e "${CYAN}   → Ejecutando: npm run build${NC}"
if ! npm run build; then
    echo -e "${RED}   ✗ Error en el build${NC}"
    echo -e "${YELLOW}   Revisa los errores de TypeScript arriba${NC}"
    exit 1
fi

# Verificar que se creó la carpeta dist
if [ ! -d "dist" ]; then
    echo -e "${RED}   ✗ No se generó la carpeta dist${NC}"
    exit 1
fi

# Verificar que hay archivos en dist
FILE_COUNT=$(find dist -type f | wc -l)
if [ $FILE_COUNT -lt 1 ]; then
    echo -e "${RED}   ✗ La carpeta dist está vacía${NC}"
    exit 1
fi

echo -e "${GREEN}   ✓ Build completado ($FILE_COUNT archivos generados)${NC}"

# ===================
# 6. DESPLEGAR REGLAS DE FIRESTORE
# ===================
echo ""
echo -e "${YELLOW}6. Desplegando reglas de Firestore...${NC}"
if [ -f "firestore.rules" ]; then
    if firebase deploy --only firestore:rules; then
        echo -e "${GREEN}   ✓ Reglas de Firestore desplegadas${NC}"
    else
        echo -e "${YELLOW}   ⚠ Advertencia: Error desplegando reglas de Firestore${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}   ⚠ Archivo firestore.rules no encontrado${NC}"
    ((ERRORS++))
fi

# ===================
# 7. DESPLEGAR ÍNDICES DE FIRESTORE
# ===================
echo ""
echo -e "${YELLOW}7. Desplegando índices de Firestore...${NC}"
if [ -f "firestore.indexes.json" ]; then
    if firebase deploy --only firestore:indexes; then
        echo -e "${GREEN}   ✓ Índices de Firestore desplegados${NC}"
        echo -e "${CYAN}   → Los índices pueden tardar unos minutos en compilarse${NC}"
    else
        echo -e "${YELLOW}   ⚠ Advertencia: Error desplegando índices${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}   ⚠ Archivo firestore.indexes.json no encontrado${NC}"
    ((ERRORS++))
fi

# ===================
# 8. DESPLEGAR REGLAS DE STORAGE
# ===================
echo ""
echo -e "${YELLOW}8. Desplegando reglas de Storage...${NC}"
if [ -f "storage.rules" ]; then
    if firebase deploy --only storage:rules; then
        echo -e "${GREEN}   ✓ Reglas de Storage desplegadas${NC}"
    else
        echo -e "${YELLOW}   ⚠ Advertencia: Error desplegando reglas de Storage${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}   ⚠ Archivo storage.rules no encontrado${NC}"
    ((ERRORS++))
fi

# ===================
# 9. DESPLEGAR HOSTING
# ===================
echo ""
echo -e "${YELLOW}9. Desplegando aplicación a Firebase Hosting...${NC}"
echo -e "${CYAN}   → Esto puede tardar unos minutos...${NC}"
if firebase deploy --only hosting; then
    echo -e "${GREEN}   ✓ Hosting desplegado exitosamente${NC}"
else
    echo -e "${RED}   ✗ Error desplegando hosting${NC}"
    exit 1
fi

# ===================
# 10. OBTENER INFORMACIÓN DEL DEPLOYMENT
# ===================
echo ""
echo "================================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}   ✓✓✓ DEPLOYMENT COMPLETADO EXITOSAMENTE ✓✓✓  ${NC}"
else
    echo -e "${YELLOW}   ⚠⚠⚠ DEPLOYMENT COMPLETADO CON ADVERTENCIAS ⚠⚠⚠  ${NC}"
    echo -e "${YELLOW}   ($ERRORS advertencias)${NC}"
fi
echo "================================================"
echo ""

# Obtener URLs
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📱 INFORMACIÓN DE TU APLICACIÓN${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}🌐 URL Principal:${NC}"
echo -e "   https://$PROJECT_ID.web.app"
echo ""
echo -e "${YELLOW}🌐 URL Alternativa:${NC}"
echo -e "   https://$PROJECT_ID.firebaseapp.com"
echo ""
echo -e "${YELLOW}🔧 Firebase Console:${NC}"
echo -e "   https://console.firebase.google.com/project/$PROJECT_ID"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ===================
# 11. COMANDOS ÚTILES
# ===================
echo -e "${GREEN}📋 COMANDOS ÚTILES:${NC}"
echo ""
echo -e "${YELLOW}Ver logs de hosting:${NC}"
echo -e "   firebase hosting:channel:list"
echo ""
echo -e "${YELLOW}Ver todas las versiones:${NC}"
echo -e "   firebase hosting:releases:list"
echo ""
echo -e "${YELLOW}Revertir a versión anterior:${NC}"
echo -e "   firebase hosting:rollback"
echo ""
echo -e "${YELLOW}Ver estado de índices:${NC}"
echo -e "   → Ve a: https://console.firebase.google.com/project/$PROJECT_ID/firestore/indexes"
echo ""

# ===================
# 12. PRÓXIMOS PASOS
# ===================
echo -e "${GREEN}🚀 PRÓXIMOS PASOS:${NC}"
echo ""
echo -e "1. ${CYAN}Abre tu aplicación:${NC} https://$PROJECT_ID.web.app"
echo -e "2. ${CYAN}Verifica que funciona correctamente${NC}"
echo -e "3. ${CYAN}Revisa Firebase Console:${NC} https://console.firebase.google.com/project/$PROJECT_ID"
echo -e "4. ${CYAN}Configura dominios personalizados${NC} (opcional)"
echo -e "5. ${CYAN}Activa Analytics${NC} (opcional)"
echo ""

# ===================
# 13. RECORDATORIOS
# ===================
if [ $ERRORS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  RECORDATORIOS:${NC}"
    echo ""
    echo -e "- Revisa que los archivos de reglas existan"
    echo -e "- Verifica los índices en Firebase Console"
    echo -e "- Algunos índices pueden tardar en compilarse"
    echo ""
fi

echo -e "${GREEN}✨ ¡Deployment completado! ✨${NC}"
echo ""
