#!/bin/bash

# ====================================
# 🚀 INICIO RÁPIDO - TUTORAPP COLOMBIA
# ====================================
# Este script ejecuta todo automáticamente

# Colores
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║                                                              ║${NC}"
echo -e "${BOLD}${CYAN}║           🚀 INICIO RÁPIDO - TUTORAPP COLOMBIA              ║${NC}"
echo -e "${BOLD}${CYAN}║                                                              ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encuentra package.json${NC}"
    echo -e "${YELLOW}Asegúrate de estar en el directorio del proyecto.${NC}"
    exit 1
fi

echo -e "${BOLD}${GREEN}✅ Directorio correcto detectado${NC}"
echo ""

# 2. Verificar Node.js
echo -e "${BOLD}Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo -e "${YELLOW}Instala Node.js desde: https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js $NODE_VERSION instalado${NC}"
echo ""

# 3. Verificar npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm $NPM_VERSION instalado${NC}"
echo ""

# 4. Verificar si node_modules existe
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules ya existe${NC}"
    echo -e "${BOLD}¿Quieres reinstalar las dependencias? (recomendado si hay problemas)${NC}"
    echo -e "1) No, usar las dependencias existentes"
    echo -e "2) Sí, reinstalar todo (limpia caché)"
    read -p "Opción [1-2]: " REINSTALL_OPTION
    
    if [ "$REINSTALL_OPTION" = "2" ]; then
        echo ""
        echo -e "${BOLD}Limpiando node_modules y caché...${NC}"
        rm -rf node_modules
        rm -rf node_modules/.vite
        rm -rf node_modules/.cache
        echo -e "${GREEN}✅ Limpieza completada${NC}"
        echo ""
    fi
fi

# 5. Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}📦 INSTALANDO DEPENDENCIAS${NC}"
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}⏱️  Esto puede tomar 2-5 minutos...${NC}"
    echo ""
    
    npm install
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ Error al instalar dependencias${NC}"
        echo -e "${YELLOW}Intenta ejecutar manualmente: npm install${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependencias ya instaladas${NC}"
    echo ""
fi

# 6. Verificar archivos críticos
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🔍 VERIFICANDO CONFIGURACIÓN${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

CRITICAL_FILES=(
    "vite.config.ts"
    "tailwind.config.js"
    "postcss.config.js"
    "tsconfig.json"
    "App.tsx"
    "main.tsx"
    "styles/globals.css"
)

ALL_FILES_OK=true

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file ${RED}(FALTA)${NC}"
        ALL_FILES_OK=false
    fi
done

echo ""

if [ "$ALL_FILES_OK" = false ]; then
    echo -e "${RED}❌ Faltan archivos críticos${NC}"
    echo -e "${YELLOW}Verifica que el proyecto esté completo${NC}"
    exit 1
fi

# 7. Ofrecer ejecutar verificación completa
echo -e "${BOLD}¿Quieres ejecutar la verificación completa? (opcional)${NC}"
echo -e "1) No, continuar directamente"
echo -e "2) Sí, ejecutar verificación completa"
read -p "Opción [1-2]: " VERIFY_OPTION

if [ "$VERIFY_OPTION" = "2" ]; then
    echo ""
    if [ -f "verificar-todo.js" ]; then
        node verificar-todo.js
        echo ""
    else
        echo -e "${YELLOW}⚠️  verificar-todo.js no encontrado, continuando...${NC}"
        echo ""
    fi
fi

# 8. Iniciar servidor de desarrollo
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🚀 INICIANDO SERVIDOR DE DESARROLLO${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✨ El navegador se abrirá automáticamente${NC}"
echo -e "${GREEN}✨ Los estilos están configurados y listos${NC}"
echo -e "${GREEN}✨ Hot Module Replacement habilitado${NC}"
echo ""
echo -e "${BOLD}${YELLOW}Para detener el servidor: Ctrl+C${NC}"
echo ""
echo -e "${BOLD}Iniciando en 3 segundos...${NC}"
sleep 3

# Ejecutar el servidor
npm run dev

# Si el servidor se detiene
echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║                                                              ║${NC}"
echo -e "${BOLD}${CYAN}║                 Servidor detenido                            ║${NC}"
echo -e "${BOLD}${CYAN}║                                                              ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Para volver a ejecutar:${NC}"
echo -e "  ${CYAN}./inicio-rapido.sh${NC}"
echo -e "  ${CYAN}npm run dev${NC}"
echo ""
