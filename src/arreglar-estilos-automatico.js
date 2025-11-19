#!/usr/bin/env node

/**
 * Script Automático para Arreglar Estilos
 * Corrige configuraciones comunes que causan que los estilos no se vean
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  🔧 Arreglando Estilos Automáticamente                  ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

let fixed = 0;
let skipped = 0;

function success(message) {
  console.log('✅', message);
  fixed++;
}

function skip(message) {
  console.log('⏭️ ', message);
  skipped++;
}

function info(message) {
  console.log('ℹ️ ', message);
}

// 1. Verificar main.tsx
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1️⃣  Verificando main.tsx...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  if (fs.existsSync('./main.tsx')) {
    let mainTsx = fs.readFileSync('./main.tsx', 'utf8');
    
    if (!mainTsx.includes("import './styles/globals.css'") && !mainTsx.includes('import "./styles/globals.css"')) {
      info('Agregando import de globals.css a main.tsx...');
      
      // Buscar la línea después de los imports de React
      const lines = mainTsx.split('\n');
      let insertIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("import App from")) {
          insertIndex = i + 1;
          break;
        }
      }
      
      if (insertIndex !== -1) {
        lines.splice(insertIndex, 0, "import './styles/globals.css'");
        mainTsx = lines.join('\n');
        fs.writeFileSync('./main.tsx', mainTsx);
        success('Import de globals.css agregado a main.tsx');
      } else {
        skip('No se pudo determinar dónde insertar el import');
      }
    } else {
      skip('main.tsx ya importa globals.css');
    }
  } else {
    skip('main.tsx no existe');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

console.log('');

// 2. Limpiar cache de Vite
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('2️⃣  Limpiando cache de Vite...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  if (fs.existsSync('./node_modules/.vite')) {
    fs.rmSync('./node_modules/.vite', { recursive: true, force: true });
    success('Cache de Vite eliminado');
  } else {
    skip('No hay cache de Vite para limpiar');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

console.log('');

// 3. Verificar package.json
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('3️⃣  Verificando package.json...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // Verificar Tailwind
  const tailwindVersion = packageJson.devDependencies?.tailwindcss;
  
  if (!tailwindVersion) {
    info('Tailwind CSS no está en devDependencies');
    skip('Por favor ejecuta: npm install -D tailwindcss postcss autoprefixer');
  } else if (tailwindVersion.includes('4.')) {
    info('Tailwind CSS v4 detectado');
    info('Cambiando a v3.4.1 para mejor compatibilidad...');
    
    packageJson.devDependencies.tailwindcss = '^3.4.1';
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
    success('package.json actualizado a Tailwind v3.4.1');
    
    info('Necesitas ejecutar: npm install');
  } else {
    skip('Tailwind CSS v3 ya está configurado');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

console.log('');

// 4. Verificar postcss.config.js
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('4️⃣  Verificando postcss.config.js...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

try {
  if (!fs.existsSync('./postcss.config.js')) {
    fs.writeFileSync('./postcss.config.js', postcssConfig);
    success('postcss.config.js creado');
  } else {
    const currentConfig = fs.readFileSync('./postcss.config.js', 'utf8');
    if (!currentConfig.includes('tailwindcss')) {
      fs.writeFileSync('./postcss.config.js', postcssConfig);
      success('postcss.config.js actualizado');
    } else {
      skip('postcss.config.js ya está correcto');
    }
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

console.log('');

// 5. Verificar tailwind.config.js
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('5️⃣  Verificando tailwind.config.js...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  if (fs.existsSync('./tailwind.config.js')) {
    const tailwindConfig = fs.readFileSync('./tailwind.config.js', 'utf8');
    
    if (tailwindConfig.includes('content:')) {
      skip('tailwind.config.js ya tiene configuración de content');
    } else {
      info('tailwind.config.js existe pero podría estar incompleto');
      skip('Verifica que tenga la propiedad "content" configurada');
    }
  } else {
    info('tailwind.config.js no existe');
    skip('Por favor ejecuta: npx tailwindcss init');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

console.log('');

// 6. Verificar styles/globals.css
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('6️⃣  Verificando styles/globals.css...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  if (!fs.existsSync('./styles')) {
    fs.mkdirSync('./styles');
    info('Carpeta styles/ creada');
  }
  
  if (fs.existsSync('./styles/globals.css')) {
    const globalsCss = fs.readFileSync('./styles/globals.css', 'utf8');
    
    const requiredDirectives = [
      '@tailwind base',
      '@tailwind components',
      '@tailwind utilities'
    ];
    
    const hasAll = requiredDirectives.every(dir => globalsCss.includes(dir));
    
    if (hasAll) {
      skip('globals.css tiene todas las directivas de Tailwind');
    } else {
      info('globals.css existe pero le faltan directivas de Tailwind');
      skip('Verifica que tenga @tailwind base, components y utilities');
    }
  } else {
    skip('globals.css no existe (debería estar en el proyecto)');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

console.log('');

// Resumen
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  📊 Resumen de Arreglos                                 ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');
console.log(`  ✅ Arreglados:  ${fixed}`);
console.log(`  ⏭️  Omitidos:   ${skipped}`);
console.log('');

if (fixed > 0) {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  ✅ SE REALIZARON ARREGLOS                              ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('  🔧 Se realizaron los siguientes arreglos:');
  console.log(`     - ${fixed} archivo(s) modificado(s)/creado(s)`);
  console.log('');
  console.log('  📋 Próximos pasos:');
  console.log('');
  console.log('    1. Si se modificó package.json:');
  console.log('       npm install');
  console.log('');
  console.log('    2. Ejecutar diagnóstico:');
  console.log('       node diagnostico-estilos.js');
  console.log('');
  console.log('    3. Probar la aplicación:');
  console.log('       npm run dev');
  console.log('');
} else {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  ℹ️  NO SE NECESITARON ARREGLOS                         ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('  ✅ Todo parece estar correctamente configurado');
  console.log('');
  console.log('  Si los estilos aún no se ven:');
  console.log('');
  console.log('    1. Limpiar e instalar:');
  console.log('       rm -rf node_modules package-lock.json');
  console.log('       npm install');
  console.log('');
  console.log('    2. Ejecutar diagnóstico:');
  console.log('       node diagnostico-estilos.js');
  console.log('');
  console.log('    3. Revisar documentación:');
  console.log('       - VERIFICACION_COMPLETA.md');
  console.log('       - SOLUCION_ESTILOS.md');
  console.log('');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
