#!/usr/bin/env node

/**
 * Script para probar la app simulando iPhone en navegador
 * Usa esto si NO tienes Mac ni iPhone
 */

const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('📱 TutorApp - Probando iOS en Navegador\n');
console.log('✅ Si NO tienes Mac ni iPhone, usa este método:\n');

const distPath = path.join(__dirname, '..', 'dist');
const servePort = 3000;

// Verificar si dist existe
if (!fs.existsSync(distPath)) {
  console.log('⚠️  La carpeta dist/ no existe. Construyendo la app...\n');
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error construyendo la app:', error);
      return;
    }
    console.log('✅ App construida exitosamente\n');
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  console.log('🚀 Iniciando servidor local...\n');
  
  const server = http.createServer((req, res) => {
    let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);
    
    // Si el archivo no existe, servir index.html (para SPA routing)
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      filePath = path.join(distPath, 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    }[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error cargando archivo');
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });

  server.listen(servePort, () => {
    const url = `http://localhost:${servePort}`;
    const ip = getLocalIP();
    const networkUrl = `http://${ip}:${servePort}`;

    console.log('✅ Servidor iniciado exitosamente!\n');
    console.log('📋 INSTRUCCIONES PARA SIMULAR IPHONE:\n');
    console.log('1. Abre Chrome o Edge');
    console.log('2. Presiona F12 (o Ctrl+Shift+I)');
    console.log('3. Presiona Ctrl+Shift+M (o haz clic en el ícono 📱)');
    console.log('4. En el menú superior, selecciona "iPhone 14 Pro" o "iPhone SE"');
    console.log('5. Ve a:', url);
    console.log('\n');
    console.log('🌐 URLs disponibles:');
    console.log(`   Local:   ${url}`);
    console.log(`   Red:     ${networkUrl}`);
    console.log('\n💡 También puedes probar desde tu teléfono Android accediendo a la URL de red');
    console.log('\n⏹️  Presiona Ctrl+C para detener el servidor\n');
  });

  // Manejar cierre
  process.on('SIGINT', () => {
    console.log('\n\n👋 Cerrando servidor...');
    server.close(() => {
      console.log('✅ Servidor cerrado. ¡Hasta luego!');
      process.exit(0);
    });
  });
}

function getLocalIP() {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}









