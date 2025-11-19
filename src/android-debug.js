// Debug específico para Android - Pantalla en blanco
console.log('🔍 ANDROID DEBUG - Verificando pantalla en blanco');

// Verificar elementos críticos
const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('✅ Root element encontrado');
  console.log('📊 Root children:', rootElement.children.length);
} else {
  console.log('❌ Root element NO encontrado');
}

// Verificar React
if (typeof React !== 'undefined') {
  console.log('✅ React cargado');
} else {
  console.log('❌ React NO cargado');
}

// Verificar CSS
const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
console.log('📄 Stylesheets cargados:', stylesheets.length);

// Verificar scripts
const scripts = document.querySelectorAll('script[src]');
console.log('📜 Scripts cargados:', scripts.length);

// Verificar body
console.log('📄 Body children:', document.body.children.length);

// Verificar viewport
const viewport = document.querySelector('meta[name="viewport"]');
if (viewport) {
  console.log('✅ Viewport configurado');
} else {
  console.log('❌ Viewport NO configurado');
}

// Verificar Capacitor
if (typeof Capacitor !== 'undefined') {
  console.log('✅ Capacitor cargado');
  console.log('📱 Platform:', Capacitor.getPlatform());
} else {
  console.log('❌ Capacitor NO cargado');
}

console.log('🔍 Debug completado - Revisa la consola para detalles');