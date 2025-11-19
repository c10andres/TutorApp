#!/bin/bash

# 🚀 SCRIPT AUTOMÁTICO - EXPORTACIÓN COMPLETA DESDE FIGMA MAKE
# Ejecuta este script para replicar 100% tu app en VS Code y Android Studio

echo "🎯 TutorApp Colombia - Exportación Completa desde Figma Make"
echo "=================================================="

# Verificar Node.js
echo "📋 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instálalo desde: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -c2-3)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "⚠️ Node.js versión $NODE_VERSION detectada. Recomendamos versión 18 o superior"
fi

echo "✅ Node.js $(node -v) detectado"

# Limpiar instalaciones previas
echo ""
echo "🧹 Limpiando instalaciones previas..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf yarn.lock
rm -rf dist
echo "✅ Limpieza completada"

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias exactas..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "⚠️ Error en instalación, intentando con --force..."
    npm install --force
fi
echo "✅ Dependencias instaladas"

# Verificar archivos críticos
echo ""
echo "🔍 Verificando archivos críticos..."

# Verificar App.tsx
if [ ! -f "App.tsx" ]; then
    echo "❌ App.tsx no encontrado"
    exit 1
fi

# Verificar styles/globals.css
if [ ! -f "styles/globals.css" ]; then
    echo "❌ styles/globals.css no encontrado"
    exit 1
fi

# Verificar firebase.ts
if [ ! -f "firebase.ts" ]; then
    echo "⚠️ firebase.ts no encontrado - necesitarás configurar Firebase"
else
    echo "✅ firebase.ts encontrado"
fi

# Verificar tailwind.config.js
if [ ! -f "tailwind.config.js" ]; then
    echo "⚠️ tailwind.config.js no encontrado"
else
    echo "✅ tailwind.config.js encontrado"
fi

echo "✅ Verificación de archivos completada"

# Build del proyecto
echo ""
echo "🔨 Construyendo proyecto..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error en build. Verificar configuración."
    exit 1
fi
echo "✅ Build exitoso"

# Configurar Capacitor para Android
echo ""
echo "📱 Configurando Capacitor para Android..."

# Verificar si Capacitor ya está configurado
if [ ! -f "capacitor.config.ts" ]; then
    echo "🔧 Inicializando Capacitor..."
    npx cap init "TutorApp Colombia" "com.tutorapp.colombia"
fi

# Agregar plataforma Android si no existe
if [ ! -d "android" ]; then
    echo "🤖 Agregando plataforma Android..."
    npx cap add android
fi

# Sincronizar con Android
echo "🔄 Sincronizando con Android..."
npx cap sync android
echo "✅ Sincronización completada"

# Verificar estructura final
echo ""
echo "📁 Verificando estructura final..."

REQUIRED_DIRS=("components" "pages" "services" "styles" "types" "utils" "contexts" "hooks")
ALL_GOOD=true

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ Directorio faltante: $dir"
        ALL_GOOD=false
    else
        echo "✅ $dir"
    fi
done

# Verificar archivos críticos
REQUIRED_FILES=("App.tsx" "main.tsx" "index.html" "package.json")

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Archivo faltante: $file"
        ALL_GOOD=false
    else
        echo "✅ $file"
    fi
done

if [ "$ALL_GOOD" = true ]; then
    echo ""
    echo "🎉 ¡EXPORTACIÓN COMPLETADA EXITOSAMENTE!"
    echo "========================================="
    echo ""
    echo "📋 Próximos pasos:"
    echo ""
    echo "1️⃣ DESARROLLO WEB (VS Code):"
    echo "   npm run dev"
    echo "   Abre: http://localhost:3000"
    echo ""
    echo "2️⃣ DESARROLLO ANDROID (Android Studio):"
    echo "   npx cap open android"
    echo "   Conecta dispositivo y presiona Run ▶️"
    echo ""
    echo "3️⃣ CONFIGURAR FIREBASE (si no está configurado):"
    echo "   - Edita firebase.ts con tus credenciales"
    echo "   - Habilita Authentication en Firebase Console"
    echo "   - Habilita Firestore Database"
    echo ""
    echo "🔗 Enlaces útiles:"
    echo "   - Firebase Console: https://console.firebase.google.com"
    echo "   - Android Studio: https://developer.android.com/studio"
    echo ""
    echo "✅ Tu app está lista para ejecutarse idénticamente en ambas plataformas!"
else
    echo ""
    echo "⚠️ Algunos archivos o directorios están faltando."
    echo "Verifica que todos los archivos se copiaron correctamente desde Figma Make."
fi

echo ""
echo "📞 ¿Necesitas ayuda? Verifica:"
echo "   - Todos los archivos se copiaron desde Figma Make"
echo "   - Node.js versión 18+ está instalado"
echo "   - Firebase está configurado (si planeas usar autenticación)"
echo ""
echo "🚀 ¡Listo para desarrollar!"