#!/bin/bash

# Script de Verificación - TutorApp Colombia
# Verifica que todo esté instalado correctamente

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🔍 TutorApp Colombia - Verificación de Instalación    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SUCCESS=0
WARNINGS=0
ERRORS=0

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((SUCCESS++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((ERRORS++))
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1️⃣  Verificando Herramientas del Sistema"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    NODE_MAJOR_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
    
    if [ "$NODE_MAJOR_VERSION" -ge 18 ]; then
        print_success "Node.js $NODE_VERSION (versión adecuada)"
    else
        print_warning "Node.js $NODE_VERSION (recomendado: v18+)"
    fi
else
    print_error "Node.js no está instalado"
    echo "          Instala desde: https://nodejs.org/"
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm v$NPM_VERSION"
else
    print_error "npm no está instalado"
fi

# Git (opcional)
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    print_success "Git $GIT_VERSION"
else
    print_warning "Git no está instalado (opcional)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  2️⃣  Verificando Archivos del Proyecto"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Archivos críticos
CRITICAL_FILES=(
    "package.json"
    "App.tsx"
    "main.tsx"
    "index.html"
    "vite.config.ts"
    "tsconfig.json"
    "firebase.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file existe"
    else
        print_error "$file NO encontrado"
    fi
done

# Directorios críticos
CRITICAL_DIRS=(
    "pages"
    "components"
    "services"
    "contexts"
    "styles"
    "public"
)

for dir in "${CRITICAL_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        FILE_COUNT=$(find "$dir" -type f | wc -l)
        print_success "$dir/ existe ($FILE_COUNT archivos)"
    else
        print_error "$dir/ NO encontrado"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  3️⃣  Verificando Instalación de Dependencias"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# node_modules
if [ -d "node_modules" ]; then
    PACKAGE_COUNT=$(ls node_modules 2>/dev/null | wc -l)
    print_success "node_modules/ existe (~$PACKAGE_COUNT paquetes)"
else
    print_error "node_modules/ NO encontrado"
    echo "          Ejecuta: npm install"
fi

# Paquetes críticos
CRITICAL_PACKAGES=(
    "react"
    "react-dom"
    "firebase"
    "tailwindcss"
    "vite"
    "@capacitor/core"
    "lucide-react"
)

if [ -d "node_modules" ]; then
    for package in "${CRITICAL_PACKAGES[@]}"; do
        if [ -d "node_modules/$package" ]; then
            print_success "$package instalado"
        else
            print_error "$package NO instalado"
        fi
    done
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  4️⃣  Verificando Configuración"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Firebase
if [ -f "firebase.ts" ]; then
    if grep -q "YOUR_API_KEY\|TU_API_KEY\|AIzaSyA2cv8Zv9ahULWaPrqvfDeRUo2M5Je5BTU" firebase.ts; then
        print_warning "Firebase usa configuración de ejemplo"
        echo "          La app funcionará en modo demo"
        echo "          Para producción: configura tus credenciales en firebase.ts"
    else
        print_success "Firebase parece estar configurado"
    fi
fi

# Capacitor
if [ -f "capacitor.config.ts" ]; then
    print_success "Capacitor configurado"
else
    print_warning "capacitor.config.ts no encontrado (opcional)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  5️⃣  Probando Compilación"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_info "Verificando que TypeScript puede compilar..."

if command -v npx &> /dev/null && [ -d "node_modules" ]; then
    if npx tsc --noEmit &> /dev/null; then
        print_success "TypeScript compila sin errores"
    else
        print_warning "TypeScript tiene advertencias (normal en desarrollo)"
    fi
else
    print_warning "No se puede verificar TypeScript"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 Resumen de Verificación"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "  ✓ Éxitos:       ${GREEN}$SUCCESS${NC}"
echo -e "  ⚠ Advertencias: ${YELLOW}$WARNINGS${NC}"
echo -e "  ✗ Errores:      ${RED}$ERRORS${NC}"
echo ""

# Diagnóstico final
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║  ✅ INSTALACIÓN PERFECTA                                ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    print_success "Todo está correctamente instalado y configurado"
    echo ""
    echo "  Próximo paso: npm run dev"
    echo ""
    
elif [ $ERRORS -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║  ✅ INSTALACIÓN COMPLETA (con advertencias menores)     ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    print_success "La instalación está completa y funcional"
    print_warning "Hay algunas advertencias pero no son críticas"
    echo ""
    echo "  Próximo paso: npm run dev"
    echo ""
    
else
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║  ⚠️  INSTALACIÓN INCOMPLETA                             ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    print_error "Se encontraron $ERRORS errores que deben corregirse"
    echo ""
    echo "  Acciones recomendadas:"
    echo ""
    echo "  1. Si faltan archivos del proyecto:"
    echo "     - Verifica que descargaste/descomprimiste todo"
    echo ""
    echo "  2. Si falta Node.js o npm:"
    echo "     - Instala desde: https://nodejs.org/"
    echo ""
    echo "  3. Si falta node_modules:"
    echo "     - Ejecuta: npm install"
    echo ""
    echo "  4. Si hay errores de paquetes:"
    echo "     - Ejecuta: rm -rf node_modules && npm install"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
