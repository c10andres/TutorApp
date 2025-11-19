#!/bin/bash

# 🎨 Script Automático para Arreglar Estilos de Tailwind en VS Code
# Este script soluciona el problema de estilos que no se cargan

echo "========================================"
echo "🎨 ARREGLANDO ESTILOS DE TAILWIND"
echo "========================================"
echo ""

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paso 1: Verificar Node.js
echo -e "${YELLOW}[1/6] Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Por favor instala Node.js desde: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
echo ""

# Paso 2: Limpiar instalación anterior
echo -e "${YELLOW}[2/6] Limpiando archivos antiguos...${NC}"
rm -rf node_modules 2>/dev/null && echo -e "${GREEN}✅ node_modules eliminado${NC}" || echo -e "${YELLOW}⚠️  node_modules no existe${NC}"
rm -rf package-lock.json 2>/dev/null && echo -e "${GREEN}✅ package-lock.json eliminado${NC}" || echo -e "${YELLOW}⚠️  package-lock.json no existe${NC}"
rm -rf .vite 2>/dev/null && echo -e "${GREEN}✅ .vite eliminado${NC}" || echo -e "${YELLOW}⚠️  .vite no existe${NC}"
rm -rf node_modules/.vite 2>/dev/null && echo -e "${GREEN}✅ Caché de Vite eliminada${NC}" || echo -e "${YELLOW}⚠️  Caché no existe${NC}"
rm -rf dist 2>/dev/null && echo -e "${GREEN}✅ dist eliminado${NC}" || echo -e "${YELLOW}⚠️  dist no existe${NC}"
echo ""

# Paso 3: Verificar archivos críticos
echo -e "${YELLOW}[3/6] Verificando archivos críticos...${NC}"

if [ ! -f "styles/globals.css" ]; then
    echo -e "${RED}❌ ERROR: styles/globals.css no existe${NC}"
    exit 1
fi
echo -e "${GREEN}✅ styles/globals.css existe${NC}"

if [ ! -f "tailwind.config.js" ]; then
    echo -e "${RED}❌ ERROR: tailwind.config.js no existe${NC}"
    exit 1
fi
echo -e "${GREEN}✅ tailwind.config.js existe${NC}"

if [ ! -f "postcss.config.js" ]; then
    echo -e "${RED}❌ ERROR: postcss.config.js no existe${NC}"
    exit 1
fi
echo -e "${GREEN}✅ postcss.config.js existe${NC}"

if [ ! -f "main.tsx" ]; then
    echo -e "${RED}❌ ERROR: main.tsx no existe${NC}"
    exit 1
fi
echo -e "${GREEN}✅ main.tsx existe${NC}"

# Verificar que main.tsx importa el CSS
if ! grep -q "import './styles/globals.css'" main.tsx; then
    echo -e "${RED}❌ ERROR: main.tsx no importa styles/globals.css${NC}"
    exit 1
fi
echo -e "${GREEN}✅ main.tsx importa el CSS correctamente${NC}"
echo ""

# Paso 4: Limpiar caché de npm
echo -e "${YELLOW}[4/6] Limpiando caché de npm...${NC}"
npm cache clean --force 2>/dev/null
echo -e "${GREEN}✅ Caché limpiada${NC}"
echo ""

# Paso 5: Instalar dependencias
echo -e "${YELLOW}[5/6] Instalando dependencias...${NC}"
echo "Esto puede tomar unos minutos..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
else
    echo -e "${RED}❌ ERROR: Falló la instalación de dependencias${NC}"
    exit 1
fi
echo ""

# Paso 6: Crear archivo de configuración de VS Code si no existe
echo -e "${YELLOW}[6/6] Configurando VS Code...${NC}"
mkdir -p .vscode

cat > .vscode/settings.json << 'EOF'
{
  "css.validate": true,
  "tailwindCSS.emmetCompletions": true,
  "editor.quickSuggestions": {
    "strings": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
EOF

echo -e "${GREEN}✅ Configuración de VS Code creada${NC}"
echo ""

# Resumen final
echo "========================================"
echo -e "${GREEN}✅ ¡COMPLETADO!${NC}"
echo "========================================"
echo ""
echo "Ahora ejecuta:"
echo -e "${YELLOW}npm run dev${NC}"
echo ""
echo "Y abre en tu navegador:"
echo -e "${YELLOW}http://localhost:5173${NC}"
echo ""
echo "Los estilos deberían verse correctamente."
echo ""
echo "Si aún no funciona, revisa:"
echo "- SOLUCION_ESTILOS_VS_CODE.md"
echo "- La consola del navegador (F12) para ver errores"
echo ""
echo "========================================"
