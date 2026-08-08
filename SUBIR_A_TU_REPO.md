# 🚀 Subir Código a tu Repositorio

## ✅ Tu Repositorio

**URL:** https://github.com/c10andres/TutorApp.git

**Estado:** Vacío (listo para recibir código)

---

## 📋 Comandos Exactos para Git Bash

Ejecuta estos comandos **en orden** en Git Bash:

### 1. Navegar al proyecto:

```bash
cd "/c/Users/carlo/Downloads/TutorApp (18)"
```

### 2. Configurar Git (solo primera vez):

```bash
git config --global user.name "c10andres"
git config --global user.email "tu-email@ejemplo.com"
```

**Reemplaza `tu-email@ejemplo.com` con tu email real de GitHub.**

### 3. Inicializar Git:

```bash
git init
```

### 4. Agregar todos los archivos:

```bash
git add .
```

### 5. Hacer commit:

```bash
git commit -m "Initial commit - TutorApp Colombia"
```

### 6. Conectar con tu repositorio:

```bash
git remote add origin https://github.com/c10andres/TutorApp.git
git branch -M main
```

### 7. Subir código:

```bash
git push -u origin main
```

**Cuando pida contraseña:**
- **Username:** `c10andres`
- **Password:** Tu **Personal Access Token** (no tu contraseña normal)

---

## 🔐 Crear Personal Access Token

Si aún no tienes el token:

1. Ve a: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** `TutorApp iOS Build`
4. **Expiration:** 90 días (o el que prefieras)
5. **Select scopes:** Marca **`repo`** (todos los permisos)
6. Click **"Generate token"**
7. **⚠️ IMPORTANTE:** Copia el token AHORA (solo se muestra una vez)
8. Úsalo como contraseña cuando Git lo pida

---

## ✅ Verificar que se subió

Después de `git push`, ve a:
- https://github.com/c10andres/TutorApp

Deberías ver:
- ✅ Todos tus archivos
- ✅ `.github/workflows/ios-build.yml` existe
- ✅ El repositorio ya no está vacío

---

## 🐛 Si hay Errores

### Error: "remote origin already exists"

```bash
# Ver el remoto actual
git remote -v

# Cambiar el remoto
git remote set-url origin https://github.com/c10andres/TutorApp.git
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

## 📝 Resumen de Comandos (Copia y Pega)

```bash
cd "/c/Users/carlo/Downloads/TutorApp (18)"
git config --global user.name "c10andres"
git config --global user.email "tu-email@ejemplo.com"
git init
git add .
git commit -m "Initial commit - TutorApp Colombia"
git remote add origin https://github.com/c10andres/TutorApp.git
git branch -M main
git push -u origin main
```

---

**¿Listo?** Ejecuta los comandos en Git Bash. Si tienes algún problema, avísame.

