# 🐧 Guía Completa: GitHub Actions para iOS desde Linux

## 📋 Estado Actual

✅ **Lo que ya tienes:**
- Linux instalado
- Node.js y npm (probablemente)
- Workflow de iOS configurado

❌ **Lo que falta:**
- Git instalado/configurado
- Repositorio en GitHub
- Código subido a GitHub

---

## 🎯 PASO 1: Verificar/Instalar Git

### Verificar si Git está instalado:

```bash
git --version
```

### Si NO está instalado, instálalo:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install git
```

**Fedora/RHEL:**
```bash
sudo dnf install git
```

**Arch Linux:**
```bash
sudo pacman -S git
```

**Verificar instalación:**
```bash
git --version
```

---

## 🎯 PASO 2: Configurar Git (Primera vez)

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

## 🎯 PASO 3: Navegar a tu Proyecto

```bash
# Navegar a tu proyecto (ajusta la ruta según tu caso)
cd ~/Downloads/TutorApp\ \(18\)
# O si está en otra ubicación:
cd /ruta/a/tu/proyecto
```

**Verificar que estás en el lugar correcto:**
```bash
ls -la
# Deberías ver package.json, src/, etc.
```

---

## 🎯 PASO 4: Inicializar Repositorio Git

```bash
# Verificar si ya está inicializado
ls -la | grep .git

# Si no existe .git, inicializar:
git init

# Verificar que se creó
ls -la | grep .git
```

---

## 🎯 PASO 5: Agregar Archivos y Hacer Commit

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

## 🎯 PASO 6: Crear Repositorio en GitHub

### 6.1. Abrir GitHub en el navegador

```bash
# Abrir GitHub (si tienes xdg-open)
xdg-open https://github.com/new

# O si tienes otro navegador:
firefox https://github.com/new
# o
google-chrome https://github.com/new
```

O ve manualmente a: https://github.com/new

### 6.2. Configurar el Repositorio

**Configuración recomendada:**
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

## 🎯 PASO 7: Conectar con GitHub

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

**Alternativa: Usar SSH (más seguro)**

Si prefieres usar SSH en lugar de HTTPS:

```bash
# 1. Generar clave SSH (si no tienes)
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"

# 2. Agregar clave al ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. Copiar clave pública
cat ~/.ssh/id_ed25519.pub
# Copia todo el contenido

# 4. Agregar a GitHub:
# - Ve a https://github.com/settings/keys
# - Click "New SSH key"
# - Pega la clave pública
# - Click "Add SSH key"

# 5. Usar SSH en lugar de HTTPS:
git remote set-url origin git@github.com:TU_USUARIO/TU_REPO.git
git push -u origin main
```

---

## 🎯 PASO 8: Verificar que se subió

```bash
# Ver el remoto configurado
git remote -v

# Ver el último commit
git log --oneline -1
```

1. Ve a tu repositorio en GitHub
2. Deberías ver todos tus archivos
3. Verifica que existe `.github/workflows/ios-build.yml`

---

## 🎯 PASO 9: Ejecutar GitHub Actions

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
# 1. Verificar/Instalar Git
git --version
# Si no está: sudo apt install git  (o según tu distro)

# 2. Configurar Git (solo primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# 3. Navegar al proyecto
cd ~/Downloads/TutorApp\ \(18\)
# O la ruta donde esté tu proyecto

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

## 🐛 Solución de Problemas en Linux

### Error: "git: command not found"

**Solución:**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install git

# Fedora
sudo dnf install git

# Arch
sudo pacman -S git
```

### Error: "Permission denied (publickey)"

**Solución:**
- Usa HTTPS en lugar de SSH, o
- Configura SSH keys correctamente

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
- O configura SSH keys

### Error: "package-lock.json not found"

**Solución:**
```bash
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

---

## 💡 Tips para Linux

1. **Usar alias útiles:**
   ```bash
   # Agregar a ~/.bashrc o ~/.zshrc
   alias gs='git status'
   alias ga='git add .'
   alias gc='git commit -m'
   alias gp='git push'
   ```

2. **Ver historial de commits:**
   ```bash
   git log --oneline --graph --all
   ```

3. **Ver cambios antes de commit:**
   ```bash
   git diff
   ```

4. **Deshacer cambios:**
   ```bash
   git restore archivo.txt  # Deshacer cambios en un archivo
   git restore .            # Deshacer todos los cambios
   ```

---

## 🔐 Configurar SSH (Opcional pero Recomendado)

Si quieres evitar escribir contraseña cada vez:

```bash
# 1. Generar clave SSH
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
# Presiona Enter para usar ubicación por defecto
# Opcional: agrega una frase de contraseña

# 2. Iniciar ssh-agent
eval "$(ssh-agent -s)"

# 3. Agregar clave
ssh-add ~/.ssh/id_ed25519

# 4. Copiar clave pública
cat ~/.ssh/id_ed25519.pub
# Copia todo el output

# 5. Agregar a GitHub:
# - https://github.com/settings/keys
# - New SSH key
# - Pega la clave
# - Add SSH key

# 6. Cambiar remoto a SSH
git remote set-url origin git@github.com:TU_USUARIO/TU_REPO.git

# 7. Probar conexión
ssh -T git@github.com
# Deberías ver: "Hi TU_USUARIO! You've successfully authenticated..."
```

---

## 📋 Checklist Completo

Antes de ejecutar GitHub Actions:

- [ ] Git instalado (`git --version` funciona)
- [ ] Git configurado (nombre y email)
- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub (`git push` exitoso)
- [ ] Personal Access Token creado (o SSH configurado)
- [ ] Archivo `.github/workflows/ios-build.yml` existe
- [ ] `package-lock.json` existe

---

## 🚀 Siguiente Paso

Una vez que tengas el build de GitHub Actions:

1. **Si tienes Mac:** Abre en Xcode y genera `.ipa`
2. **Si NO tienes Mac:** 
   - Sube a Appetize.io para probar
   - O mejora el workflow para generar `.ipa` automáticamente

---

**¿Listo?** Sigue los pasos en orden. Si tienes algún problema, compártelo y te ayudo a solucionarlo.

