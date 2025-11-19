# 🚀 Guía Completa Paso a Paso: GitHub Actions para iOS

## 📋 Estado Actual de tu Proyecto

✅ **Lo que ya tienes:**
- Node.js instalado (v20.19.5)
- npm instalado (11.6.1)
- Workflow de iOS configurado (`.github/workflows/ios-build.yml`)
- package-lock.json existe

❌ **Lo que falta:**
- Git instalado
- Git inicializado
- Repositorio en GitHub
- Código subido a GitHub

---

## 🎯 PASO 1: Instalar Git

### Opción A: Instalador Visual (Recomendado)

1. **Descargar Git:**
   - Ve a: https://git-scm.com/download/win
   - O ejecuta este comando en PowerShell:
   ```powershell
   Start-Process "https://git-scm.com/download/win"
   ```

2. **Instalar:**
   - Ejecuta el instalador descargado
   - Click "Next" en todas las pantallas
   - **IMPORTANTE:** Si aparece "Add Git to PATH", márcalo
   - Click "Install"
   - Espera a que termine

3. **Verificar:**
   - **CIERRA y ABRE PowerShell de nuevo** (importante)
   - Ejecuta:
   ```powershell
   git --version
   ```
   - Deberías ver: `git version 2.x.x`

### Opción B: Con Winget (Windows 10/11)

```powershell
winget install --id Git.Git -e --source winget
```

Luego cierra y abre PowerShell de nuevo.

---

## 🎯 PASO 2: Ejecutar Script de Configuración

He creado un script que te ayuda con todo. Ejecútalo:

```powershell
# En PowerShell, en tu proyecto
cd "C:\Users\carlo\Downloads\TutorApp (18)"
.\setup-github-ios.ps1
```

El script te guiará paso a paso:
- ✅ Verificará si Git está instalado
- ✅ Te ayudará a configurarlo
- ✅ Inicializará el repositorio
- ✅ Preparará todo para GitHub

---

## 🎯 PASO 3: Configurar Git Manualmente (Si prefieres)

Si prefieres hacerlo manualmente:

```powershell
# 1. Configurar tu nombre y email
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# 2. Inicializar repositorio
git init

# 3. Agregar todos los archivos
git add .

# 4. Hacer commit
git commit -m "Initial commit - TutorApp Colombia"
```

---

## 🎯 PASO 4: Crear Repositorio en GitHub

### 4.1. Ir a GitHub

1. Ve a: https://github.com/new
2. O ejecuta:
   ```powershell
   Start-Process "https://github.com/new"
   ```

### 4.2. Configurar el Repositorio

**Configuración recomendada:**
- **Repository name:** `TutorApp` (o el nombre que prefieras)
- **Description:** `TutorApp Colombia - App de Tutores`
- **Visibility:** 
  - ✅ **Public** (recomendado - GitHub Actions gratis ilimitado)
  - ⚠️ Private (2000 min/mes gratis)
- **NO marques:**
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license

### 4.3. Crear Repositorio

Click en **"Create repository"** (botón verde)

---

## 🎯 PASO 5: Conectar tu Proyecto con GitHub

### 5.1. GitHub te mostrará comandos

Después de crear el repo, GitHub mostrará una página con comandos.

**O usa estos comandos (REEMPLAZA con tus datos):**

