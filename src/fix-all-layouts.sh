#!/bin/bash

echo "🚀 Arreglando Layout en todas las páginas restantes..."

# Lista de archivos a procesar
files=(
    "pages/AcademicPredictorPage.tsx"
    "pages/ReviewPage.tsx" 
    "pages/AcademicManagementPage.tsx"
    "pages/UniversityDocsPage.tsx"
    "pages/RequestTutoringPage.tsx"
    "pages/PaymentsPage.tsx"
    "pages/SupportPage.tsx"
)

for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "📝 Procesando $file..."
        
        # Reemplazar Layout wrapper con div simple
        sed -i 's/<Layout currentPage="[^"]*" onNavigate={onNavigate}>/<div className="p-4">/g' "$file"
        
        # Cerrar div en lugar de Layout  
        sed -i 's/<\/Layout>/<\/div>/g' "$file"
        
        echo "✅ $file arreglado"
    else
        echo "⚠️  $file no encontrado"
    fi
done

echo ""
echo "🎉 ¡Todas las páginas han sido arregladas!"
echo "Ya no usan el componente Layout viejo."
echo "La navegación se maneja desde App.tsx"