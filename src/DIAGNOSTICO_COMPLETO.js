#!/usr/bin/env node

/**
 * DIAGNÓSTICO COMPLETO DE ESTILOS TAILWIND
 * Este script verifica TODO lo necesario para que Tailwind funcione
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 DIAGNÓSTICO COMPLETO DE TAILWIND CSS\n');
console.log('='.repeat(60));

let errores = [];
let advertencias = [];
let exitoso = [];

// 1. Verificar package.json
console.log('\n📦 1. Verificando package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const dependenciasRequeridas = {
    'tailwindcss': '^4',
    'autoprefixer': '^10',
    'postcss': '^8'
  };

  for (const [dep, version] of Object.entries(dependenciasRequeridas)) {
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (allDeps[dep]) {
      exitoso.push(`✅ ${dep} está instalado: ${allDeps[dep]}`);
    } else {
      errores.push(`❌ ${dep} NO está instalado`);
    }
  }

  // Verificar scripts
  if (packageJson.scripts && packageJson.scripts.dev) {
    exitoso.push(`✅ Script 'dev' encontrado: ${packageJson.scripts.dev}`);
  } else {
    errores.push('❌ Script "dev" no encontrado en package.json');
  }
} catch (e) {
  errores.push('❌ No se pudo leer package.json: ' + e.message);
}

// 2. Verificar tailwind.config.js
console.log('\n⚙️  2. Verificando tailwind.config.js...');
try {
  const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
  
  if (tailwindConfig.includes('content:')) {
    exitoso.push('✅ Propiedad "content" encontrada en tailwind.config.js');
  } else {
    errores.push('❌ Falta propiedad "content" en tailwind.config.js');
  }

  if (tailwindConfig.includes('./App.tsx') || tailwindConfig.includes('./src/**/*')) {
    exitoso.push('✅ Rutas de archivos configuradas correctamente');
  } else {
    advertencias.push('⚠️  Verifica las rutas en la propiedad "content"');
  }
} catch (e) {
  errores.push('❌ tailwind.config.js no encontrado o con errores');
}

// 3. Verificar postcss.config.js
console.log('\n🔧 3. Verificando postcss.config.js...');
try {
  const postcssConfig = fs.readFileSync('postcss.config.js', 'utf8');
  
  if (postcssConfig.includes('tailwindcss') && postcssConfig.includes('autoprefixer')) {
    exitoso.push('✅ postcss.config.js configurado correctamente');
  } else {
    errores.push('❌ postcss.config.js no tiene tailwindcss o autoprefixer');
  }
} catch (e) {
  errores.push('❌ postcss.config.js no encontrado');
}

// 4. Verificar styles/globals.css
console.log('\n🎨 4. Verificando styles/globals.css...');
try {
  const globalsCss = fs.readFileSync('styles/globals.css', 'utf8');
  
  const directivas = ['@tailwind base', '@tailwind components', '@tailwind utilities'];
  let directivasEncontradas = 0;
  
  directivas.forEach(directiva => {
    if (globalsCss.includes(directiva)) {
      directivasEncontradas++;
    }
  });

  if (directivasEncontradas === 3) {
    exitoso.push('✅ Todas las directivas @tailwind presentes en globals.css');
  } else {
    errores.push(`❌ Faltan directivas @tailwind en globals.css (${directivasEncontradas}/3)`);
  }
} catch (e) {
  errores.push('❌ styles/globals.css no encontrado');
}

// 5. Verificar main.tsx
console.log('\n🚀 5. Verificando main.tsx...');
try {
  const mainTsx = fs.readFileSync('main.tsx', 'utf8');
  
  if (mainTsx.includes('./styles/globals.css') || mainTsx.includes('globals.css')) {
    exitoso.push('✅ globals.css importado en main.tsx');
  } else {
    errores.push('❌ globals.css NO está importado en main.tsx');
  }
} catch (e) {
  errores.push('❌ main.tsx no encontrado');
}

// 6. Verificar vite.config.ts
console.log('\n⚡ 6. Verificando vite.config.ts...');
try {
  const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
  
  if (viteConfig.includes('postcss')) {
    exitoso.push('✅ PostCSS configurado en vite.config.ts');
  } else {
    advertencias.push('⚠️  Asegúrate de que PostCSS esté configurado en vite.config.ts');
  }
} catch (e) {
  advertencias.push('⚠️  No se pudo verificar vite.config.ts');
}

// 7. Verificar node_modules
console.log('\n📚 7. Verificando node_modules...');
if (fs.existsSync('node_modules')) {
  const paquetes = ['tailwindcss', 'postcss', 'autoprefixer'];
  paquetes.forEach(pkg => {
    if (fs.existsSync(`node_modules/${pkg}`)) {
      exitoso.push(`✅ ${pkg} instalado en node_modules`);
    } else {
      errores.push(`❌ ${pkg} NO está en node_modules`);
    }
  });
} else {
  errores.push('❌ Carpeta node_modules NO existe - ¡Ejecuta npm install!');
}

// RESUMEN FINAL
console.log('\n' + '='.repeat(60));
console.log('\n📊 RESUMEN DEL DIAGNÓSTICO\n');

if (exitoso.length > 0) {
  console.log('✅ CORRECTO:');
  exitoso.forEach(msg => console.log('   ' + msg));
}

if (advertencias.length > 0) {
  console.log('\n⚠️  ADVERTENCIAS:');
  advertencias.forEach(msg => console.log('   ' + msg));
}

if (errores.length > 0) {
  console.log('\n❌ ERRORES ENCONTRADOS:');
  errores.forEach(msg => console.log('   ' + msg));
  
  console.log('\n' + '='.repeat(60));
  console.log('\n🔧 SOLUCIÓN PASO A PASO:\n');
  
  if (errores.some(e => e.includes('node_modules'))) {
    console.log('1️⃣  Instala las dependencias:');
    console.log('   npm install');
    console.log('');
  }
  
  if (errores.some(e => e.includes('NO está instalado'))) {
    console.log('2️⃣  Instala Tailwind y dependencias:');
    console.log('   npm install -D tailwindcss@latest postcss@latest autoprefixer@latest');
    console.log('');
  }
  
  if (errores.some(e => e.includes('globals.css'))) {
    console.log('3️⃣  Verifica que main.tsx importe globals.css:');
    console.log('   import "./styles/globals.css";');
    console.log('');
  }
  
  console.log('4️⃣  Después de hacer los cambios:');
  console.log('   npm run dev');
  console.log('');
  console.log('5️⃣  Abre el navegador y presiona Ctrl+Shift+R (o Cmd+Shift+R) para limpiar caché');
  console.log('');
  
  process.exit(1);
} else {
  console.log('\n' + '='.repeat(60));
  console.log('\n✨ ¡TODO ESTÁ CONFIGURADO CORRECTAMENTE!\n');
  console.log('🎯 SIGUIENTE PASO:\n');
  console.log('1. Ejecuta:  npm run dev');
  console.log('2. Abre:     http://localhost:5173');
  console.log('3. Si no ves estilos, presiona Ctrl+Shift+R para limpiar caché');
  console.log('\n' + '='.repeat(60) + '\n');
  process.exit(0);
}
