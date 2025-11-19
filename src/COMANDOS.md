# 🛠️ COMANDOS ÚTILES - TUTORAPP

## ⚡ COMANDOS PRINCIPALES

### Instalación y Ejecución:
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo (puerto 5173)
npm run dev

# Ejecutar en otro puerto
npm run dev -- --port 3000

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## 🔍 VERIFICACIÓN

### Verificar Estado:
```bash
# Linux/Mac
chmod +x verificar.sh
./verificar.sh

# Windows PowerShell
.\verificar.ps1
```

### Verificar Versiones:
```bash
# Node.js (debe ser v18+)
node -v

# npm (debe ser v8+)
npm -v

# Listar dependencias instaladas
npm list

# Ver solo dependencias de producción
npm list --prod

# Ver solo dependencias de desarrollo
npm list --dev
```

---

## 🧹 LIMPIEZA Y REINSTALACIÓN

### Limpiar Cache:
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de npm
npm cache clean --force

# Limpiar build anterior
rm -rf dist
```

### Reinstalación Completa:
```bash
# Todo en uno
rm -rf node_modules package-lock.json dist
npm cache clean --force
npm install
npm run dev
```

---

## 🔧 DESARROLLO

### Linting y Formato:
```bash
# Ejecutar linter
npm run lint

# Fix automático (si está configurado)
npm run lint -- --fix
```

### Build y Análisis:
```bash
# Build optimizado
npm run build

# Analizar bundle size
npm run build -- --mode production

# Build con sourcemaps
npm run build -- --sourcemap
```

---

## 📱 MOBILE (CAPACITOR)

### Android:
```bash
# Build y sync con Capacitor
npm run cap:build

# Abrir en Android Studio
npm run cap:android

# Run directamente en dispositivo
npm run cap:run:android

# Build APK
npm run cap:build:android
```

### iOS:
```bash
# Build y sync con Capacitor
npm run cap:build

# Abrir en Xcode
npm run cap:ios

# Run en simulador
npm run cap:run:ios
```

### Capacitor Commands:
```bash
# Sync assets con apps nativas
npx cap sync

# Actualizar plugins
npx cap update

# Listar plugins instalados
npx cap ls

# Abrir Android Studio
npx cap open android

# Abrir Xcode
npx cap open ios
```

---

## 🔥 FIREBASE

### Firebase CLI:
```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Login en Firebase
firebase login

# Listar proyectos
firebase projects:list

# Usar proyecto específico
firebase use udconecta-4bfff

# Desplegar reglas de database
firebase deploy --only database

# Desplegar reglas de Firestore
firebase deploy --only firestore:rules

# Desplegar todo
firebase deploy

# Ver logs
firebase functions:log
```

### Firebase Emulators:
```bash
# Iniciar emuladores locales
firebase emulators:start

# Iniciar solo Auth y Database
firebase emulators:start --only auth,database

# Exportar datos de emuladores
firebase emulators:export ./backup

# Importar datos a emuladores
firebase emulators:start --import=./backup
```

---

## 🐛 DEBUGGING

### Ver Logs:
```bash
# Logs en consola (ejecutar en otra terminal)
npm run dev | grep ERROR

# Ver solo warnings
npm run dev | grep WARN

# Guardar logs en archivo
npm run dev > logs.txt 2>&1
```

### Verificar Puertos:
```bash
# Ver qué usa el puerto 5173 (Linux/Mac)
lsof -i :5173

# Matar proceso en puerto 5173 (Linux/Mac)
lsof -ti:5173 | xargs kill -9

# Ver qué usa el puerto 5173 (Windows)
netstat -ano | findstr :5173

# Matar proceso (Windows)
taskkill /PID <PID> /F
```

### Verificar Archivos:
```bash
# Contar archivos TypeScript
find . -name "*.tsx" -o -name "*.ts" | wc -l

# Contar líneas de código
find . -name "*.tsx" -o -name "*.ts" | xargs wc -l

# Buscar TODOs en código
grep -r "TODO" --include="*.tsx" --include="*.ts"

# Buscar FIXMEs
grep -r "FIXME" --include="*.tsx" --include="*.ts"
```

---

## 📊 ANÁLISIS

### Bundle Size:
```bash
# Analizar tamaño del bundle
npm run build
ls -lh dist/assets/

