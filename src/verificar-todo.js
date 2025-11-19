#!/usr/bin/env node

/**
 * 🔍 Verificación Completa de Configuración
 * Verifica que TODOS los archivos y configuraciones estén correctos
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const { reset, bright, green, red, yellow, cyan, magenta } = colors;

console.log(`\n${bright}${cyan}╔════════════════════════════════════════════════════════════════╗${reset}`);
console.log(`${bright}${cyan}║                                                                ║${reset}`);
console.log(`${bright}${cyan}║           🔍 VERIFICACIÓN COMPLETA - TUTORAPP                 ║${reset}`);
console.log(`${bright}${cyan}║                                                                ║${reset}`);
console.log(`${bright}${cyan}╚════════════════════════════════════════════════════════════════╝${reset}\n`);

let allGood = true;
let warnings = 0;
let errors = 0;

// ========================================
// 1. VERIFICAR ARCHIVOS CRÍTICOS
// ========================================
console.log(`${bright}${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
console.log(`${bright}1️⃣  ARCHIVOS CRÍTICOS${reset}\n`);

const criticalFiles = {
  'package.json': '📦 Configuración de npm',
  'vite.config.ts': '⚡ Configuración de Vite',
  'tailwind.config.js': '🎨 Configuración de Tailwind',
  'postcss.config.js': '🔧 Configuración de PostCSS',
  'tsconfig.json': '📘 Configuración de TypeScript',
  'index.html': '🌐 HTML principal',
  'main.tsx': '🚀 Punto de entrada',
  'App.tsx': '⚛️  Componente principal',
  'styles/globals.css': '🎨 Estilos globales',
};

for (const [file, description] of Object.entries(criticalFiles)) {
  if (fs.existsSync(file)) {
    console.log(`${green}✅${reset} ${file.padEnd(30)} - ${description}`);
  } else {
    console.log(`${red}❌${reset} ${file.padEnd(30)} - ${description} ${red}(FALTA!)${reset}`);
    allGood = false;
    errors++;
  }
}

// ========================================
// 2. VERIFICAR ARCHIVOS DE VS CODE
// ========================================
console.log(`\n${bright}${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
console.log(`${bright}2️⃣  CONFIGURACIÓN DE VS CODE${reset}\n`);

const vscodeFiles = {
  '.vscode/settings.json': '⚙️  Configuración de VS Code',
  '.vscode/extensions.json': '🧩 Extensiones recomendadas',
};

for (const [file, description] of Object.entries(vscodeFiles)) {
  if (fs.existsSync(file)) {
    console.log(`${green}✅${reset} ${file.padEnd(30)} - ${description}`);
  } else {
    console.log(`${yellow}⚠️${reset}  ${file.padEnd(30)} - ${description} ${yellow}(Opcional)${reset}`);
    warnings++;
  }
}

// ========================================
// 3. VERIFICAR CONTENIDO DE ARCHIVOS
// ========================================
console.log(`\n${bright}${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
console.log(`${bright}3️⃣  CONTENIDO DE ARCHIVOS${reset}\n`);

// Verificar main.tsx importa globals.css
try {
  const mainContent = fs.readFileSync('main.tsx', 'utf8');
  if (mainContent.includes("import './styles/globals.css'")) {
    console.log(`${green}✅${reset} main.tsx importa globals.css`);
  } else {
    console.log(`${red}❌${reset} main.tsx NO importa globals.css`);
    allGood = false;
    errors++;
  }
} catch (e) {
  console.log(`${red}❌${reset} Error leyendo main.tsx: ${e.message}`);
  allGood = false;
  errors++;
}

// Verificar globals.css tiene directivas de Tailwind
try {
  const cssContent = fs.readFileSync('styles/globals.css', 'utf8');
  const hasBase = cssContent.includes('@tailwind base');
  const hasComponents = cssContent.includes('@tailwind components');
  const hasUtilities = cssContent.includes('@tailwind utilities');
  
  if (hasBase && hasComponents && hasUtilities) {
    console.log(`${green}✅${reset} globals.css tiene todas las directivas de Tailwind`);
  } else {
    console.log(`${red}❌${reset} globals.css faltan directivas de Tailwind`);
    if (!hasBase) console.log(`   ${red}→ Falta: @tailwind base${reset}`);
    if (!hasComponents) console.log(`   ${red}→ Falta: @tailwind components${reset}`);
    if (!hasUtilities) console.log(`   ${red}→ Falta: @tailwind utilities${reset}`);
    allGood = false;
    errors++;
  }
} catch (e) {
  console.log(`${red}❌${reset} Error leyendo globals.css: ${e.message}`);
  allGood = false;
  errors++;
}

// Verificar vite.config.ts tiene configuración de CSS
try {
  const viteContent = fs.readFileSync('vite.config.ts', 'utf8');
  if (viteContent.includes('css:') && viteContent.includes('postcss')) {
    console.log(`${green}✅${reset} vite.config.ts configurado para PostCSS`);
  } else {
    console.log(`${yellow}⚠️${reset}  vite.config.ts puede no tener configuración de PostCSS`);
    warnings++;
  }
  
  if (viteContent.includes('devSourcemap: true')) {
    console.log(`${green}✅${reset} vite.config.ts tiene CSS source maps habilitados`);
  } else {
    console.log(`${yellow}⚠️${reset}  vite.config.ts sin CSS source maps (recomendado para debug)`);
    warnings++;
  }
} catch (e) {
  console.log(`${red}❌${reset} Error leyendo vite.config.ts: ${e.message}`);
  allGood = false;
  errors++;
}

// Verificar tailwind.config.js tiene content paths
try {
  const tailwindContent = fs.readFileSync('tailwind.config.js', 'utf8');
  const hasComponents = tailwindContent.includes('./components/**/*.{js,ts,jsx,tsx}');
  const hasPages = tailwindContent.includes('./pages/**/*.{js,ts,jsx,tsx}');
  const hasAppTsx = tailwindContent.includes('./App.tsx');
  
  if (hasComponents && hasPages && hasAppTsx) {
    console.log(`${green}✅${reset} tailwind.config.js detecta todos los archivos`);
  } else {
    console.log(`${yellow}⚠️${reset}  tailwind.config.js puede no detectar todos los archivos`);
    if (!hasComponents) console.log(`   ${yellow}→ Falta: ./components/**/*.{js,ts,jsx,tsx}${reset}`);
    if (!hasPages) console.log(`   ${yellow}→ Falta: ./pages/**/*.{js,ts,jsx,tsx}${reset}`);
    if (!hasAppTsx) console.log(`   ${yellow}→ Falta: ./App.tsx${reset}`);
    warnings++;
  }
} catch (e) {
  console.log(`${red}❌${reset} Error leyendo tailwind.config.js: ${e.message}`);
  allGood = false;
  errors++;
}

