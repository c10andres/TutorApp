# 🚀 Guía Completa: Instalar Git y Usar GitHub Actions para iOS

## 📋 Paso 0: Instalar Git (Si no lo tienes)

### Opción A: Instalador Visual (Recomendado)

1. **Descargar Git:**
   - Ve a: https://git-scm.com/download/win
   - Click en "Download for Windows"
   - Se descargará `Git-2.x.x-64-bit.exe`

2. **Instalar Git:**
   - Ejecuta el instalador descargado
   - Click "Next" en todas las pantallas (configuración por defecto está bien)
   - **Importante:** Marca "Add Git to PATH" si aparece la opción
   - Click "Install"
   - Espera a que termine

3. **Verificar instalación:**
   - Abre PowerShell NUEVO (cierra y abre de nuevo)
   - Ejecuta:
   ```bash
   git --version
   ```
   - Deberías ver algo como: `git version 2.42.0`

### Opción B: Con Chocolatey (Si lo tienes)

```bash
choco install git
```

### Opción C: Con Winget (Windows 10/11)

```bash
winget install --id Git.Git -e --source winget
```

---

## 🎯 Paso 1: Configurar Git (Primera vez)

### 1.1. Configurar tu nombre y email

```bash
# Reemplaza con tu nombre y email real
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

**Ejemplo:**
```bash
git config --global user.name "Carlo"
git config --global user.email "carlo@ejemplo.com"
```

### 1.2. Verificar configuración

```bash
git config --list
```

---

## 📤 Paso 2: Subir tu proyecto a GitHub

### 2.1. Crear repositorio en GitHub

1. Ve a https://github.com/new
2. **Nombre:** `TutorApp` (o el que prefieras)
3. **Descripción:** "TutorApp Colombia"
4. **Visibilidad:** 
   - ✅ **Público** (recomendado - GitHub Actions gratis)
5. **NO marques** "Add README", "Add .gitignore", ni "Choose a license"
6. Click **"Create repository"**

### 2.2. Inicializar Git en tu proyecto

Abre PowerShell en tu proyecto:

```bash
# 1. Navegar a tu proyecto
cd "C:\Users\carlo\Downloads\TutorApp (18)"

# 2. Inicializar Git
git init

# 3. Agregar todos los archivos
git add .

# 4. Hacer commit inicial
git commit -m "Initial commit - TutorApp Colombia"
```

### 2.3. Conectar con GitHub

**IMPORTANTE:** Reemplaza `TU_USUARIO` y `TU_REPO` con tus datos reales.

```bash
# Agregar el repositorio remoto
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Cambiar rama a main
git branch -M main

# Subir código
git push -u origin main
```

**Ejemplo real:**
Si tu usuario es `carlo123` y el repo es `TutorApp`:
```bash
git remote add origin https://github.com/carlo123/TutorApp.git
git branch -M main
git push -u origin main
```

**Si te pide usuario y contraseña:**
- Usuario: Tu usuario de GitHub
- Contraseña: Usa un **Personal Access Token** (no tu contraseña normal)

**Cómo crear Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Marca "repo" (todos los permisos de repositorio)
4. Generate token
5. **Copia el token** (solo se muestra una vez)
6. Úsalo como contraseña cuando Git lo pida

---

## ✅ Paso 3: Verificar que el workflow está listo

El archivo `.github/workflows/ios-build.yml` ya existe en tu proyecto.

**Verificar:**
```bash
# Ver si existe
dir .github\workflows\ios-build.yml
```

Si no existe, créalo manualmente o avísame y te ayudo.

---

## 🚀 Paso 4: Ejecutar GitHub Actions

### 4.1. Ir a tu repositorio en GitHub

1. Ve a: `https://github.com/TU_USUARIO/TU_REPO`
2. Click en la pestaña **"Actions"** (arriba)

### 4.2. Ejecutar el workflow

1. En el menú izquierdo, busca **"Build iOS App"**
2. Click en **"Build iOS App"**
3. Click en el botón azul **"Run workflow"** (arriba a la derecha)
4. Selecciona rama: **main**
5. Click en **"Run workflow"** (verde)

### 4.3. Esperar la compilación

- Verás un círculo amarillo 🟡 "in progress"
- Tiempo: **5-15 minutos**
- Puedes ver los logs en tiempo real

### 4.4. Descargar resultados

Cuando termine (check verde ✅):

1. Click en el workflow completado
2. Scroll hacia abajo
3. Busca **"Artifacts"**
4. Click en **"ios-build"** para descargar

---

## 🎯 Resumen de Comandos (Copia y Pega)

```bash
# 1. Configurar Git (solo primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# 2. En tu proyecto
cd "C:\Users\carlo\Downloads\TutorApp (18)"
git init
git add .
git commit -m "Initial commit"

# 3. Conectar con GitHub (REEMPLAZA TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

---

## 🐛 Solución de Problemas

### Error: "git no se reconoce"

**Solución:**
- Instala Git (Paso 0)
- Cierra y abre PowerShell de nuevo
- Verifica: `git --version`

### Error: "remote origin already exists"

**Solución:**
```bash
# Ver el remoto actual
git remote -v

# Cambiar el remoto
git remote set-url origin https://github.com/TU_USUARIO/TU_REPO.git
```

### Error: "authentication failed"

**Solución:**
- Usa Personal Access Token en lugar de contraseña
- Cómo crear token: GitHub → Settings → Developer settings → Personal access tokens

### Error: "package-lock.json not found"

**Solución:**
```bash
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

---

## 📚 Recursos

- **Descargar Git:** https://git-scm.com/download/win
- **Crear Personal Access Token:** https://github.com/settings/tokens
- **GitHub Actions Docs:** https://docs.github.com/en/actions

---

## ✅ Checklist

Antes de ejecutar GitHub Actions:

- [ ] Git instalado (`git --version` funciona)
- [ ] Git configurado (nombre y email)
- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub (`git push` exitoso)
- [ ] Archivo `.github/workflows/ios-build.yml` existe
- [ ] `package-lock.json` existe (si no, ejecuta `npm install`)

---

**¿Listo?** Sigue los pasos en orden. Si tienes algún problema, compártelo y te ayudo.

