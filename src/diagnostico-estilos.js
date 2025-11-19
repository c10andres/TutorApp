#!/usr/bin/env node

/**
 * Script de Diagnóstico de Estilos
 * Verifica que Tailwind CSS esté configurado correctamente
 */

const fs = require('fs');
const path = require('path');

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  🔍 Diagnóstico de Estilos - TutorApp Colombia          ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

let errors = 0;
let warnings = 0;
let success = 0;

function checkSuccess(message) {
  console.log('✅', message);
  success++;
}

function checkWarning(message) {
  console.log('⚠️ ', message);
  warnings++;
}

function checkError(message) {
  console.log('❌', message);
  errors++;
}

// 1. Verificar package.json
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1️⃣  Verificando package.json...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // Verificar dependencias críticas
  const criticalDeps = {
    'react': packageJson.dependencies?.react,
    'react-dom': packageJson.dependencies?.['react-dom'],
    'firebase': packageJson.dependencies?.firebase,
  };

  const criticalDevDeps = {
    'tailwindcss': packageJson.devDependencies?.tailwindcss,
    'postcss': packageJson.devDependencies?.postcss,
    'autoprefixer': packageJson.devDependencies?.autoprefixer,
    'vite': packageJson.devDependencies?.vite,
    'typescript': packageJson.devDependencies?.typescript,
  };

  Object.entries(criticalDeps).forEach(([name, version]) => {
    if (version) {
      checkSuccess(`${name} está instalado (${version})`);
    } else {
      checkError(`${name} NO está en dependencies`);
    }
  });

  Object.entries(criticalDevDeps).forEach(([name, version]) => {
    if (version) {
      checkSuccess(`${name} está instalado (${version})`);
    } else {
      checkError(`${name} NO está en devDependencies`);
    }
  });

  // Verificar versión de Tailwind
  const tailwindVersion = packageJson.devDependencies?.tailwindcss;
  if (tailwindVersion) {
    if (tailwindVersion.includes('3.')) {
      checkSuccess('Tailwind CSS v3 detectado (correcto)');
    } else if (tailwindVersion.includes('4.')) {
      checkWarning('Tailwind CSS v4 detectado - asegúrate de tener la configuración correcta');
    }
  }

} catch (err) {
  checkError('No se pudo leer package.json: ' + err.message);
}

console.log('');

// 2. Verificar node_modules
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('2️⃣  Verificando node_modules...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (fs.existsSync('./node_modules')) {
  checkSuccess('node_modules/ existe');

  const criticalModules = [
    'react',
    'react-dom',
    'tailwindcss',
    'postcss',
    'autoprefixer',
    'vite',
  ];

  criticalModules.forEach(mod => {
    if (fs.existsSync(`./node_modules/${mod}`)) {
      checkSuccess(`${mod} instalado en node_modules`);
    } else {
      checkError(`${mod} NO encontrado en node_modules`);
    }
  });
} else {
  checkError('node_modules/ NO existe - ejecuta: npm install');
}

console.log('');

