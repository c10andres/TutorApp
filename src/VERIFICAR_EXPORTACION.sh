#!/bin/bash

# 🔍 SCRIPT DE VERIFICACIÓN - Asegurar que la exportación está 100% completa

echo "🔍 TutorApp Colombia - Verificación de Exportación Completa"
echo "=========================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar archivos
check_file() {
    if [ -f "$1" ]; then
        echo -e "✅ ${GREEN}$1${NC}"
        return 0
    else
        echo -e "❌ ${RED}$1 - FALTANTE${NC}"
        return 1
    fi
}

# Función para verificar directorios
check_dir() {
    if [ -d "$1" ]; then
        file_count=$(find "$1" -type f | wc -l)
        echo -e "✅ ${GREEN}$1/${NC} (${file_count} archivos)"
        return 0
    else
        echo -e "❌ ${RED}$1/ - DIRECTORIO FALTANTE${NC}"
        return 1
    fi
}

# Función para verificar contenido de archivo
check_file_content() {
    if [ -f "$1" ]; then
        if grep -q "$2" "$1"; then
            echo -e "✅ ${GREEN}$1 contiene: $2${NC}"
            return 0
        else
            echo -e "⚠️ ${YELLOW}$1 no contiene: $2${NC}"
            return 1
        fi
    else
        echo -e "❌ ${RED}$1 no existe${NC}"
        return 1
    fi
}

echo ""
echo -e "${BLUE}📋 1. VERIFICANDO ARCHIVOS PRINCIPALES${NC}"
echo "----------------------------------------"

MAIN_FILES=(
    "App.tsx"
    "main.tsx"
    "index.html"
    "package.json"
    "vite.config.ts"
    "tailwind.config.js"
    "tsconfig.json"
    "capacitor.config.ts"
)

missing_main=0
for file in "${MAIN_FILES[@]}"; do
    if ! check_file "$file"; then
        ((missing_main++))
    fi
done

echo ""
echo -e "${BLUE}📁 2. VERIFICANDO ESTRUCTURA DE DIRECTORIOS${NC}"
echo "----------------------------------------------"

REQUIRED_DIRS=(
    "components"
    "components/ui"
    "pages"
    "services"
    "contexts"
    "hooks"
    "types"
    "utils"
    "styles"
    "public"
)

missing_dirs=0
for dir in "${REQUIRED_DIRS[@]}"; do
    if ! check_dir "$dir"; then
        ((missing_dirs++))
    fi
done

echo ""
echo -e "${BLUE}🎨 3. VERIFICANDO COMPONENTES PRINCIPALES${NC}"
echo "--------------------------------------------"

COMPONENT_FILES=(
    "components/MobileNavigation.tsx"
    "components/ResponsiveContainer.tsx"
    "components/TutorCard.tsx"
    "components/SimpleToast.tsx"
    "components/FirebaseIndexAlert.tsx"
    "components/ui/button.tsx"
    "components/ui/card.tsx"
    "components/ui/input.tsx"
    "components/ui/dialog.tsx"
)

missing_components=0
for file in "${COMPONENT_FILES[@]}"; do
    if ! check_file "$file"; then
        ((missing_components++))
    fi
done

echo ""
echo -e "${BLUE}📄 4. VERIFICANDO PÁGINAS${NC}"
echo "----------------------------"

PAGE_FILES=(
    "pages/HomePage.tsx"
    "pages/LoginPage.tsx"
    "pages/RegisterPage.tsx"
    "pages/SearchPage.tsx"
    "pages/ProfilePage.tsx"
    "pages/ChatPage.tsx"
    "pages/RequestsPage.tsx"
    "pages/RequestTutoringPage.tsx"
    "pages/ReviewPage.tsx"
    "pages/PaymentsPage.tsx"
    "pages/AcademicManagementPage.tsx"
    "pages/UniversityDocsPage.tsx"
    "pages/SmartMatchingPage.tsx"
    "pages/AcademicPredictorPage.tsx"
    "pages/StudyPlannerPage.tsx"
    "pages/SupportPage.tsx"
    "pages/AppDemoPage.tsx"
    "pages/ForgotPasswordPage.tsx"
)

missing_pages=0
for file in "${PAGE_FILES[@]}"; do
    if ! check_file "$file"; then
        ((missing_pages++))
    fi
done

echo ""
echo -e "${BLUE}⚙️ 5. VERIFICANDO SERVICIOS${NC}"
echo "------------------------------"

SERVICE_FILES=(
    "services/auth.ts"
    "services/users.ts"
    "services/tutoring.ts"
    "services/chat.ts"
    "services/payment.ts"
    "services/reviews.ts"
    "services/notifications.ts"
    "services/academic.ts"
    "services/university-docs.ts"
    "services/support.ts"
)

missing_services=0
for file in "${SERVICE_FILES[@]}"; do
    if ! check_file "$file"; then
        ((missing_services++))
    fi
done

echo ""
echo -e "${BLUE}🔧 6. VERIFICANDO CONFIGURACIÓN${NC}"
echo "--------------------------------"

