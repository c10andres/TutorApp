# 🐚 Guía: Usar Git Bash para GitHub Actions

## 🚀 Paso 1: Abrir Git Bash

1. Busca **"Git Bash"** en el menú de inicio de Windows
2. Ábrelo (verás una terminal negra con texto verde)
3. Navega a tu proyecto:

```bash
cd /c/Users/carlo/Downloads/TutorApp\ \(18\)
```

**Nota:** En Git Bash:
- Las rutas usan `/` en lugar de `\`
- Los espacios en nombres de carpetas necesitan `\` antes del espacio
- O puedes usar comillas: `cd "/c/Users/carlo/Downloads/TutorApp (18)"`

---

## ✅ Paso 2: Verificar que Git funciona

```bash
git --version
```

Deberías ver: `git version 2.x.x`

---

## ⚙️ Paso 3: Configurar Git (Solo primera vez)

```bash
# Configurar tu nombre
git config --global user.name "Tu Nombre"

# Configurar tu email
git config --global user.email "tu-email@ejemplo.com"
```

**Ejemplo:**
```bash
git config --global user.name "Carlo"
git config --global user.email "carlo@ejemplo.com"
```

**Verificar configuración:**
```bash
git config --list
```

---

## 📦 Paso 4: Inicializar el Repositorio

```bash
# Verificar si ya está inicializado
ls -la | grep .git

# Si no existe .git, inicializar:
git init

# Verificar que se creó
ls -la | grep .git
```

---

## 📋 Paso 5: Agregar Archivos y Hacer Commit

```bash
# Ver estado actual
git status

# Agregar todos los archivos
git add .

# Ver qué se agregó
git status

# Hacer commit inicial
git commit -m "Initial commit - TutorApp Colombia - Preparado para iOS"
```

---

## 🔗 Paso 6: Crear Repositorio en GitHub

### 6.1. Abrir GitHub en el navegador

```bash
# Abrir GitHub en el navegador
start https://github.com/new
```

O ve manualmente a: https://github.com/new

### 6.2. Configurar el Repositorio

**Configuración:**
- **Repository name:** `TutorApp` (o el que prefieras)
- **Description:** `TutorApp Colombia`
- **Visibility:** ✅ **Public** (para GitHub Actions gratis)
- **NO marques:**
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license

### 6.3. Crear Repositorio

Click en **"Create repository"**

---

## 📤 Paso 7: Conectar con GitHub

### 7.1. GitHub te mostrará comandos

Después de crear el repo, GitHub mostrará una página con comandos.

**O usa estos comandos (REEMPLAZA con tus datos):**

```bash
# Reemplaza TU_USUARIO y TU_REPO con tus datos reales
# Ejemplo: Si tu usuario es "carlo123" y el repo es "TutorApp":
# git remote add origin https://github.com/carlo123/TutorApp.git

git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### 7.2. Autenticación

Cuando ejecutes `git push`, te pedirá:
- **Username:** Tu usuario de GitHub
- **Password:** **NO uses tu contraseña normal**

**Usa un Personal Access Token:**

#### Cómo crear Personal Access Token:

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** `TutorApp iOS Build`
4. **Expiration:** Elige una fecha (90 días está bien)
5. **Select scopes:** Marca **`repo`** (todos los permisos)
6. Click **"Generate token"**
7. **⚠️ IMPORTANTE:** Copia el token AHORA (solo se muestra una vez)
8. Úsalo como contraseña cuando Git lo pida

---

## ✅ Paso 8: Verificar que se subió

1. Ve a tu repositorio en GitHub
2. Deberías ver todos tus archivos
3. Verifica que existe `.github/workflows/ios-build.yml`

---

## 🚀 Paso 9: Ejecutar GitHub Actions

### 9.1. Ir a Actions

1. En tu repositorio de GitHub
2. Click en la pestaña **"Actions"**

### 9.2. Ejecutar el Workflow

1. En el menú izquierdo, busca **"Build iOS App"**
2. Click en **"Build iOS App"**
3. Click en **"Run workflow"** (botón azul arriba)
4. Selecciona rama: **main**
5. Click en **"Run workflow"** (verde)

### 9.3. Esperar y Descargar

- Espera 5-15 minutos
- Cuando termine (check verde ✅), descarga los artefactos

---

## 📝 Comandos Completos (Copia y Pega)

```bash
# 1. Navegar al proyecto
cd "/c/Users/carlo/Downloads/TutorApp (18)"

# 2. Verificar Git
git --version

# 3. Configurar Git (solo primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# 4. Inicializar repositorio
git init

# 5. Agregar archivos
git add .

# 6. Hacer commit
git commit -m "Initial commit - TutorApp Colombia"

# 7. Conectar con GitHub (REEMPLAZA TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

---

## 🐛 Solución de Problemas en Git Bash

### Error: "cd: no such file or directory"

**Solución:**
```bash
# Usa comillas para rutas con espacios
cd "/c/Users/carlo/Downloads/TutorApp (18)"

# O escapa los espacios
cd /c/Users/carlo/Downloads/TutorApp\ \(18\)
```

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
- Usa Personal Access Token (no tu contraseña)
- Cómo crear: https://github.com/settings/tokens

---

## 💡 Tips para Git Bash

1. **Copiar texto:** Click derecho → Copy
2. **Pegar texto:** Click derecho → Paste (o Shift+Insert)
3. **Limpiar pantalla:** `clear` o `Ctrl+L`
4. **Ver historial:** Flechas arriba/abajo
5. **Autocompletar:** Tab

---

**¿Listo?** Abre Git Bash y sigue los pasos. Si tienes algún problema, avísame.

