# 🚀 Pasos Rápidos: Subir Código desde Git Bash

## ✅ Ya tienes Git Bash abierto - Perfecto!

Sigue estos pasos **en orden** en Git Bash:

---

## 📋 PASO 1: Navegar a tu Proyecto

```bash
cd "/c/Users/carlo/Downloads/TutorApp (18)"
```

**Verificar que estás en el lugar correcto:**
```bash
ls
# Deberías ver: package.json, src/, public/, etc.
```

---

## 📋 PASO 2: Configurar Git (Solo primera vez)

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

**Verificar:**
```bash
git config --list
```

---

## 📋 PASO 3: Inicializar Git

```bash
git init
```

**Verificar:**
```bash
ls -la | grep .git
# Deberías ver: .git
```

---

## 📋 PASO 4: Agregar Archivos

```bash
# Ver qué archivos hay
git status

# Agregar todos los archivos
git add .

# Verificar qué se agregó
git status
```

---

## 📋 PASO 5: Hacer Commit

```bash
git commit -m "Initial commit - TutorApp Colombia"
```

---

## 📋 PASO 6: Crear Repositorio en GitHub

**ANTES de continuar, necesitas crear el repo:**

1. Ve a: https://github.com/new
2. **Repository name:** `TutorApp` (o el que prefieras)
3. **Description:** `TutorApp Colombia`
4. **Visibility:** ✅ **Public**
5. **NO marques:** README, .gitignore, license
6. Click **"Create repository"**

**Después de crear, GitHub te mostrará una página. NO ejecutes esos comandos todavía.**

---

## 📋 PASO 7: Conectar con GitHub

**REEMPLAZA `TU_USUARIO` y `TU_REPO` con tus datos reales:**

```bash
# Ejemplo: Si tu usuario es "carlo123" y el repo es "TutorApp":
# git remote add origin https://github.com/carlo123/TutorApp.git

git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
```

**Verificar:**
```bash
git remote -v
# Deberías ver tu URL de GitHub
```

---

## 📋 PASO 8: Crear Personal Access Token

**Necesitas esto para autenticarte:**

1. Ve a: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** `TutorApp iOS Build`
4. **Expiration:** 90 días (o el que prefieras)
5. **Select scopes:** Marca **`repo`** (todos los permisos)
6. Click **"Generate token"**
7. **⚠️ IMPORTANTE:** Copia el token AHORA (solo se muestra una vez)

---

## 📋 PASO 9: Subir Código

```bash
git push -u origin main
```

**Cuando pida:**
- **Username:** Tu usuario de GitHub
- **Password:** Pega el **Personal Access Token** (no tu contraseña normal)

---

## ✅ PASO 10: Verificar

1. Ve a tu repositorio en GitHub
2. Deberías ver todos tus archivos
3. Verifica que existe `.github/workflows/ios-build.yml`

---

## 🐛 Si hay Errores

### Error: "remote origin already exists"

```bash
# Ver el remoto actual
git remote -v

# Cambiar el remoto
git remote set-url origin https://github.com/TU_USUARIO/TU_REPO.git
```

### Error: "authentication failed"

- Asegúrate de usar el **Personal Access Token** (no tu contraseña)
- Verifica que el token tiene permisos "repo"

### Error: "package-lock.json not found"

```bash
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

---

## 📝 Comandos Completos (Copia y Pega)

```bash
# 1. Navegar
cd "/c/Users/carlo/Downloads/TutorApp (18)"

# 2. Configurar (solo primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# 3. Inicializar
git init
git add .
git commit -m "Initial commit - TutorApp Colombia"

# 4. Conectar (REEMPLAZA TU_USUARIO y TU_REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main

# 5. Subir (usarás el token como contraseña)
git push -u origin main
```

---

**¿Listo?** Ejecuta los comandos en orden. Si tienes algún problema, compártelo y te ayudo.