# Verificar contenido crítico
check_file_content "App.tsx" "AuthProvider"
check_file_content "App.tsx" "MobileNavigation"
check_file_content "styles/globals.css" "@tailwind"
check_file_content "package.json" "TutorApp"
check_file_content "vite.config.ts" "react"

echo ""
echo -e "${BLUE}📱 7. VERIFICANDO CAPACITOR${NC}"
echo "------------------------------"

if [ -f "capacitor.config.ts" ]; then
    check_file_content "capacitor.config.ts" "tutorapp.colombia"
    if [ -d "android" ]; then
        echo -e "✅ ${GREEN}Plataforma Android configurada${NC}"
    else
        echo -e "⚠️ ${YELLOW}Plataforma Android no encontrada${NC}"
    fi
else
    echo -e "❌ ${RED}Capacitor no configurado${NC}"
fi

echo ""
echo -e "${BLUE}🔥 8. VERIFICANDO FIREBASE${NC}"
echo "-----------------------------"

if [ -f "firebase.ts" ]; then
    if check_file_content "firebase.ts" "apiKey"; then
        echo -e "✅ ${GREEN}Firebase configurado${NC}"
    else
        echo -e "⚠️ ${YELLOW}Firebase configurado pero sin credenciales${NC}"
    fi
else
    echo -e "⚠️ ${YELLOW}firebase.ts no encontrado - usar FIREBASE_CONFIG_TEMPLATE.ts${NC}"
fi

echo ""
echo -e "${BLUE}📦 9. VERIFICANDO DEPENDENCIAS${NC}"
echo "--------------------------------"

if [ -d "node_modules" ]; then
    echo -e "✅ ${GREEN}node_modules existe${NC}"
    
    # Verificar algunas dependencias críticas
    CRITICAL_DEPS=("react" "vite" "tailwindcss" "firebase" "lucide-react")
    
    for dep in "${CRITICAL_DEPS[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            echo -e "  ✅ ${GREEN}$dep${NC}"
        else
            echo -e "  ❌ ${RED}$dep faltante${NC}"
        fi
    done
else
    echo -e "❌ ${RED}node_modules no existe - ejecutar: npm install${NC}"
fi

echo ""
echo -e "${BLUE}🏗️ 10. VERIFICANDO BUILD${NC}"
echo "-----------------------------"

if [ -d "dist" ]; then
    if [ -f "dist/index.html" ]; then
        echo -e "✅ ${GREEN}Build existente en dist/${NC}"
    else
        echo -e "⚠️ ${YELLOW}dist/ existe pero incompleto${NC}"
    fi
else
    echo -e "⚠️ ${YELLOW}No hay build - ejecutar: npm run build${NC}"
fi

echo ""
echo "================================================================"
echo -e "${BLUE}📊 RESUMEN DE VERIFICACIÓN${NC}"
echo "================================================================"

total_issues=$((missing_main + missing_dirs + missing_components + missing_pages + missing_services))

if [ $total_issues -eq 0 ]; then
    echo -e "🎉 ${GREEN}¡EXPORTACIÓN COMPLETA Y CORRECTA!${NC}"
    echo ""
    echo -e "${GREEN}✅ Todos los archivos principales están presentes${NC}"
    echo -e "${GREEN}✅ Estructura de directorios completa${NC}"
    echo -e "${GREEN}✅ Componentes principales verificados${NC}"
    echo -e "${GREEN}✅ Todas las páginas están presentes${NC}"
    echo -e "${GREEN}✅ Servicios completos${NC}"
    echo ""
    echo -e "${BLUE}🚀 PRÓXIMOS PASOS:${NC}"
    echo "1. Configurar Firebase (si no está configurado)"
    echo "2. Ejecutar: npm run dev"
    echo "3. Para Android: npx cap open android"
else
    echo -e "⚠️ ${YELLOW}EXPORTACIÓN INCOMPLETA${NC}"
    echo ""
    echo -e "${RED}❌ Archivos principales faltantes: $missing_main${NC}"
    echo -e "${RED}❌ Directorios faltantes: $missing_dirs${NC}"
    echo -e "${RED}❌ Componentes faltantes: $missing_components${NC}"
    echo -e "${RED}❌ Páginas faltantes: $missing_pages${NC}"
    echo -e "${RED}❌ Servicios faltantes: $missing_services${NC}"
    echo ""
    echo -e "${YELLOW}🔧 ACCIONES REQUERIDAS:${NC}"
    echo "1. Verificar que todos los archivos se copiaron desde Figma Make"
    echo "2. Ejecutar: ./COMANDO_EXPORTACION_RAPIDA.sh"
    echo "3. Verificar nuevamente con: ./VERIFICAR_EXPORTACION.sh"
fi

echo ""
echo -e "${BLUE}📋 COMANDOS ÚTILES:${NC}"
echo "-------------------"
echo "Instalar dependencias: npm install"
echo "Desarrollo web: npm run dev"
echo "Build: npm run build"
echo "Android: npx cap open android"
echo "Verificar: ./VERIFICAR_EXPORTACION.sh"

exit $total_issues