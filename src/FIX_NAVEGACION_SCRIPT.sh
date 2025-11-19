#!/bin/bash

# Script para arreglar la navegación en todas las páginas
# Remueve el Layout viejo y lo reemplaza con div simple

echo "🚀 Arreglando navegación en todas las páginas..."

# Función para procesar cada página
fix_page() {
    local page=$1
    echo "Procesando $page..."
    
    # Comentar import del Layout
    sed -i "s/import { Layout } from '..\/components\/Layout';/\/\/ Layout ahora se maneja desde App.tsx con ResponsiveContainer y MobileNavigation/" "pages/$page"
    
    # Reemplazar Layout wrapper con div simple
    sed -i 's/<Layout currentPage="[^"]*" onNavigate={onNavigate}>/<div className="p-4">/' "pages/$page"
    sed -i 's/<\/Layout>/<\/div>/' "pages/$page"
}

# Lista de páginas a arreglar
pages=(
    "ProfilePage.tsx"
    "ChatPage.tsx"
    "RequestsPage.tsx"
    "RequestTutoringPage.tsx"
    "ReviewPage.tsx"
    "PaymentsPage.tsx"
    "AcademicManagementPage.tsx"
    "UniversityDocsPage.tsx"
    "SmartMatchingPage.tsx"
    "AcademicPredictorPage.tsx"
    "StudyPlannerPage.tsx"
    "SupportPage.tsx"
)

# Procesar cada página
for page in "${pages[@]}"; do
    if [ -f "pages/$page" ]; then
        fix_page "$page"
        echo "✅ $page arreglada"
    else
        echo "⚠️  $page no encontrada"
    fi
done

echo ""
echo "🎉 ¡Navegación arreglada en todas las páginas!"
echo "Ahora solo se usa MobileNavigation vertical desde App.tsx"
echo ""
echo "📱 Para probar:"
echo "npm run dev"
echo "F12 → Device Mode → iPhone SE"
echo "Buscar botón azul 🍔 en esquina inferior derecha"