// ========================================
// 4. VERIFICAR PACKAGE.JSON
// ========================================
console.log(`\n${bright}${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
console.log(`${bright}4️⃣  PACKAGE.JSON${reset}\n`);

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Verificar script dev
  if (packageJson.scripts && packageJson.scripts.dev) {
    console.log(`${green}✅${reset} package.json tiene script 'dev'`);
  } else {
    console.log(`${red}❌${reset} package.json NO tiene script 'dev'`);
    allGood = false;
    errors++;
  }
  
  // Verificar dependencias de Tailwind
  const devDeps = packageJson.devDependencies || {};
  const hasTailwind = devDeps.tailwindcss;
  const hasPostcss = devDeps.postcss;
  const hasAutoprefixer = devDeps.autoprefixer;
  
  if (hasTailwind && hasPostcss && hasAutoprefixer) {
    console.log(`${green}✅${reset} Dependencias de Tailwind instaladas`);
    console.log(`   → Tailwind: ${devDeps.tailwindcss}`);
    console.log(`   → PostCSS: ${devDeps.postcss}`);
    console.log(`   → Autoprefixer: ${devDeps.autoprefixer}`);
  } else {
    console.log(`${red}❌${reset} Faltan dependencias de Tailwind`);
    if (!hasTailwind) console.log(`   ${red}→ Falta: tailwindcss${reset}`);
    if (!hasPostcss) console.log(`   ${red}→ Falta: postcss${reset}`);
    if (!hasAutoprefixer) console.log(`   ${red}→ Falta: autoprefixer${reset}`);
    allGood = false;
    errors++;
  }
  
  // Verificar React
  const deps = packageJson.dependencies || {};
  if (deps.react && deps['react-dom']) {
    console.log(`${green}✅${reset} React instalado: ${deps.react}`);
  } else {
    console.log(`${red}❌${reset} Falta React`);
    allGood = false;
    errors++;
  }
} catch (e) {
  console.log(`${red}❌${reset} Error leyendo package.json: ${e.message}`);
  allGood = false;
  errors++;
}

// ========================================
// 5. VERIFICAR NODE_MODULES
// ========================================
console.log(`\n${bright}${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
console.log(`${bright}5️⃣  DEPENDENCIAS${reset}\n`);

if (fs.existsSync('node_modules')) {
  console.log(`${green}✅${reset} node_modules existe`);
  
  // Verificar carpetas clave
  const keyModules = ['react', 'react-dom', 'tailwindcss', 'vite'];
  let allModulesExist = true;
  
  for (const mod of keyModules) {
    if (fs.existsSync(`node_modules/${mod}`)) {
      console.log(`${green}✅${reset} ${mod} instalado`);
    } else {
      console.log(`${red}❌${reset} ${mod} NO instalado`);
      allModulesExist = false;
    }
  }
  
  if (!allModulesExist) {
    console.log(`\n${yellow}⚠️  Ejecuta: ${bright}npm install${reset}`);
    warnings++;
  }
} else {
  console.log(`${yellow}⚠️${reset}  node_modules NO existe`);
  console.log(`\n${yellow}   Ejecuta: ${bright}npm install${reset}`);
  warnings++;
}

// ========================================
// 6. VERIFICAR ESTRUCTURA DE CARPETAS
// ========================================
console.log(`\n${bright}${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
console.log(`${bright}6️⃣  ESTRUCTURA DE CARPETAS${reset}\n`);

const requiredDirs = {
  'components': '⚛️  Componentes de React',
  'pages': '📄 Páginas de la aplicación',
  'styles': '🎨 Estilos CSS',
  'contexts': '🔄 Contextos de React',
  'services': '🔧 Servicios de Firebase',
  'utils': '🛠️  Utilidades',
  'types': '📘 Definiciones de TypeScript',
};

for (const [dir, description] of Object.entries(requiredDirs)) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    console.log(`${green}✅${reset} ${dir.padEnd(20)} - ${description} (${files.length} archivos)`);
  } else {
    console.log(`${yellow}⚠️${reset}  ${dir.padEnd(20)} - ${description} ${yellow}(No encontrado)${reset}`);
    warnings++;
  }
}

// ========================================
// RESULTADO FINAL
// ========================================
console.log(`\n${bright}${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
console.log(`${bright}📊 RESULTADO FINAL${reset}\n`);

console.log(`Errores: ${errors > 0 ? red : green}${errors}${reset}`);
console.log(`Advertencias: ${warnings > 0 ? yellow : green}${warnings}${reset}\n`);

if (allGood && errors === 0) {
  console.log(`${bright}${green}╔════════════════════════════════════════════════════════════════╗${reset}`);
  console.log(`${bold}${green}║                                                                ║${reset}`);
  console.log(`${bold}${green}║                  ✅ TODO ESTÁ PERFECTO! ✅                     ║${reset}`);
  console.log(`${bold}${green}║                                                                ║${reset}`);
  console.log(`${bold}${green}╚════════════════════════════════════════════════════════════════╝${reset}\n`);
  
  console.log(`${bright}🚀 Ahora ejecuta:${reset}\n`);
  console.log(`   ${cyan}${bright}npm run dev${reset}\n`);
  console.log(`${bright}Y tu aplicación funcionará perfectamente con todos los estilos! 🎉${reset}\n`);
  
  console.log(`${bright}📖 Para ver cómo se verá:${reset}`);
  console.log(`   ${cyan}cat COMO_SE_VERA_EN_VS_CODE.md${reset}\n`);
} else {
  console.log(`${bright}${red}╔════════════════════════════════════════════════════════════════╗${reset}`);
  console.log(`${bright}${red}║                                                                ║${reset}`);
  console.log(`${bright}${red}║                  ⚠️  HAY PROBLEMAS ⚠️                          ║${reset}`);
  console.log(`${bright}${red}║                                                                ║${reset}`);
  console.log(`${bright}${red}╚════════════════════════════════════════════════════════════════╝${reset}\n`);
  
  if (errors > 0) {
    console.log(`${red}❌ Errores críticos encontrados: ${errors}${reset}`);
    console.log(`${red}Por favor, revisa los archivos marcados con ❌ arriba.${reset}\n`);
  }
  
  if (warnings > 0 && errors === 0) {
    console.log(`${yellow}⚠️  Solo advertencias (${warnings}), puedes continuar${reset}\n`);
    console.log(`${bright}Ejecuta:${reset}`);
    console.log(`   ${cyan}${bright}npm install${reset} ${yellow}(si no hay node_modules)${reset}`);
    console.log(`   ${cyan}${bright}npm run dev${reset}\n`);
  }
}

console.log(`${bright}${cyan}════════════════════════════════════════════════════════════════${reset}\n`);

process.exit(allGood && errors === 0 ? 0 : 1);
