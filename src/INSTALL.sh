#!/bin/bash

# Script de Instalación Automatizada - TutorApp Colombia
# Este script instala todas las dependencias y configura el proyecto

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🎓 TutorApp Colombia - Instalación Automática         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Paso 1: Verificar Node.js
echo ""
print_info "Paso 1/5: Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    echo ""
    echo "Por favor, instala Node.js desde: https://nodejs.org/"
    echo "Versión recomendada: 18.x o superior"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js instalado: $NODE_VERSION"

# Paso 2: Verificar npm
print_info "Paso 2/5: Verificando npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm instalado: v$NPM_VERSION"

# Paso 3: Limpiar instalaciones previas (opcional)
echo ""
print_info "Paso 3/5: Limpiando instalaciones previas..."
if [ -d "node_modules" ]; then
    print_warning "Encontrado directorio node_modules anterior"
    read -p "¿Deseas eliminarlo y hacer una instalación limpia? (s/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -rf node_modules
        rm -f package-lock.json
        print_success "Limpieza completada"
    else
        print_info "Manteniendo instalación anterior"
    fi
else
    print_success "No se encontraron instalaciones previas"
fi

# Paso 4: Instalar dependencias
echo ""
print_info "Paso 4/5: Instalando dependencias..."
print_warning "Esto puede tomar 2-5 minutos dependiendo de tu conexión"
echo ""

if npm install; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error al instalar dependencias"
    echo ""
    echo "Intenta ejecutar manualmente: npm install"
    exit 1
fi

# Paso 5: Verificar instalación
echo ""
print_info "Paso 5/5: Verificando instalación..."

# Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
    print_error "No se creó el directorio node_modules"
    exit 1
fi

# Contar paquetes instalados
PACKAGE_COUNT=$(ls node_modules | wc -l)
print_success "Se instalaron aproximadamente $PACKAGE_COUNT paquetes"

# Verificar archivos críticos
if [ -f "node_modules/react/package.json" ] && \
   [ -f "node_modules/firebase/package.json" ] && \
   [ -f "node_modules/tailwindcss/package.json" ]; then
    print_success "Paquetes críticos verificados: React, Firebase, Tailwind"
else
    print_warning "Algunos paquetes críticos podrían faltar"
fi

# Resumen de instalación
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Instalación Completada Exitosamente                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

print_success "Proyecto TutorApp Colombia listo para usar"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📋 Próximos Pasos:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1️⃣  Ejecutar en modo desarrollo:"
echo "      npm run dev"
echo ""
echo "  2️⃣  Abrir en navegador:"
echo "      http://localhost:5173"
echo ""
echo "  3️⃣  (Opcional) Configurar Firebase:"
echo "      Edita el archivo: firebase.ts"
echo "      Lee: README_FIREBASE_SETUP.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Preguntar si desea ejecutar inmediatamente
read -p "¿Deseas ejecutar la aplicación ahora? (s/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    print_info "Iniciando servidor de desarrollo..."
    echo ""
    print_success "La aplicación se abrirá en: http://localhost:5173"
    echo ""
    print_warning "Presiona Ctrl+C para detener el servidor"
    echo ""
    npm run dev
else
    echo ""
    print_info "Para ejecutar la aplicación más tarde, usa: npm run dev"
    echo ""
fi

echo ""
print_success "¡Disfruta tu aplicación de tutorías! 🎓📚"
echo ""
