# 🚀 Guía Paso a Paso: Compilar iOS con GitHub Actions

## 📋 Requisitos Previos

- ✅ Cuenta de GitHub (gratis)
- ✅ Git instalado en Windows
- ✅ Tu proyecto listo

---

## 🎯 Paso 1: Verificar que Git está configurado

### 1.1. Abrir PowerShell/Terminal en tu proyecto

```bash
# Navegar a tu proyecto
cd "C:\Users\carlo\Downloads\TutorApp (18)"
```

### 1.2. Verificar si ya tienes Git inicializado

```bash
git status
```

**Si ves errores o "not a git repository":**
```bash
# Inicializar Git
git init
```

**Si ya está inicializado, continúa al Paso 2.**

---

## 📤 Paso 2: Subir tu código a GitHub

### 2.1. Crear repositorio en GitHub

1. Ve a https://github.com/new
2. **Nombre del repositorio:** `TutorApp` (o el que prefieras)
3. **Descripción:** "TutorApp Colombia - App de Tutores"
4. **Visibilidad:** 
   - ✅ **Público** (recomendado - GitHub Actions gratis)
   - ⚠️ Privado (2000 min/mes gratis)
5. **NO marques** "Add README" (ya tienes archivos)
6. Click en **"Create repository"**

### 2.2. Conectar tu proyecto local con GitHub

**Opción A: Si NO tienes Git inicializado**

```bash
# 1. Inicializar Git
git init

# 2. Agregar todos los archivos
git add .

# 3. Hacer commit inicial
git commit -m "Initial commit - TutorApp Colombia"

# 4. Agregar el repositorio remoto (REEMPLAZA TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# 5. Cambiar rama a main
git branch -M main

# 6. Subir código
git push -u origin main
```

**Opción B: Si YA tienes Git inicializado**

```bash
# 1. Verificar estado
git status

# 2. Agregar cambios (si hay)
git add .

# 3. Commit
git commit -m "Preparar para compilación iOS"

# 4. Agregar remoto (si no lo tienes)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# 5. Subir
git push -u origin main
```

**⚠️ IMPORTANTE:** Reemplaza `TU_USUARIO` y `TU_REPO` con tus datos reales.

**Ejemplo:**
```bash
git remote add origin https://github.com/carlo123/TutorApp.git
```

---

## ✅ Paso 3: Verificar que el workflow está listo

### 3.1. Verificar que existe el archivo

El archivo `.github/workflows/ios-build.yml` ya existe en tu proyecto.

### 3.2. Verificar contenido (opcional)

```bash
# Ver el contenido del workflow
cat .github/workflows/ios-build.yml
```

**Si el archivo no existe o quieres verificar, el contenido debería ser:**

```yaml
name: Build iOS App

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch: # Permite ejecutar manualmente

jobs:
  build-ios:
    runs-on: macos-latest # Mac GRATIS en la nube
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Instalar dependencias
      run: npm ci
    
    - name: Instalar Capacitor iOS
      run: npm install @capacitor/ios
    
    - name: Build web app
      run: npm run build
    
    - name: Agregar plataforma iOS
      run: npx cap add ios || true
    
    - name: Sincronizar iOS
      run: npx cap sync ios
    
    - name: Build iOS (Xcode)
      run: |
        cd ios/App
        xcodebuild -workspace App.xcworkspace \
                   -scheme App \
                   -configuration Debug \
                   -destination 'platform=iOS Simulator,name=iPhone 14 Pro' \
                   build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: ios-build
        path: ios/App/build/
        retention-days: 7
```

---

## 🚀 Paso 4: Ejecutar el workflow

### 4.1. Ir a GitHub

1. Ve a tu repositorio en GitHub
   - URL: `https://github.com/TU_USUARIO/TU_REPO`

### 4.2. Ir a la pestaña Actions

1. Click en la pestaña **"Actions"** (arriba del repositorio)
2. Si es la primera vez, verás un mensaje de bienvenida
3. Click en **"I'll set this up myself"** o busca "Build iOS App"

### 4.3. Ejecutar el workflow manualmente

**Opción A: Ejecutar manualmente (Recomendado para primera vez)**

1. En la pestaña **"Actions"**, busca **"Build iOS App"** en el menú izquierdo
2. Click en **"Build iOS App"**
3. Click en el botón azul **"Run workflow"** (arriba a la derecha)
4. Selecciona la rama: **main** (o **master**)
5. Click en **"Run workflow"** (botón verde)

**Opción B: Automático (cada push)**

El workflow se ejecutará automáticamente cada vez que hagas:
```bash
git push
```

---

## ⏳ Paso 5: Esperar la compilación

### 5.1. Monitorear el progreso

