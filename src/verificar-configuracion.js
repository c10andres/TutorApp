#!/usr/bin/env node

/**
 * 🔍 Script de Verificación de Configuración
 * Verifica que todos los archivos de configuración estén correctos
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

console.log(`\n${colors.bold}${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}🔍 VERIFICACIÓN DE CONFIGURACIÓN${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}========================================${colors.reset}\n`);

let allGood = true;

// Verificar archivos críticos
const criticalFiles = {
  'package.json': 'Configuración de npm',
  'vite.config.ts': 'Configuración de Vite',
  'tailwind.config.js': 'Configuración de Tailwind',
  'postcss.config.js': 'Configuración de PostCSS',
  'tsconfig.json': 'Configuración de TypeScript',
  'index.html': 'HTML principal',
  'main.tsx': 'Punto de entrada',
  'App.tsx': 'Componente principal',
  'styles/globals.css': 'Estilos globales',
  '.vscode/settings.json': 'Configuración de VS Code',
  '.vscode/extensions.json': 'Extensiones recomendadas',
};

console.log(`${colors.bold}Verificando archivos críticos...${colors.reset}\n`);

for (const [file, description] of Object.entries(criticalFiles)) {
  if (fs.existsSync(file)) {
    console.log(`${colors.green}✅${colors.reset} ${file.padEnd(30)} - ${description}`);
  } else {
    console.log(`${colors.red}❌${colors.reset} ${file.padEnd(30)} - ${description}`);
    allGood = false;
  }
}

// Verificar contenido de archivos clave
console.log(`\n${colors.bold}Verificando configuraciones...${colors.reset}\n`);

// Verificar main.tsx importa CSS
try {
  const mainContent = fs.readFileSync('main.tsx', 'utf8');
  if (mainContent.includes("import './styles/globals.css'")) {
    console.log(`${colors.green}✅${colors.reset} main.tsx importa globals.css`);
  } else {
    console.log(`${colors.red}❌${colors.reset} main.tsx NO importa globals.css`);
    allGood = false;
  }
} catch (e) {
  console.log(`${colors.red}❌${colors.reset} Error leyendo main.tsx`);
  allGood = false;
}

// Verificar globals.css tiene directivas de Tailwind
try {
  const cssContent = fs.readFileSync('styles/globals.css', 'utf8');
  const hasBase = cssContent.includes('@tailwind base');
  const hasComponents = cssContent.includes('@tailwind components');
  const hasUtilities = cssContent.includes('@tailwind utilities');
  
  if (hasBase && hasComponents && hasUtilities) {
    console.log(`${colors.green}✅${colors.reset} globals.css tiene todas las directivas de Tailwind`);
  } else {
    console.log(`${colors.red}❌${colors.reset} globals.css falta directivas de Tailwind`);
    allGood = false;
  }
} catch (e) {
  console.log(`${colors.red}❌${colors.reset} Error leyendo globals.css`);
  allGood = false;
}

// Verificar package.json tiene script dev
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.scripts && packageJson.scripts.dev) {
    console.log(`${colors.green}✅${colors.reset} package.json tiene script 'dev'`);
  } else {
    console.log(`${colors.red}❌${colors.reset} package.json NO tiene script 'dev'`);
    allGood = false;
  }
  
  // Verificar dependencias de Tailwind
  const hasTailwind = packageJson.devDependencies && packageJson.devDependencies.tailwindcss;
  const hasPostcss = packageJson.devDependencies && packageJson.devDependencies.postcss;
  const hasAutoprefixer = packageJson.devDependencies && packageJson.devDependencies.autoprefixer;
  
  if (hasTailwind && hasPostcss && hasAutoprefixer) {
    console.log(`${colors.green}✅${colors.reset} Todas las dependencias de Tailwind están instaladas`);
  } else {
    console.log(`${colors.yellow}⚠️${colors.reset}  Faltan dependencias de Tailwind (se instalarán con npm install)`);
  }
} catch (e) {
  console.log(`${colors.red}❌${colors.reset} Error leyendo package.json`);
  allGood = false;
}

// Verificar node_modules existe
if (fs.existsSync('node_modules')) {
  console.log(`${colors.green}✅${colors.reset} node_modules existe`);
} else {
  console.log(`${colors.yellow}⚠️${colors.reset}  node_modules NO existe (ejecuta: npm install)`);
}

// Resultado final
console.log(`\n${colors.bold}${colors.cyan}========================================${colors.reset}`);
if (allGood) {
  console.log(`${colors.bold}${colors.green}✅ TODO ESTÁ CORRECTO!${colors.reset}`);
  console.log(`\n${colors.bold}Ahora ejecuta:${colors.reset}`);
  console.log(`  ${colors.cyan}npm run dev${colors.reset}\n`);
  console.log(`Los estilos funcionarán perfectamente! 🎉\n`);
} else {
  console.log(`${colors.bold}${colors.red}❌ HAY PROBLEMAS${colors.reset}`);
  console.log(`\nRevisa los errores arriba y corrige los archivos.\n`);
}
console.log(`${colors.bold}${colors.cyan}========================================${colors.reset}\n`);

process.exit(allGood ? 0 : 1);
