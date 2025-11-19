#!/usr/bin/env node

/**
 * Script mejorado para desplegar reglas de Firebase
 * 
 * Para usar este script:
 * 1. Asegúrate de tener Firebase CLI instalado: npm install -g firebase-tools
 * 2. Ejecuta: firebase login
 * 3. Ejecuta: node firebase-deploy-rules.js
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Deployando reglas de Firebase...\n');

// Verificar que existe el archivo de reglas
if (!fs.existsSync('./firebase-rules.json')) {
  console.error('❌ Error: No se encontró el archivo firebase-rules.json');
  process.exit(1);
}

// Leer las reglas actuales
let rules;
try {
  rules = JSON.parse(fs.readFileSync('./firebase-rules.json', 'utf8'));
} catch (error) {
  console.error('❌ Error parsing firebase-rules.json:', error.message);
  process.exit(1);
}

console.log('📋 Reglas cargadas:', Object.keys(rules.rules).join(', '));

// Verificar índices importantes
const notifications = rules.rules.notifications?.['.indexOn'];
const requests = rules.rules.requests?.['.indexOn'];
const reviews = rules.rules.reviews?.['.indexOn'];

console.log('📊 Índices verificados en firebase-rules.json:');
console.log('  - notifications userId:', notifications?.includes('userId') ? '✅ Definido' : '❌ Faltante');
console.log('  - requests tutorId:', requests?.includes('tutorId') ? '✅ Definido' : '❌ Faltante');
console.log('  - requests studentId:', requests?.includes('studentId') ? '✅ Definido' : '❌ Faltante');
console.log('  - reviews tutorId:', reviews?.includes('tutorId') ? '✅ Definido' : '❌ Faltante');

if (notifications?.includes('userId') && requests?.includes('tutorId')) {
  console.log('✨ Todos los índices necesarios están definidos en las reglas');
} else {
  console.log('⚠️ Algunos índices pueden estar faltando en las reglas');
}

// Verificar si Firebase CLI está instalado
console.log('\n🔍 Verificando Firebase CLI...');
exec('firebase --version', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Firebase CLI no está instalado.');
    console.log('\n📦 Instala Firebase CLI con:');
    console.log('npm install -g firebase-tools');
    console.log('\nLuego ejecuta: firebase login');
    return;
  }
  
  console.log('✅ Firebase CLI encontrado:', stdout.trim());
  
  // Verificar si hay un proyecto configurado
  if (!fs.existsSync('./.firebaserc') && !fs.existsSync('./firebase.json')) {
    console.log('\n⚠️ No se encontró configuración de Firebase.');
    console.log('Ejecuta: firebase init database');
    console.log('Luego vuelve a ejecutar este script.');
    return;
  }
  
  console.log('\n🚀 Ejecutando deploy...');
  
  // Ejecutar el deploy con output en tiempo real
  const deployProcess = spawn('firebase', ['deploy', '--only', 'database'], {
    stdio: 'inherit',
    shell: true
  });
  
  deployProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`\n❌ Deploy falló con código: ${code}`);
      console.log('\n🔧 Pasos para corregir manualmente:');
      console.log('1. Verifica que estés autenticado: firebase login');
      console.log('2. Verifica el proyecto: firebase projects:list');
      console.log('3. Configura el proyecto: firebase use <project-id>');
      console.log('4. Despliega reglas: firebase deploy --only database');
      return;
    }
    
    console.log('\n✅ ¡Reglas desplegadas exitosamente!');
    console.log('\n🎉 Los índices de Firebase han sido actualizados.');
    console.log('Los errores de índices deberían resolverse en 1-2 minutos.');
    console.log('\n💡 Si sigues viendo errores:');
    console.log('- Espera 2-3 minutos para que los índices se propaguen');
    console.log('- Recarga la aplicación');
    console.log('- Revisa la consola de Firebase: https://console.firebase.google.com');
  });
  
  deployProcess.on('error', (error) => {
    console.error('\n❌ Error ejecutando deploy:', error.message);
  });
});