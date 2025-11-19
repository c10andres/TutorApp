# 📤 Guía Paso a Paso: Subir Código a GitHub

## 🎯 Pasos Completos

---

## ✅ PASO 1: Verificar Git

### En PowerShell/Terminal:

```powershell
git --version
```

**Si ves un error:**
- Git no está instalado o no está en el PATH
- Cierra y abre PowerShell de nuevo
- O usa Git Bash (viene con Git)

---

## ✅ PASO 2: Configurar Git (Solo primera vez)

```powershell
# Configurar tu nombre
git config --global user.name "Tu Nombre"

# Configurar tu email
git config --global user.email "tu-email@ejemplo.com"
```

**Ejemplo:**
```powershell
git config --global user.name "Carlo"
git config --global user.email "carlo@ejemplo.com"
```

---

## ✅ PASO 3: Crear Repositorio en GitHub

### 3.1. Ir a GitHub

1. Ve a: https://github.com/new
2. O ejecuta:
   ```powershell
   Start-Process "https://github.com/new"
   ```

### 3.2. Configurar el Repositorio

**Configuración:**
- **Repository name:** `TutorApp` (o el que prefieras)
- **Description:** `TutorApp Colombia - App de Tutores`
- **Visibility:** ✅ **Public** (recomendado - GitHub Actions gratis)
- **NO marques:**
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license

### 3.3. Crear Repositorio

Click en **"Create repository"** (botón verde)

**⚠️ IMPORTANTE:** Después de crear, GitHub te mostrará una página con comandos. **NO los ejecutes todavía**, primero necesitas inicializar Git localmente.

---

## ✅ PASO 4: Inicializar Git en tu Proyecto

### 4.1. Navegar a tu proyecto

```powershell
# En PowerShell
cd "C:\Users\carlo\Downloads\TutorApp (18)"
```

### 4.2. Inicializar Git

```powershell
# Inicializar repositorio
git init

# Verificar que se creó
ls .git
# O en PowerShell:
Test-Path .git
```

### 4.3. Agregar todos los archivos

```powershell
# Ver qué archivos hay
git status

# Agregar todos los archivos
git add .

# Verificar qué se agregó
git status
```

### 4.4. Hacer commit inicial

```powershell
git commit -m "Initial commit - TutorApp Colombia"
```

---

## ✅ PASO 5: Conectar con GitHub

### 5.1. Agregar el remoto

**REEMPLAZA `TU_USUARIO` y `TU_REPO` con tus datos reales:**

```powershell
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
```

**Ejemplo:**
Si tu usuario es `carlo123` y el repo es `TutorApp`:
```powershell
git remote add origin https://github.com/carlo123/TutorApp.git
```

### 5.2. Cambiar rama a main

```powershell
git branch -M main
```

### 5.3. Subir código

```powershell
git push -u origin main
```

---

## ✅ PASO 6: Autenticación

Cuando ejecutes `git push`, te pedirá:

### Usuario:
- Tu usuario de GitHub

### Contraseña:
- **NO uses tu contraseña normal**
- Usa un **Personal Access Token**

### Cómo crear Personal Access Token:

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** `TutorApp iOS Build`
4. **Expiration:** Elige una fecha (90 días está bien)
5. **Select scopes:** Marca **`repo`** (todos los permisos de repositorio)
6. Click **"Generate token"**
7. **⚠️ IMPORTANTE:** Copia el token AHORA (solo se muestra una vez)
8. Úsalo como contraseña cuando Git lo pida

---

## ✅ PASO 7: Verificar que se subió

1. Ve a tu repositorio en GitHub
2. Deberías ver todos tus archivos
3. Verifica que existe `.github/workflows/ios-build.yml`

---

## 🐛 Solución de Problemas

### Error: "remote origin already exists"

**Solución:**
```powershell
# Ver el remoto actual
git remote -v

# Cambiar el remoto
git remote set-url origin https://github.com/TU_USUARIO/TU_REPO.git
```

### Error: "authentication failed"

**Solución:**
- Usa Personal Access Token (no tu contraseña)
- Cómo crear: https://github.com/settings/tokens

### Error: "package-lock.json not found"

**Solución:**
```powershell
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Error: "git no se reconoce"

**Solución:**
- Cierra y abre PowerShell de nuevo
- O usa Git Bash

---

## 📝 Comandos Completos (Copia y Pega)

```powershell
# 1. Configurar Git (solo primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# 2. Navegar al proyecto
cd "C:\Users\carlo\Downloads\TutorApp (18)"

# 3. Inicializar Git
git init

# 4. Agregar archivos
git add .

# 5. Hacer commit
git commit -m "Initial commit - TutorApp Colombia"

# 6. Conectar con GitHub (REEMPLAZA TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

---

## ✅ Checklist

Antes de subir:

- [ ] Git instalado (`git --version` funciona)
- [ ] Git configurado (nombre y email)
- [ ] Repositorio creado en GitHub
- [ ] Personal Access Token creado
- [ ] Estás en la carpeta del proyecto

---

**¿Listo?** Sigue los pasos en orden. Si tienes algún problema, compártelo y te ayudo.