```powershell
# Reemplaza TU_USUARIO y TU_REPO con tus datos reales
# Ejemplo: Si tu usuario es "carlo123" y el repo es "TutorApp":
# git remote add origin https://github.com/carlo123/TutorApp.git

git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### 5.2. Autenticación

Cuando ejecutes `git push`, te pedirá:
- **Username:** Tu usuario de GitHub
- **Password:** **NO uses tu contraseña normal**

**Usa un Personal Access Token:**

#### Cómo crear Personal Access Token:

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** `TutorApp iOS Build`
4. **Expiration:** Elige una fecha (90 días está bien)
5. **Select scopes:** Marca **`repo`** (todos los permisos de repositorio)
6. Click **"Generate token"**
7. **⚠️ IMPORTANTE:** Copia el token AHORA (solo se muestra una vez)
8. Úsalo como contraseña cuando Git lo pida

---

## 🎯 PASO 6: Verificar que se subió correctamente

1. Ve a tu repositorio en GitHub
2. Deberías ver todos tus archivos
3. Verifica que existe `.github/workflows/ios-build.yml`

---

## 🎯 PASO 7: Ejecutar GitHub Actions

### 7.1. Ir a Actions

1. En tu repositorio de GitHub
2. Click en la pestaña **"Actions"** (arriba)

### 7.2. Ejecutar el Workflow

1. En el menú izquierdo, busca **"Build iOS App"**
2. Click en **"Build iOS App"**
3. Click en el botón azul **"Run workflow"** (arriba a la derecha)
4. Selecciona rama: **main**
5. Click en **"Run workflow"** (botón verde)

### 7.3. Monitorear el Progreso

- Verás un círculo amarillo 🟡 "in progress"
- Click en el workflow para ver logs en tiempo real
- Tiempo estimado: **5-15 minutos**

### 7.4. Descargar Resultados

Cuando termine (check verde ✅):

1. Click en el workflow completado
2. Scroll hacia abajo
3. Busca la sección **"Artifacts"**
4. Verás **"ios-build"** con el tamaño
5. Click en **"ios-build"** para descargar

---

## 🐛 Solución de Problemas

### Error: "git no se reconoce"

**Solución:**
1. Instala Git (Paso 1)
2. **Cierra y abre PowerShell de nuevo**
3. Verifica: `git --version`

### Error: "authentication failed"

**Solución:**
- Usa Personal Access Token (no tu contraseña)
- Cómo crear: https://github.com/settings/tokens

### Error: "remote origin already exists"

**Solución:**
```powershell
# Ver el remoto actual
git remote -v

# Cambiar el remoto
git remote set-url origin https://github.com/TU_USUARIO/TU_REPO.git
```

### Error: "package-lock.json not found"

**Solución:**
```powershell
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Error en GitHub Actions: "npm ci failed"

**Solución:**
- Asegúrate de que `package-lock.json` existe
- Si no, ejecuta `npm install` y haz commit

---

## 📋 Checklist Completo

Antes de ejecutar GitHub Actions:

- [ ] Git instalado (`git --version` funciona)
- [ ] Git configurado (nombre y email)
- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub (`git push` exitoso)
- [ ] Personal Access Token creado
- [ ] Archivo `.github/workflows/ios-build.yml` existe
- [ ] `package-lock.json` existe

---

## 🚀 Comandos Rápidos (Copia y Pega)

```powershell
# 1. Configurar Git (solo primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# 2. En tu proyecto
cd "C:\Users\carlo\Downloads\TutorApp (18)"
git init
git add .
git commit -m "Initial commit - TutorApp Colombia"

# 3. Conectar con GitHub (REEMPLAZA TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

---

## 💡 Tips

1. **Cada vez que hagas cambios:**
   ```powershell
   git add .
   git commit -m "Descripción de cambios"
   git push
   # El workflow se ejecutará automáticamente
   ```

2. **Ver historial de builds:**
   - Actions → Build iOS App
   - Verás todos los builds anteriores

3. **Re-ejecutar un build:**
   - Click en el build
   - Click en "Re-run all jobs"

---

## 🎯 Siguiente Paso Después del Build

Una vez que tengas el build:

1. **Si tienes Mac:** Abre en Xcode y genera `.ipa`
2. **Si NO tienes Mac:** 
   - Sube a Appetize.io para probar
   - O mejora el workflow para generar `.ipa` automáticamente

---

**¿Listo para empezar?** Sigue los pasos en orden. Si tienes algún problema, compártelo y te ayudo a solucionarlo.

