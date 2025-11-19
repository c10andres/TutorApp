#!/usr/bin/env node

/**
 * 🔍 Script de Verificación de Estilos de Tailwind
 * Este script diagnostica problemas comunes con los estilos en VS Code
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
};

let errorsFound = 0;
let warningsFound = 0;

log.title('========================================');
log.title('🔍 VERIFICACIÓN DE ESTILOS DE TAILWIND');
log.title('========================================');

// Verificación 1: Node.js y npm
log.title('[1/8] Verificando Node.js y npm...');
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (majorVersion >= 16) {
    log.success(`Node.js ${nodeVersion} instalado (OK)`);
  } else {
    log.error(`Node.js ${nodeVersion} es muy antiguo. Necesitas v16 o superior.`);
    errorsFound++;
  }
} catch (error) {
  log.error('No se pudo verificar la versión de Node.js');
  errorsFound++;
}

// Verificación 2: Archivos críticos
log.title('[2/8] Verificando archivos críticos...');

const criticalFiles = [
  'package.json',
  'tailwind.config.js',
  'postcss.config.js',
  'vite.config.ts',
  'main.tsx',
  'App.tsx',
  'styles/globals.css',
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    log.success(`${file} existe`);
  } else {
    log.error(`${file} NO existe`);
    errorsFound++;
  }
});

// Verificación 3: main.tsx importa el CSS
log.title('[3/8] Verificando que main.tsx importa el CSS...');
try {
  const mainContent = fs.readFileSync('main.tsx', 'utf8');
  if (mainContent.includes("import './styles/globals.css'")) {
    log.success('main.tsx importa el CSS correctamente');
  } else {
    log.error('main.tsx NO importa ./styles/globals.css');
    errorsFound++;
  }
} catch (error) {
  log.error('No se pudo leer main.tsx');
  errorsFound++;
}

// Verificación 4: tailwind.config.js tiene el content correcto
log.title('[4/8] Verificando tailwind.config.js...');
try {
  const tailwindContent = fs.readFileSync('tailwind.config.js', 'utf8');
  
  const requiredPaths = [
    './index.html',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ];
  
  let allPathsFound = true;
  requiredPaths.forEach(pathPattern => {
    if (tailwindContent.includes(pathPattern.replace('./', '')) || 
        tailwindContent.includes(pathPattern)) {
      log.success(`Content incluye: ${pathPattern}`);
    } else {
      log.warning(`Content NO incluye: ${pathPattern}`);
      warningsFound++;
      allPathsFound = false;
    }
  });
  
  if (allPathsFound) {
    log.success('tailwind.config.js tiene configuración correcta');
  }
} catch (error) {
  log.error('No se pudo verificar tailwind.config.js');
  errorsFound++;
}

// Verificación 5: postcss.config.js tiene los plugins
log.title('[5/8] Verificando postcss.config.js...');
try {
  const postcssContent = fs.readFileSync('postcss.config.js', 'utf8');
  
  if (postcssContent.includes('tailwindcss')) {
    log.success('PostCSS incluye plugin de Tailwind');
  } else {
    log.error('PostCSS NO incluye plugin de Tailwind');
    errorsFound++;
  }
  
  if (postcssContent.includes('autoprefixer')) {
    log.success('PostCSS incluye autoprefixer');
  } else {
    log.warning('PostCSS NO incluye autoprefixer');
    warningsFound++;
  }
} catch (error) {
  log.error('No se pudo verificar postcss.config.js');
  errorsFound++;
}

// Verificación 6: package.json tiene las dependencias correctas
log.title('[6/8] Verificando dependencias en package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = {
    'tailwindcss': 'devDependencies',
    'postcss': 'devDependencies',
    'autoprefixer': 'devDependencies',
    'vite': 'devDependencies',
    'react': 'dependencies',
    'react-dom': 'dependencies',
  };
  
  Object.entries(requiredDeps).forEach(([dep, type]) => {
    if (packageJson[type] && packageJson[type][dep]) {
      log.success(`${dep} instalado (${packageJson[type][dep]})`);
    } else {
      log.error(`${dep} NO está en ${type}`);
      errorsFound++;
    }
  });
} catch (error) {
  log.error('No se pudo verificar package.json');
  errorsFound++;
}

// Verificación 7: node_modules existe
log.title('[7/8] Verificando node_modules...');
if (fs.existsSync('node_modules')) {
  log.success('node_modules existe');
  
  // Verificar que tailwindcss esté instalado
  if (fs.existsSync('node_modules/tailwindcss')) {
    log.success('node_modules/tailwindcss existe');
  } else {
    log.error('node_modules/tailwindcss NO existe - ejecuta: npm install');
    errorsFound++;
  }
  
  if (fs.existsSync('node_modules/postcss')) {
    log.success('node_modules/postcss existe');
  } else {
    log.error('node_modules/postcss NO existe - ejecuta: npm install');
    errorsFound++;
  }
} else {
  log.error('node_modules NO existe - ejecuta: npm install');
  errorsFound++;
}

// Verificación 8: Verificar estructura de styles/globals.css
log.title('[8/8] Verificando styles/globals.css...');
try {
  const globalsContent = fs.readFileSync('styles/globals.css', 'utf8');
  
  const requiredDirectives = [
    '@tailwind base',
    '@tailwind components',
    '@tailwind utilities',
  ];
  
  requiredDirectives.forEach(directive => {
    if (globalsContent.includes(directive)) {
      log.success(`Contiene: ${directive}`);
    } else {
      log.error(`NO contiene: ${directive}`);
      errorsFound++;
    }
  });
} catch (error) {
  log.error('No se pudo verificar styles/globals.css');
  errorsFound++;
}

// Resumen final
log.title('========================================');
log.title('📊 RESUMEN DE VERIFICACIÓN');
log.title('========================================');

if (errorsFound === 0 && warningsFound === 0) {
  log.success('✅ ¡Todo está correcto!');
  log.info('Si los estilos aún no se ven, intenta:');
  console.log('   1. Detener el servidor (Ctrl+C)');
  console.log('   2. Ejecutar: npm install');
  console.log('   3. Ejecutar: npm run dev');
  console.log('   4. Actualizar el navegador (Ctrl+Shift+R)');
} else {
  if (errorsFound > 0) {
    log.error(`Se encontraron ${errorsFound} error(es) crítico(s)`);
  }
  if (warningsFound > 0) {
    log.warning(`Se encontraron ${warningsFound} advertencia(s)`);
  }
  
  log.info('\n📖 SOLUCIONES RECOMENDADAS:\n');
  
  if (errorsFound > 0) {
    console.log('1. Ejecuta el script de arreglo automático:');
    console.log('   - Mac/Linux: ./fix-estilos-vscode.sh');
    console.log('   - Windows PowerShell: .\\fix-estilos-vscode.ps1');
    console.log('   - Windows CMD: fix-estilos-vscode.bat');
    console.log('');
    console.log('2. O manualmente:');
    console.log('   npm install');
    console.log('   npm run dev');
    console.log('');
  }
  
  console.log('📖 Para más información, consulta:');
  console.log('   - SOLUCION_ESTILOS_VS_CODE.md');
  console.log('   - INICIO_RAPIDO_VS_CODE.txt');
}

log.title('========================================');

process.exit(errorsFound > 0 ? 1 : 0);