1. Verás un círculo amarillo 🟡 que indica "in progress"
2. Click en el workflow para ver los logs en tiempo real
3. Tiempo estimado: **5-15 minutos**

### 5.2. Ver los logs

Puedes ver cada paso:
- ✅ Checkout código
- ✅ Setup Node.js
- ✅ Instalar dependencias
- ✅ Build web app
- ✅ Agregar plataforma iOS
- ✅ Sincronizar iOS
- ✅ Build iOS (Xcode)
- ✅ Upload build artifacts

**Si hay errores:**
- Los verás en rojo ❌
- Click en el paso fallido para ver detalles
- Comparte el error y te ayudo a solucionarlo

---

## 📥 Paso 6: Descargar los resultados

### 6.1. Cuando termine (check verde ✅)

1. Click en el workflow completado
2. Scroll hacia abajo
3. Busca la sección **"Artifacts"**
4. Verás **"ios-build"** con el tamaño del archivo
5. Click en **"ios-build"** para descargar

### 6.2. Contenido del archivo descargado

El archivo `.zip` contiene:
- ✅ Proyecto iOS compilado
- ✅ Listo para abrir en Xcode (si tienes acceso a Mac después)
- ✅ Build artifacts de iOS

---

## 🔧 Paso 7: Usar los resultados

### 7.1. Si tienes acceso a Mac después

1. Descomprime el `.zip`
2. Abre el proyecto en Xcode:
   ```bash
   cd ios/App
   open App.xcworkspace
   ```
3. En Xcode:
   - Product → Archive
   - Distribute App
   - Export como `.ipa`

### 7.2. Si NO tienes Mac

**Opción A: Subir a Appetize.io (Probar en navegador)**
1. Ve a https://appetize.io
2. Crea cuenta gratis (100 min/mes)
3. Sube el `.ipa` (cuando lo tengas)
4. Prueba en navegador como si fuera iPhone real

**Opción B: Mejorar el workflow para generar `.ipa`**
- Puedo ayudarte a configurar el workflow para generar `.ipa` directamente
- Requiere certificados de Apple Developer

---

## 🐛 Solución de Problemas Comunes

### Error: "Workflow not found"

**Solución:**
```bash
# Verificar que el archivo existe
ls .github/workflows/ios-build.yml

# Si no existe, créalo con el contenido del Paso 3.2
```

### Error: "npm ci failed"

**Solución:**
```bash
# Verificar que package-lock.json existe
ls package-lock.json

# Si no existe, generar:
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Error: "xcodebuild failed"

**Solución:**
- Puede ser que falten dependencias
- Revisa los logs completos
- Puedo ayudarte a ajustar el workflow

### Error: "No artifacts found"

**Solución:**
- El build puede haber fallado
- Revisa los logs
- Verifica que el path `ios/App/build/` existe

---

## 🎯 Checklist Completo

Antes de ejecutar, verifica:

- [ ] Git está inicializado (`git status` funciona)
- [ ] Código subido a GitHub
- [ ] Archivo `.github/workflows/ios-build.yml` existe
- [ ] `package-lock.json` existe (si no, ejecuta `npm install`)
- [ ] Tienes cuenta de GitHub
- [ ] Repositorio es público (para GitHub Actions gratis)

---

## 📚 Comandos Rápidos de Referencia

```bash
# Verificar estado de Git
git status

# Agregar todos los archivos
git add .

# Commit
git commit -m "Mensaje descriptivo"

# Agregar remoto (solo primera vez)
git remote add origin https://github.com/USUARIO/REPO.git

# Subir código
git push -u origin main

# Ver workflows
cat .github/workflows/ios-build.yml
```

---

## 🚀 Siguiente Paso

**Una vez que tengas el build:**

1. **Si tienes Mac:** Abre en Xcode y genera `.ipa`
2. **Si NO tienes Mac:** 
   - Usa Appetize.io para probar
   - O mejora el workflow para generar `.ipa` automáticamente

**¿Necesitas ayuda con algún paso?** Dime en qué paso estás y te guío.

---

## 💡 Tips Adicionales

1. **Cada vez que hagas cambios:**
   ```bash
   git add .
   git commit -m "Descripción de cambios"
   git push
   # El workflow se ejecutará automáticamente
   ```

2. **Ver historial de builds:**
   - Ve a Actions → Build iOS App
   - Verás todos los builds anteriores

3. **Cancelar un build:**
   - Click en el build en progreso
   - Click en "Cancel workflow"

4. **Re-ejecutar un build fallido:**
   - Click en el build fallido
   - Click en "Re-run all jobs"

---

**¿Listo para empezar?** Sigue los pasos en orden y si tienes algún problema, compártelo y te ayudo a solucionarlo.