# Ver archivos más grandes
du -h dist/assets/* | sort -rh | head -10
```

### Dependencias:
```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar dependencias (con cuidado)
npm update

# Actualizar dependencia específica
npm update react

# Ver árbol de dependencias
npm list --all
```

---

## 🔐 SEGURIDAD

### Auditoría:
```bash
# Auditoría de seguridad
npm audit

# Fix automático de vulnerabilidades
npm audit fix

# Fix forzado (puede romper cosas)
npm audit fix --force

# Ver detalles de vulnerabilidades
npm audit --json
```

---

## 📦 GESTIÓN DE PAQUETES

### Instalar Nuevos:
```bash
# Instalar dependencia
npm install nombre-paquete

# Instalar como dev dependency
npm install -D nombre-paquete

# Instalar versión específica
npm install react@18.2.0

# Instalar globalmente
npm install -g nombre-paquete
```

### Desinstalar:
```bash
# Desinstalar paquete
npm uninstall nombre-paquete

# Desinstalar dev dependency
npm uninstall -D nombre-paquete

# Desinstalar global
npm uninstall -g nombre-paquete
```

---

## 🌐 NETWORK

### Ver Info de Red:
```bash
# Ver IP local (Linux/Mac)
ifconfig | grep "inet "

# Ver IP local (Windows)
ipconfig

# Abrir en red local
npm run dev -- --host

# Especificar host y puerto
npm run dev -- --host 0.0.0.0 --port 3000
```

---

## 📸 SCREENSHOTS Y TESTING

### Manual Testing:
```bash
# Abrir en Chrome
open -a "Google Chrome" http://localhost:5173

# Abrir en Firefox
open -a Firefox http://localhost:5173

# Abrir en Safari
open -a Safari http://localhost:5173
```

---

## 🔄 GIT (opcional)

### Comandos Básicos:
```bash
# Inicializar repo
git init

# Ver estado
git status

# Agregar archivos
git add .

# Commit
git commit -m "Mensaje"

# Ver historial
git log --oneline

# Crear branch
git checkout -b feature/nueva-funcionalidad

# Cambiar de branch
git checkout main
```

---

## 💡 TIPS RÁPIDOS

### Desarrollo:
```bash
# Abrir VS Code
code .

# Abrir proyecto en nueva ventana
code -n .

# Instalar y ejecutar en un comando
npm install && npm run dev

# Limpiar y ejecutar
rm -rf node_modules && npm install && npm run dev
```

### Producción:
```bash
# Build optimizado
NODE_ENV=production npm run build

# Preview en otro puerto
npm run preview -- --port 8080
```

---

## 🚨 COMANDOS DE EMERGENCIA

### Si nada funciona:
```bash
# 1. Limpiar todo
rm -rf node_modules package-lock.json dist

# 2. Limpiar cache npm
npm cache clean --force

# 3. Reinstalar
npm install

# 4. Build
npm run build

# 5. Ejecutar
npm run dev
```

### Si puerto ocupado:
```bash
# Matar proceso (Linux/Mac)
killall node

# Matar proceso (Windows)
taskkill /F /IM node.exe

# Ejecutar en otro puerto
npm run dev -- --port 3000
```

---

## 📚 DOCUMENTACIÓN

### Ver Documentación:
```bash
# Ver README
cat README.md

# Ver Quick Start
cat QUICK_START.md

# Ver Start
cat START.txt

# Abrir en navegador (Mac)
open README.md
```

---

## ✅ CHECKLIST RÁPIDO

```bash
# 1. Verificar Node
node -v

# 2. Instalar
npm install

# 3. Verificar
./verificar.sh  # o .\verificar.ps1

# 4. Ejecutar
npm run dev

# 5. Abrir
open http://localhost:5173
```

---

## 🎯 COMANDOS MÁS USADOS

```bash
npm install          # Instalar dependencias
npm run dev         # Desarrollo
npm run build       # Build
npm run preview     # Preview
./verificar.sh      # Verificar estado
```

---

## 🇨🇴 ¡LISTO PARA COLOMBIA! 🚀

**Comando único para iniciar:**
```bash
npm install && npm run dev
```

**URL:**
```
http://localhost:5173
```

---

*Guía de Comandos - TutorApp v1.0.0*
