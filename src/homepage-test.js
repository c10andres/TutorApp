// Test específico para HomePage
console.log('🧪 TESTING HOMEPAGE COMPONENTS');

// Test 1: Verificar que React esté cargado
if (typeof React !== 'undefined') {
  console.log('✅ React cargado');
} else {
  console.log('❌ React NO cargado');
}

// Test 2: Verificar que los hooks funcionen
try {
  const { useState, useEffect } = React;
  console.log('✅ Hooks de React disponibles');
} catch (error) {
  console.log('❌ Error con hooks de React:', error);
}

// Test 3: Verificar localStorage
if (typeof localStorage !== 'undefined') {
  console.log('✅ localStorage disponible');
  try {
    localStorage.setItem('test', 'value');
    localStorage.removeItem('test');
    console.log('✅ localStorage funcional');
  } catch (error) {
    console.log('❌ localStorage con error:', error);
  }
} else {
  console.log('❌ localStorage NO disponible');
}

// Test 4: Verificar Capacitor
if (typeof Capacitor !== 'undefined') {
  console.log('✅ Capacitor cargado');
  console.log('📱 Platform:', Capacitor.getPlatform());
} else {
  console.log('❌ Capacitor NO cargado');
}

// Test 5: Verificar elementos del DOM
const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('✅ Root element encontrado');
  console.log('📊 Root children:', rootElement.children.length);
} else {
  console.log('❌ Root element NO encontrado');
}

console.log('🧪 Test completado');