// 3. Verificar archivos de configuración
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('3️⃣  Verificando archivos de configuración...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// tailwind.config.js
if (fs.existsSync('./tailwind.config.js')) {
  checkSuccess('tailwind.config.js existe');
  
  try {
    const tailwindConfig = fs.readFileSync('./tailwind.config.js', 'utf8');
    
    if (tailwindConfig.includes('content:')) {
      checkSuccess('tailwind.config.js tiene configuración "content"');
    } else {
      checkError('tailwind.config.js NO tiene configuración "content"');
    }

    if (tailwindConfig.includes('./pages/**/*.{js,ts,jsx,tsx}')) {
      checkSuccess('tailwind.config.js incluye ./pages/**/*');
    } else {
      checkWarning('tailwind.config.js podría no incluir todas las rutas');
    }
  } catch (err) {
    checkError('Error al leer tailwind.config.js: ' + err.message);
  }
} else {
  checkError('tailwind.config.js NO existe');
}

// postcss.config.js
if (fs.existsSync('./postcss.config.js')) {
  checkSuccess('postcss.config.js existe');
  
  try {
    const postcssConfig = fs.readFileSync('./postcss.config.js', 'utf8');
    
    if (postcssConfig.includes('tailwindcss')) {
      checkSuccess('postcss.config.js incluye tailwindcss');
    } else {
      checkError('postcss.config.js NO incluye tailwindcss');
    }

    if (postcssConfig.includes('autoprefixer')) {
      checkSuccess('postcss.config.js incluye autoprefixer');
    } else {
      checkWarning('postcss.config.js NO incluye autoprefixer');
    }
  } catch (err) {
    checkError('Error al leer postcss.config.js: ' + err.message);
  }
} else {
  checkError('postcss.config.js NO existe');
}

// vite.config.ts
if (fs.existsSync('./vite.config.ts')) {
  checkSuccess('vite.config.ts existe');
} else {
  checkError('vite.config.ts NO existe');
}

console.log('');

// 4. Verificar archivos de estilos
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('4️⃣  Verificando archivos de estilos...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// styles/globals.css
if (fs.existsSync('./styles/globals.css')) {
  checkSuccess('styles/globals.css existe');
  
  try {
    const globalsCss = fs.readFileSync('./styles/globals.css', 'utf8');
    
    const requiredDirectives = [
      '@tailwind base',
      '@tailwind components',
      '@tailwind utilities'
    ];

    requiredDirectives.forEach(directive => {
      if (globalsCss.includes(directive)) {
        checkSuccess(`globals.css contiene: ${directive}`);
      } else {
        checkError(`globals.css NO contiene: ${directive}`);
      }
    });

    if (globalsCss.includes(':root')) {
      checkSuccess('globals.css tiene variables CSS (:root)');
    }
  } catch (err) {
    checkError('Error al leer styles/globals.css: ' + err.message);
  }
} else {
  checkError('styles/globals.css NO existe');
}

// main.tsx
if (fs.existsSync('./main.tsx')) {
  checkSuccess('main.tsx existe');
  
  try {
    const mainTsx = fs.readFileSync('./main.tsx', 'utf8');
    
    if (mainTsx.includes("import './styles/globals.css'") || mainTsx.includes('import "./styles/globals.css"')) {
      checkSuccess('main.tsx importa styles/globals.css');
    } else {
      checkError('main.tsx NO importa styles/globals.css - ¡CRÍTICO!');
      console.log('');
      console.log('   💡 Solución: Agrega esta línea en main.tsx:');
      console.log("      import './styles/globals.css'");
      console.log('');
    }
  } catch (err) {
    checkError('Error al leer main.tsx: ' + err.message);
  }
} else {
  checkError('main.tsx NO existe');
}

console.log('');

// 5. Verificar estructura de carpetas
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('5️⃣  Verificando estructura de carpetas...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const requiredFolders = [
  'components',
  'pages',
  'services',
  'contexts',
  'styles',
  'hooks',
  'types',
];

requiredFolders.forEach(folder => {
  if (fs.existsSync(`./${folder}`)) {
    checkSuccess(`Carpeta ${folder}/ existe`);
  } else {
    checkWarning(`Carpeta ${folder}/ NO existe`);
  }
});

console.log('');

// Resumen
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  📊 Resumen del Diagnóstico                             ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');
console.log(`  ✅ Éxitos:       ${success}`);
console.log(`  ⚠️  Advertencias: ${warnings}`);
console.log(`  ❌ Errores:      ${errors}`);
console.log('');

// Diagnóstico final
if (errors === 0 && warnings === 0) {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  ✅ TODO ESTÁ PERFECTO                                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('  🎉 El proyecto está configurado correctamente');
  console.log('  🎨 Los estilos deberían verse perfectamente en VS Code');
  console.log('');
  console.log('  Próximos pasos:');
  console.log('    1. npm run dev');
  console.log('    2. Abrir http://localhost:5173');
  console.log('');
  process.exit(0);
} else if (errors === 0) {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  ⚠️  TODO FUNCIONA (con advertencias menores)           ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('  ✅ No hay errores críticos');
  console.log(`  ⚠️  Hay ${warnings} advertencia(s) no crítica(s)`);
  console.log('  🎨 Los estilos deberían verse correctamente');
  console.log('');
  console.log('  Próximos pasos:');
  console.log('    1. npm run dev');
  console.log('    2. Abrir http://localhost:5173');
  console.log('');
  process.exit(0);
} else {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  ❌ SE ENCONTRARON ERRORES                              ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  ❌ ${errors} error(es) encontrado(s)`);
  console.log(`  ⚠️  ${warnings} advertencia(s)`);
  console.log('');
  console.log('  🔧 Acciones recomendadas:');
  console.log('');
  
  if (!fs.existsSync('./node_modules')) {
    console.log('    1. Instalar dependencias:');
    console.log('       npm install');
    console.log('');
  }
  
  if (errors > 0) {
    console.log('    2. Revisar los errores marcados arriba con ❌');
    console.log('    3. Ejecutar este diagnóstico de nuevo:');
    console.log('       node diagnostico-estilos.js');
    console.log('');
  }
  
  console.log('  📚 Documentación útil:');
  console.log('    - VERIFICACION_COMPLETA.md');
  console.log('    - SOLUCION_ESTILOS.md');
  console.log('    - README_EMPEZAR_AQUI.md');
  console.log('');
  
  process.exit(1);
}
